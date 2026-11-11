export const SITE_URL = "https://macrowdigital.com";

// TODO(owner): confirm real mobile number and social profile URLs.
export const CONTACT = {
  email: "growth@macrowdigital.com",
  careersEmail: "career@macrowdigital.com",
  phoneDisplay: "+91 98757 27067",
  phoneTel: "+91 98757 27067",
} as const;
export const SOCIALS = [
  ["Instagram", "https://www.instagram.com/macrowdigital/"],
  ["Facebook", "https://www.facebook.com/macrowdigital/"],
  ["LinkedIn", "https://www.linkedin.com/company/macrow-digital/"],
] as const;

export const roles = [
  ["Business Development Manager", "Digital"],
  ["Senior Video Editor", "Marcomm"],
  ["Senior Motion Graphic Designer", "Marcomm"],
] as const;

export const pillarMenu = [
  {
    name: "Digital",
    tagline: "How the market finds you",
    items: [
      ["Strategy & Planning", "digital-strategy"],
      ["Performance Marketing", "performance-marketing"],
      ["Search (SEO & AEO)", "search"],
      ["Audience & Community", "audience-community"],
      ["Lifecycle & Data", "lifecycle-data"],
    ],
  },
  {
    name: "Marcomm",
    tagline: "How the market understands you",
    items: [
      ["Brand", "brand"],
      ["Creative", "creative"],
      ["Content & Copy", "content-copy"],
      ["Production", "production"],
      ["Corporate Communication", "corporate-communication"],
    ],
  },
  {
    name: "Technology",
    tagline: "How the business actually runs",
    items: [
      ["Product & Experience", "product-experience"],
      ["Web & Applications", "web-applications"],
      ["Business Systems", "business-systems"],
      ["AI", "ai"],
      ["Platform & Assurance", "platform-assurance"],
    ],
  },
] as const;

export const serviceLinks: (readonly [string, string])[] = pillarMenu.flatMap(
  (p) => [...p.items] as (readonly [string, string])[],
);

export const locations = [
  { city: "Jaipur", region: "Rajasthan", postal: "302020" },
  { city: "Ahmedabad", region: "Gujarat", postal: "380008" },
  { city: "Patna", region: "Bihar", postal: "800014" },
] as const;

export const metadata = (title: string, description: string, path?: string, type = "website") => ({
  meta: [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "robots",
      content: path ? "index, follow, max-image-preview:large" : "noindex, follow",
    },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...(path ? [{ property: "og:url", content: `${SITE_URL}${path}` }] : []),
  ],
  links: path ? [{ rel: "canonical", href: `${SITE_URL}${path}` }] : [],
});

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Macrow Digital",
  url: SITE_URL,
  logo: `${SITE_URL}/macrow-logo-512.png`,
  email: "growth@macrowdigital.com",
  description:
    "Global growth platform aligning digital marketing, marketing communication (marcomm) and technology as one system.",
  areaServed: "Worldwide",
  sameAs: SOCIALS.map(([, url]) => url),
  address: locations.map((l) => ({
    "@type": "PostalAddress",
    addressLocality: l.city,
    addressRegion: l.region,
    postalCode: l.postal,
    addressCountry: "IN",
  })),
  knowsAbout: serviceLinks.map(([name]) => name),
};
