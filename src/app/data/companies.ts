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
  imageSrc?: string;
  iconBg?: string;
}

export const COMPANY_DATA: Record<string, CompanyData> = {
  google: {
    id: "google",
    type: "work",
    name: "Google",
    role: "Interaction Designer",
    dates: "2019 — Present",
    chips: [],
    summary:
      "Designing AI-first measurement experiences across Google Ads, Analytics, and Marketing Platform. Helping millions of advertisers understand and act on their performance data.",
    url: "https://about.google",
    urlLabel: "Visit Google",
    imageSrc: "/assets/work/google.webp",
    iconBg: "#f5f5f5",
  },
  upenn: {
    id: "upenn",
    type: "education",
    name: "UPenn IPD",
    role: "Lecturer",
    dates: "2024 — Present",
    chips: [],
    summary:
      "Teaching graduate students at Penn's Integrated Product Design program — blending design, engineering, and business to apply interdisciplinary methods for creating physical and digital products.",
    url: "https://ipd.me.upenn.edu/",
    urlLabel: "Visit IPD at UPenn",
    imageSrc: "/assets/work/upenn.jpg",
    iconBg: "#fdfdfd",
  },
  notarize: {
    id: "notarize",
    type: "work",
    name: "Notarize (now Proof)",
    role: "Lead Product Designer",
    dates: "2017 — 2019",
    chips: [],
    summary:
      "Part of the initial team that built the mortgage notarization platform from the ground up on the world's first online notarization service. Since launch, Proof has facilitated over $640B in real estate transactions.",
    url: "https://www.proof.com/product/notarize",
    urlLabel: "Visit Notarize",
    imageSrc: "/assets/work/notarize.webp",
    iconBg: "#ffffff",
  },
  adhawk: {
    id: "adhawk",
    type: "work",
    name: "AdHawk (Now Broadlume)",
    role: "Founding designer",
    dates: "2014 — 2017",
    chips: ["Techstars Boulder 2015"],
    summary:
      "Built product and brand for the Techstars-backed advertising automation startup. Helped secure $2MM+ in seed funding. AdHawk became Broadlume in 2020, later acquired by Cyncly in 2024.",
    url: "https://www.broadlume.com/",
    urlLabel: "Visit Broadlume",
    imageSrc: "/assets/work/adhawk.webp",
    iconBg: "#ffffff",
  },
  smarking: {
    id: "smarking",
    type: "work",
    name: "Smarking (now JustPark)",
    role: "Founding designer",
    dates: "2014 — 2015",
    chips: ["YC W15"],
    summary:
      "Helped establish early branding, product vision, and design at this YC-backed parking analytics startup. Played a key role in securing $3MM+ in seed funding. Smarking was acquired by JustPark in 2022.",
    url: "https://justpark.com",
    urlLabel: "Visit JustPark",
    imageSrc: "/assets/work/smarking.webp",
    iconBg: "#1fa637",
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
