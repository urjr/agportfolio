import type { Metadata, Viewport } from "next";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { TransitionProvider } from "./components/TransitionProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.scss";

export const viewport: Viewport = {
  themeColor: "#FAF8F5",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ulises.fyi"),
  title: {
    default: "Ulises Reyes-Kaura — Product Designer & Educator",
    template: "%s | Ulises Reyes-Kaura",
  },
  description: "Ulises Reyes-Kaura. A Product Designer and Educator based in Philadelphia; specializing in Data-rich, AI-focused, user experience design.",
  keywords: [
    "Product Design",
    "UX Design",
    "UI Design",
    "Education",
    "Portfolio",
    "Ulises Reyes-Kaura",
    "Philadelphia",
    "UPenn",
    "Google",
  ],
  authors: [{ name: "Ulises Reyes-Kaura", url: "https://ulises.fyi" }],
  creator: "Ulises Reyes-Kaura",
  publisher: "Ulises Reyes-Kaura",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ulises Reyes-Kaura — Product Designer & Educator",
    description: "Ulises Reyes-Kaura. A Product Designer and Educator based in Philadelphia; specializing in Data-rich, AI-focused, user experience design.",
    url: "https://ulises.fyi",
    siteName: "Ulises Reyes-Kaura",
    images: [
      {
        url: "/assets/global/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ulises Reyes-Kaura — Product Designer & Educator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ulises Reyes-Kaura — Product Designer & Educator",
    description: "Ulises Reyes-Kaura. A Product Designer and Educator based in Philadelphia; specializing in Data-rich, AI-focused, user experience design.",
    creator: "@ulirey",
    images: ["/assets/global/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TransitionProvider>
          <Navbar />
          {children}
          <Footer />
        </TransitionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

