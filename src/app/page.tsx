"use client";

import Link from "next/link";
import { usePageTransition } from "./components/TransitionProvider";
import TransitionLink from "./components/TransitionLink";

export default function Home() {
  const { isExiting } = usePageTransition();

  return (
    <main className="main-content">
      <div className="bio-container">
        {/* Row 1 — intro line */}
        <h1
          className={`hero-title intro-title first-line page-row ${isExiting ? "page-row--exit" : "page-row--enter"}`}
          id="hero-title"
          style={{ "--row-index": 0 } as React.CSSProperties}
        >
          My name is{" "}
          <TransitionLink href="/about" className="nowrap-link highlight-name" id="link-ulises">
            Ulises Reyes-Kaura
          </TransitionLink>
          . I am a{" "}
          <Link href="#" className="nowrap-link highlight-work" id="link-product-designer">
            product designer
          </Link>{" "}
          and{" "}
          <Link href="#" className="highlight-education" id="link-educator">
            educator
          </Link>{" "}
          based in{" "}
          <Link
            href="https://en.wikipedia.org/wiki/Philadelphia"
            id="link-philadelphia"
            className="highlight-geography"
            target="_blank"
            rel="noopener noreferrer"
          >
            Philadelphia
          </Link>
          .
        </h1>

        {/* Row 2 — current role line */}
        <p
          className={`hero-title intro-title second-line page-row ${isExiting ? "page-row--exit" : "page-row--enter"}`}
          id="hero-subtitle"
          style={{ "--row-index": 1 } as React.CSSProperties}
        >
          Currently, I work at{" "}
          <Link
            href="https://about.google"
            id="link-google"
            className="google-svg-link highlight-work"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="google-text">Google</span>
            <img
              src="/assets/home/google-logo.svg"
              alt="Google"
              className="google-svg"
            />
          </Link>
          , designing agentic experiences for{" "}
          <Link
            href="https://marketingplatform.google.com/about/analytics/"
            id="link-analytics"
            className="analytics-svg-link highlight-work"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="analytics-text">Analytics</span>
            <img
              src="/assets/home/analytics.svg"
              alt="Analytics"
              className="analytics-svg"
            />
          </Link>
          , and teach design at{" "}
          <Link
            href="https://ipd.me.upenn.edu/about/"
            id="link-upenn"
            className="upenn-svg-link highlight-education"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="upenn-text">UPenn</span>
            <img
              src="/assets/home/penn.svg"
              alt="UPenn"
              className="upenn-svg"
            />
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
