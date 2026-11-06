export type ServiceItem = { id: string; title: string; desc: string; services: readonly string[]; pillar: string };

export const serviceGroups = [
  ["Digital", "Demand, distribution and measurement built as one system instead of disconnected campaigns", [
    ["digital-strategy", "Strategy & Planning", "The market, audience, offer and channel mix — decided before spend starts.", ["Digital Strategy", "Brand Strategy", "Website Strategy", "Growth Marketing"]],
    ["performance-marketing", "Performance Marketing", "Paid acquisition managed against pipeline and revenue, not impressions.", ["Google Ads", "Meta Ads", "Lead Generation", "Conversion Rate Optimization"]],
    ["search", "Search", "Compounding organic visibility across markets and languages.", ["SEO", "Local SEO", "International SEO", "Content Marketing"]],
    ["audience-community", "Audience & Community", "Presence that builds recall between buying cycles.", ["Social Media Marketing", "Influencer Marketing", "Reputation Management", "Email Marketing"]],
    ["lifecycle-data", "Lifecycle & Data", "What happens after the click decides what the click was worth.", ["Marketing Automation", "Analytics & Reporting", "CRM Journeys", "Attribution Setup"]],
  ]],
  ["Marcomm", "One clear story, expressed consistently across every audience, format and market", [
    ["brand", "Brand", "Positioning, identity and the rules that keep it coherent.", ["Brand Strategy", "Brand Identity", "Corporate Branding", "Employer & Personal Branding"]],
    ["creative", "Creative", "Ideas built to work in market, not only in a presentation.", ["Creative Strategy", "Creative Design", "Campaign Development", "Advertising"]],
    ["content-copy", "Content & Copy", "Language that explains a complex business simply.", ["Content Strategy", "Copywriting", "Visual Communication", "Presentation Design"]],
    ["production", "Production", "Film, motion and design output at the volume modern channels demand.", ["Video Production", "Motion Graphics", "Social Media Creative", "Packaging"]],
    ["corporate-communication", "Corporate Communication", "Internal, product and stakeholder communication with one voice.", ["Corporate Communication", "Product Communication", "Influencer & Creator Campaigns"]],
  ]],
  ["Technology", "Products, platforms and automation that hold up as the business grows", [
    ["product-experience", "Product & Experience", "Interfaces designed around the decision a user is trying to make.", ["UI/UX Design", "Product Design", "MVP Development", "Design Systems"]],
    ["web-applications", "Web & Applications", "Fast, accessible, search-ready builds — from marketing sites to SaaS.", ["Website Development", "Web Applications", "SaaS Development", "Mobile Applications"]],
    ["business-systems", "Business Systems", "The operational backbone: who owns what, and what runs automatically.", ["CRM & ERP", "HRMS Solutions", "Business Automation", "Custom Software"]],
    ["ai", "AI", "Applied where it removes real work — not as a label.", ["AI Solutions", "AI Integration", "AI Agents", "Data & Analytics"]],
    ["platform-assurance", "Platform & Assurance", "Infrastructure, security and support that keep it all running.", ["Cloud & DevOps", "Cybersecurity", "API Development", "Technology Consulting"]],
  ]],
] as const;

export const allServices: ServiceItem[] = serviceGroups.flatMap(([pillar, , items]) =>
  items.map(([id, title, desc, services]) => ({ id, title, desc, services, pillar })),
);

export const findService = (id: string) => allServices.find((s) => s.id === id);
