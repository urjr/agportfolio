import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import TransitionProvider from "./components/TransitionProvider";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "A minimal, responsive, and elegant personal website.",
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
      </body>
    </html>
  );
}
