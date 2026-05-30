"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import TransitionLink from "./TransitionLink";
import { usePageTransition } from "./TransitionProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { isExiting } = usePageTransition();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [scrolledPastFirst, setScrolledPastFirst] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Synchronously reset scroll and transition states during the render phase when the path changes.
  // This completely eliminates any single-frame flashing before effects are executed.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setScrolledPastFirst(false);
    setIsTransitioning(true);
    setIsMenuOpen(false); // Synchronously close mobile menu on path changes
  }

  useEffect(() => {
    // Keep isTransitioning true for the duration of the staggered exit + enter animations
    const transitionTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);

    // Small timeout to let elements render/transition on page navigation
    const timer = setTimeout(() => {
      const firstRow = document.querySelector(".page-row");
      if (!firstRow) {
        // Fallback standard scroll listener if no page-row is present
        const handleScroll = () => {
          setScrolledPastFirst(window.scrollY > 0);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          // Fixed navbar is 60px high. As soon as the first element's top touches or passes 60px, it contacts the navbar!
          const hasContacted = entry.boundingClientRect.top <= 60;
          setScrolledPastFirst(hasContacted);
        },
        {
          rootMargin: "-60px 0px 0px 0px",
          threshold: [0, 1]
        }
      );

      observer.observe(firstRow);
      return () => observer.disconnect();
    }, 100);

    return () => {
      clearTimeout(timer);
      clearTimeout(transitionTimer);
    };
  }, [pathname]);

  const showBorder = scrolledPastFirst && !(isExiting || isTransitioning);

  return (
    <>
      <header className={`navbar${showBorder ? " navbar--scrolled" : ""}${isMenuOpen ? " navbar--open" : ""}`} id="navbar">
        <div className="nav-brand">
          <TransitionLink href="/" id="nav-home">
            U R-K
          </TransitionLink>
        </div>

        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <TransitionLink
                href="/"
                id="nav-home-link"
                className={pathname === "/" ? "active" : ""}
              >
                Home
              </TransitionLink>
            </li>
            <li>
              <TransitionLink
                href="/work"
                id="nav-work"
                className={pathname === "/work" ? "active" : ""}
              >
                Work
              </TransitionLink>
            </li>
            <li>
              <TransitionLink
                href="/about"
                id="nav-about"
                className={pathname === "/about" ? "active" : ""}
              >
                About
              </TransitionLink>
            </li>
          </ul>
        </nav>
      </header>

      {/* Full screen mobile navigation menu overlay (now a sibling to avoid containing-block constraint) */}
      <button
        className={`hamburger${isMenuOpen ? " is-open" : ""}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle Menu"
        aria-expanded={isMenuOpen}
      >
        <span className="hamburger-line top"></span>
        <span className="hamburger-line middle"></span>
        <span className="hamburger-line bottom"></span>
      </button>

      <div className={`mobile-menu-overlay${isMenuOpen ? " is-visible" : ""}`} aria-hidden={!isMenuOpen}>
        <nav aria-label="Mobile Navigation">
          <ul className="mobile-menu-links">
            <li style={{ "--item-index": 0 } as React.CSSProperties}>
              <TransitionLink
                href="/"
                id="nav-home-mobile"
                className={pathname === "/" ? "active" : ""}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </TransitionLink>
            </li>
            <li style={{ "--item-index": 1 } as React.CSSProperties}>
              <TransitionLink
                href="/work"
                id="nav-work-mobile"
                className={pathname === "/work" ? "active" : ""}
                onClick={() => setIsMenuOpen(false)}
              >
                Work
              </TransitionLink>
            </li>
            <li style={{ "--item-index": 2 } as React.CSSProperties}>
              <TransitionLink
                href="/about"
                id="nav-about-mobile"
                className={pathname === "/about" ? "active" : ""}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </TransitionLink>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
