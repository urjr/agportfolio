// Shared company/institution data — consumed by the About modal and Work page card list

export interface CompanyData {
  id: string;
  type: "work" | "education";
  name: string;
  role: string;
  dates: string;
  chips: string[];
  summary: string;
  url: string;
  urlLabel: string;
}

export const COMPANY_DATA: Record<string, CompanyData> = {
  google: {
    id: "google",
    type: "work",
    name: "Google",
    role: "Senior Product Designer, Measurement",
    dates: "2021 — Present",
    chips: ["AI/ML", "Ads", "Analytics", "Enterprise"],
    summary:
      "Designing AI-first measurement experiences across Google Ads, Analytics, and Marketing Platform — helping billions of advertisers understand and act on their performance data.",
    url: "https://google.com",
    urlLabel: "Visit Google",
  },
  upenn: {
    id: "upenn",
    type: "education",
    name: "UPenn IPD",
    role: "Adjunct Professor, Integrated Product Design",
    dates: "2022 — Present",
    chips: ["Education", "Product Design", "UX", "Interdisciplinary"],
    summary:
      "Teaching graduate students at Penn's Integrated Product Design program — blending design, engineering, and business to develop interdisciplinary methods for creating physical and digital products.",
    url: "https://ipd.me.upenn.edu/about/",
    urlLabel: "Visit IPD at UPenn",
  },
  notarize: {
    id: "notarize",
    type: "work",
    name: "Notarize (now Proof)",
    role: "Lead Product Designer",
    dates: "2018 — 2021",
    chips: ["FinTech", "LegalTech", "Mobile", "Founding Team"],
    summary:
      "Built the mortgage notarization platform from the ground up on the world's first online notarization service. Since launch, Proof has facilitated over $640B in fully-remote real estate transactions.",
    url: "https://proof.com",
    urlLabel: "Visit Proof",
  },
  adhawk: {
    id: "adhawk",
    type: "work",
    name: "AdHawk",
    role: "Co-Founder & Head of Design",
    dates: "2015 — 2018",
    chips: ["Techstars Boulder 2015", "AdTech", "SaaS", "Early Stage"],
    summary:
      "Built product and brand for this Techstars-backed advertising automation startup. Helped secure $5M+ in seed funding. AdHawk became Broadlume, later acquired by Cyncly in 2024.",
    url: "https://cyncly.com",
    urlLabel: "Visit Cyncly",
  },
  smarking: {
    id: "smarking",
    type: "work",
    name: "Smarking",
    role: "Co-Founder & Head of Design",
    dates: "2015 — 2018",
    chips: ["YC W2015", "Parking Analytics", "SaaS", "Early Stage"],
    summary:
      "Helped establish early branding, product vision, and design at this YC-backed parking analytics startup. Played a key role in securing $5M+ in seed funding. Smarking was acquired by Parkhub in 2022.",
    url: "https://parkhub.com",
    urlLabel: "Visit Parkhub",
  },
};

// Ordered list for the Work page
export const WORK_PAGE_ORDER: string[] = [
  "google",
  "upenn",
  "notarize",
  "adhawk",
  "smarking",
];
