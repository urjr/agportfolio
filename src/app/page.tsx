"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TransitionLink from "./components/TransitionLink";
import LineReveal from "./components/LineReveal";

const LINK_IDS = [
  "link-ulises",
  "link-product-designer",
  "link-educator",
  "link-philadelphia",
  "link-google",
  "link-analytics",
  "link-upenn"
];


export default function Home() {
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);
  const [hasHoveredIds, setHasHoveredIds] = useState<Set<string>>(new Set());
  const [firstLineCount, setFirstLineCount] = useState(0);

  useEffect(() => {
    // 1. Device-based detection (User Agent + Touch capabilities)
    if (typeof window === "undefined") return;

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    
    // Only run on mobile/tablet devices
    const isMobile = isMobileUA && isTouchDevice;
    if (!isMobile) return;

    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;

    const runShowcase = () => {
      const nextId = LINK_IDS[currentIndex];
      currentIndex = (currentIndex + 1) % LINK_IDS.length;

      // Trigger hover state and mark as hovered
      setActiveHoverId(nextId);
      setHasHoveredIds((prev) => {
        const nextSet = new Set(prev);
        nextSet.add(nextId);
        return nextSet;
      });

      // Keep active for a natural showcase duration (1.4s to 2.0s)
      const hoverDuration = 1400 + Math.random() * 600;
      
      timeoutId = setTimeout(() => {
        // Clear active hover state (triggering exit glitch/animations)
        setActiveHoverId(null);

        // Rest/pause before highlighting the next link (1.1s to 1.9s - cut in half)
        const restDuration = 1100 + Math.random() * 800;
        timeoutId = setTimeout(runShowcase, restDuration);
      }, hoverDuration);
    };

    // Stagger start by 2.5 seconds to let initial page intro animations finish
    timeoutId = setTimeout(runShowcase, 2500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <main className="main-content">
      <div className="bio-container">
        {/* Row 1 — intro line */}
        <LineReveal
          as="h1"
          className="hero-title intro-title first-line"
          id="hero-title"
          rowIndex={0}
          onLinesMeasured={setFirstLineCount}
        >
          My name is{" "}
          <TransitionLink
            href="/about"
            className={`nowrap-link highlight-name${activeHoverId === "link-ulises" ? " active-hover" : ""}${hasHoveredIds.has("link-ulises") ? " has-hovered" : ""}`}
            id="link-ulises"
          >
            Ulises Reyes-Kaura
          </TransitionLink>
          . I am a{" "}
          <Link
            href="#"
            className={`nowrap-link highlight-work${activeHoverId === "link-product-designer" ? " active-hover" : ""}${hasHoveredIds.has("link-product-designer") ? " has-hovered" : ""}`}
            id="link-product-designer"
          >
            product designer
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className={`highlight-education${activeHoverId === "link-educator" ? " active-hover" : ""}${hasHoveredIds.has("link-educator") ? " has-hovered" : ""}`}
            id="link-educator"
          >
            educator
          </Link>{" "}
          based in{" "}
          <Link
            href="https://en.wikipedia.org/wiki/Philadelphia"
            id="link-philadelphia"
            className={`highlight-geography${activeHoverId === "link-philadelphia" ? " active-hover" : ""}${hasHoveredIds.has("link-philadelphia") ? " has-hovered" : ""}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Philadelphia
          </Link>
          .
        </LineReveal>

        {/* Row 2 — current role line */}
        <LineReveal
          as="p"
          className="hero-title intro-title second-line"
          id="hero-subtitle"
          rowIndex={1}
          lineOffset={firstLineCount}
          waitForOffset={true}
        >
          Currently, I work at{" "}
          <Link
            href="https://about.google"
            id="link-google"
            className={`google-svg-link highlight-work${activeHoverId === "link-google" ? " active-hover" : ""}${hasHoveredIds.has("link-google") ? " has-hovered" : ""}`}
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
            className={`analytics-svg-link highlight-work${activeHoverId === "link-analytics" ? " active-hover" : ""}${hasHoveredIds.has("link-analytics") ? " has-hovered" : ""}`}
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
            className={`upenn-svg-link highlight-education${activeHoverId === "link-upenn" ? " active-hover" : ""}${hasHoveredIds.has("link-upenn") ? " has-hovered" : ""}`}
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
        </LineReveal>
      </div>
    </main>
  );
}
