// Internal alert emails. Enquiries and partner requests go to the growth inbox;
// job applications go to the careers inbox. Sending turns on once an email
// domain is configured; until then this is a safe no-op (data is still stored).
export type AlertKind = "contact" | "application" | "partner";

const RECIPIENTS: Record<AlertKind, string> = {
  contact: "growth@macrowdigital.com",
  partner: "growth@macrowdigital.com",
  application: "career@macrowdigital.com",
};

const SUBJECTS: Record<AlertKind, string> = {
  contact: "New enquiry — Macrow Digital website",
  partner: "New partnership request — Macrow Digital website",
  application: "New job application — Macrow Digital website",
};

export async function sendSubmissionAlert(kind: AlertKind, summary: string): Promise<{ sent: boolean }> {
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["EMAIL_FROM"];
  if (!apiKey || !from) return { sent: false };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ from, to: [RECIPIENTS[kind]], subject: SUBJECTS[kind], text: summary }),
  });
  return { sent: response.ok };
}
