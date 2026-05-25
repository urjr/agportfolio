"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef, ReactNode } from "react";

export default function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    setIsExiting(false);
    setIsActive(false);

    // Dynamic analysis delay to ensure Next.js route paint lifecycle completes
    const timer = setTimeout(() => {
      const main = document.querySelector("main.main-content");
      if (!main) return;

      // 1. Target all key typographic elements
      const blocks = main.querySelectorAll("h1, p, h2, h3, li, blockquote");
      blocks.forEach((block) => {
        Array.from(block.childNodes).forEach(processNode);
      });

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

      // 3. Stagger delays top-to-bottom
      const sortedKeys = Array.from(linesMap.keys()).sort((a, b) => a - b);
      sortedKeys.forEach((key, lineIndex) => {
        const els = linesMap.get(key)!;
        els.forEach((el) => {
          el.style.transitionDelay = `${lineIndex * 0.05}s`;
        });
      });

      // 4. Arm entering state
      setIsActive(true);
    }, 60);

    return () => {
      clearTimeout(timer);
      setIsActive(false);
    };
  }, [pathname]);

  // Global click interceptor to catch internal navigation links elegantly
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

      // Trigger exit transition
      setIsExiting(true);

      // Perform the route navigation after the upward fade out completes
      setTimeout(() => {
        router.push(href);
      }, 550);
    };

    document.addEventListener("click", handleGlobalClick);
    return () => {
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [router]);

  // Dynamic CSS classes for active page transition states
  const containerClass = `page-transition-container ${
    isExiting
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
