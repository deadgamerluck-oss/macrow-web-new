import { createFileRoute } from "@tanstack/react-router";
import { PolicyContent } from "@/components/policy-content";
import { metadata } from "@/lib/site-data";
export const Route = createFileRoute("/cookies")({ head: () => metadata("Cookie Policy — Macrow Digital", "Review essential browser storage and manage your optional cookie preferences at Macrow Digital.", "/cookies"), component: () => <PolicyContent cookies /> });