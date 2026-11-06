import { createFileRoute } from "@tanstack/react-router";
import { PolicyContent } from "@/components/policy-content";
import { metadata } from "@/lib/site-data";
export const Route = createFileRoute("/privacy")({ head: () => metadata("Privacy Policy — Macrow Digital", "How Macrow Digital handles enquiries, applications, personal information and privacy choices.", "/privacy"), component: () => <PolicyContent /> });