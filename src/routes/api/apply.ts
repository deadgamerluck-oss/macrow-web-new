import { createFileRoute } from "@tanstack/react-router";
import { applicationSchema } from "@/lib/content-schemas";
import { consumeServerRateLimit, getTrustedClientIp } from "@/lib/rate-limit.server";

const MAX_REQUEST_BYTES = 8 * 1024 * 1024 + 64 * 1024;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

async function readBoundedBody(request: Request): Promise<Uint8Array | null> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_REQUEST_BYTES) return null;
  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_REQUEST_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

function validFileSignature(ext: string, bytes: Uint8Array): boolean {
  if (ext === "pdf") return new TextDecoder().decode(bytes.subarray(0, 5)) === "%PDF-";
  if (ext === "doc") {
    return [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1].every((b, i) => bytes[i] === b);
  }
  return ext === "docx" && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

const ALLOWED_ORIGINS = new Set([
  "https://macrowdigital.com",
  "https://www.macrowdigital.com",
  "https://test.macrowdigital.com",
]);

function isAllowedOrigin(origin: string | null, requestUrl: URL): boolean {
  if (!origin) return false;
  if (origin === requestUrl.origin) return true;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  // In development, allow localhost/127.0.0.1
  if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) return true;
  return false;
}

async function handleApplication(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if ((origin && !isAllowedOrigin(origin, url)) || fetchSite === "cross-site") {
    return json(403, "Request origin is not allowed.");
  }
  if (process.env["NODE_ENV"] === "production" && !origin) {
    return json(403, "Request origin is not allowed.");
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data")) {
    return json(415, "Please submit the application form.");
  }

  const ip = getTrustedClientIp(request);
  if (!ip && process.env["NODE_ENV"] === "production") {
    return json(503, "Applications are temporarily unavailable.");
  }
  const clientIp = ip ?? "127.0.0.1";
  if (!(await consumeServerRateLimit("public-submission", clientIp, 20))) {
    return json(429, "Too many requests. Please try again later.");
  }

  const bytes = await readBoundedBody(request);
  if (!bytes) return json(413, "The application or resume is too large.");

  let form: FormData;
  try {
    const boundedRequest = new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: bytes,
    });
    form = await boundedRequest.formData();
  } catch {
    return json(400, "Invalid application form.");
  }

  const validation = applicationSchema.safeParse({
    full_name: String(form.get("full-name") ?? ""),
    email: String(form.get("email") ?? ""),
    phone: String(form.get("phone") ?? ""),
    message: String(form.get("message") ?? ""),
  });
  if (!validation.success) return json(400, "Please check your name, email, phone and message.");

  const resume = form.get("resume");
  if (!(resume instanceof File) || resume.size === 0 || resume.size > MAX_FILE_BYTES) {
    return json(400, "Choose a PDF, DOC or DOCX resume no larger than 8MB.");
  }
  const extension = resume.name.split(".").pop()?.toLowerCase() ?? "";
  if (!/^(pdf|doc|docx)$/.test(extension)) return json(400, "Unsupported resume file type.");
  const fileBytes = new Uint8Array(await resume.slice(0, 8).arrayBuffer());
  if (!validFileSignature(extension, fileBytes)) return json(400, "The resume file does not match its extension.");

  const roleId = String(form.get("role") ?? "");
  if (roleId && !UUID.test(roleId)) return json(400, "Please choose a valid open role.");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let roleTitle = "General application";
  if (roleId) {
    const { data: role, error } = await supabaseAdmin
      .from("job_openings")
      .select("id, title")
      .eq("id", roleId)
      .eq("is_open", true)
      .maybeSingle();
    if (error || !role) return json(400, "That role is no longer open. Refresh the page and try again.");
    roleTitle = role.title;
  }

  const resumePath = `${crypto.randomUUID()}.${extension}`;
  const contentType = extension === "pdf" ? "application/pdf" : extension === "doc" ? "application/msword" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const { error: uploadError } = await supabaseAdmin.storage.from("resumes").upload(resumePath, resume, {
    upsert: false,
    contentType,
  });
  if (uploadError) return json(503, "Your resume could not be saved. Please try again.");

  const applicant = validation.data;
  const { error: insertError } = await supabaseAdmin.from("job_applications").insert({
    role_title: roleTitle,
    job_opening_id: roleId || null,
    full_name: applicant.full_name,
    email: applicant.email.toLowerCase(),
    phone: applicant.phone || null,
    message: applicant.message || null,
    resume_path: resumePath,
  });
  if (insertError) {
    await supabaseAdmin.storage.from("resumes").remove([resumePath]);
    return json(503, "Your application could not be saved. Please try again.");
  }

  try {
    const { sendSubmissionAlert } = await import("@/lib/notify.server");
    if (await consumeServerRateLimit("submission-alert", clientIp, 8)) {
      await sendSubmissionAlert("application", `${applicant.full_name} (${applicant.email}) applied for ${roleTitle}.`);
    }
  } catch (error) {
    console.error("application alert failed", error);
  }
  return Response.json({ saved: true });
}

export const Route = createFileRoute("/api/apply")({
  server: { handlers: { POST: ({ request }) => handleApplication(request) } },
});
