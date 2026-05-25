"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef, ReactNode } from "react";

export default function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasNavigatedRef = useRef(false);

  // Recursive splitter to wrap plain text words inside specific block containers in spans
  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (!text.trim()) return;

      const words = text.split(/(\s+)/);
      const fragment = document.createDocumentFragment();

      words.forEach((word) => {
        if (word.trim()) {
          const span = document.createElement("span");
          span.className = "transition-word";
          span.innerText = word;
          fragment.appendChild(span);
        } else {
          fragment.appendChild(document.createTextNode(word));
        }
      });

      if (node.parentNode) {
        node.parentNode.replaceChild(fragment, node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      // Skip structural graphics, SVG nodes, and glitch components to prevent structural issues
      if (
        el.tagName === "SVG" ||
        el.tagName === "CANVAS" ||
        el.tagName === "IMG" ||
        el.classList.contains("philly-svg") ||
        el.classList.contains("transition-word")
      ) {
        return;
      }

      Array.from(node.childNodes).forEach(processNode);
    }
  };

  useEffect(() => {
    const main = document.querySelector("main.main-content");
    if (!main) return;

    // 1. Always split text nodes on mount so they are ready in the DOM to animate out
    const blocks = main.querySelectorAll("h1, p, h2, h3, li, blockquote");
    blocks.forEach((block) => {
      Array.from(block.childNodes).forEach(processNode);
    });

    if (!hasNavigatedRef.current) {
      // Direct load: Skip entry transitions, render fully visible immediately with no animations
      const words = Array.from(main.querySelectorAll(".transition-word"));
      words.forEach((word) => {
        const el = word as HTMLElement;
        el.style.transition = "none";
        el.style.transitionDelay = "0s";
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      setIsActive(true);
      return;
    }

    // Client-side link was clicked: Run transition out, then enter transition with a clean beat pause
    setIsExiting(false);
    setIsActive(false);
    setIsPending(true); // Hide container instantly to avoid pop-in/flash

    const transitionTimer = setTimeout(() => {
      // 2. Perform responsive offsetTop sorting to group parsed items into perfect lines
      const words = Array.from(main.querySelectorAll(".transition-word"));
      const linesMap = new Map<number, HTMLElement[]>();

      words.forEach((word) => {
        const el = word as HTMLElement;
        const offset = el.offsetTop;

        // Group lines by a small offsetTop threshold (6px) to handle text wrapping and layout
        let matchedKey = null;
        for (const key of linesMap.keys()) {
          if (Math.abs(key - offset) < 6) {
            matchedKey = key;
            break;
          }
        }

        if (matchedKey === null) {
          linesMap.set(offset, [el]);
        } else {
          linesMap.get(matchedKey)!.push(el);
        }
      });

      // 3. Stagger delays top-to-bottom (0.08s step for pronounced staggered appearance)
      const sortedKeys = Array.from(linesMap.keys()).sort((a, b) => a - b);
      sortedKeys.forEach((key, lineIndex) => {
        const els = linesMap.get(key)!;
        els.forEach((el) => {
          el.style.transitionDelay = `${lineIndex * 0.08}s`;
        });
      });

      // 4. Unblock pending and arm entering state
      setIsPending(false);
      setIsActive(true);
    }, 250); // 250ms pure resting beat pause

    return () => {
      clearTimeout(transitionTimer);
    };
  }, [pathname]);

  // Global click interceptor and mouseover detector
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Filter out external URLs, empty target hashes, standard protocols, or meta clicks
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.getAttribute("target") === "_blank" ||
        e.metaKey ||
        e.ctrlKey
      ) {
        return;
      }

      e.preventDefault();

      // Enable transitions for subsequent path loads
      hasNavigatedRef.current = true;

      // Trigger exit transition
      setIsExiting(true);

      // Perform the route navigation after the upward fade out completes
      setTimeout(() => {
        router.push(href);
      }, 550);
    };

    // Attach mouseover delegation to flag hovered philly links
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const phillyLink = target.closest(".philly-svg-link");
      if (phillyLink) {
        phillyLink.classList.add("has-hovered");
      }
    };

    document.addEventListener("click", handleGlobalClick);
    document.addEventListener("mouseover", handleMouseOver);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [router]);

  // Dynamic CSS classes for active page transition states
  const containerClass = `page-transition-container ${
    isPending
      ? "transition-container-pending"
      : isExiting
      ? "transition-container-exiting"
      : isActive
      ? "transition-container-active"
      : ""
  }`;

  return (
    <div ref={containerRef} className={containerClass}>
      {children}
    </div>
  );
}
