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
    const isMaciPad = /macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    
    // Check if a mouse or trackpad is connected/active
    const hasMouseOrPointer = window.matchMedia("(any-hover: hover)").matches;

    // Only run on mobile/tablet touch devices that do NOT have a physical mouse or trackpad connected
    const isMobile = (isMobileUA || isMaciPad) && isTouchDevice && !hasMouseOrPointer;
    if (!isMobile) return;

    // Add CSS class to body for mobile/tablet device targeting
    document.body.classList.add("is-mobile-device");

    let timeoutId: NodeJS.Timeout;
    
    // Shuffle queue management
    const cycleQueue = [...LINK_IDS];
    const shuffleArray = (array: string[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    // Initial shuffle
    shuffleArray(cycleQueue);
    let currentIndex = 0;

    const runShowcase = () => {
      if (currentIndex >= cycleQueue.length) {
        // Start a new cycle: shuffle the queue again and reset index
        const lastTriggeredId = cycleQueue[cycleQueue.length - 1];
        shuffleArray(cycleQueue);

        // Prevent triggering the same element consecutively across cycles
        if (cycleQueue[0] === lastTriggeredId && cycleQueue.length > 1) {
          const swapIndex = 1 + Math.floor(Math.random() * (cycleQueue.length - 1));
          [cycleQueue[0], cycleQueue[swapIndex]] = [cycleQueue[swapIndex], cycleQueue[0]];
        }

        currentIndex = 0;
      }

      const nextId = cycleQueue[currentIndex];
      currentIndex++;

      // Trigger hover state and mark as hovered
      setActiveHoverId(nextId);
      setHasHoveredIds((prev) => {
        const nextSet = new Set(prev);
        nextSet.add(nextId);
        return nextSet;
      });

      // Keep active for a natural showcase duration (1.4s to 2.0s - cut in half to 0.7s to 1.0s for mobile)
      const hoverDuration = (1400 + Math.random() * 600) * 0.5;
      
      timeoutId = setTimeout(() => {
        // Clear active hover state (triggering exit glitch/animations)
        setActiveHoverId(null);

        // Rest/pause before highlighting the next link (1.1s to 1.9s - cut in half to 0.55s to 0.95s for mobile)
        const restDuration = (1100 + Math.random() * 800) * 0.5;
        timeoutId = setTimeout(runShowcase, restDuration);
      }, hoverDuration);
    };

    // Stagger start by 2.5 seconds to let initial page intro animations finish
    timeoutId = setTimeout(runShowcase, 2500);

    return () => {
      clearTimeout(timeoutId);
      document.body.classList.remove("is-mobile-device");
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
