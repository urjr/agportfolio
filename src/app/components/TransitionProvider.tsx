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
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Render phase state synchronizer to completely bypass any paint of un-split text on route changes
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsPending(true);
    setIsActive(false);
    setIsExiting(false);
  }

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

      // If it's a link (A tag), wrap the entire A tag in a new transition-word span to preserve underlines and ensure perfect staggers on direct loads/refreshes
      if (el.tagName === "A") {
        if (!el.parentNode || (el.parentNode as HTMLElement).classList.contains("transition-word")) {
          return;
        }

        const wrapper = document.createElement("span");
        wrapper.className = "transition-word";
        wrapper.style.display = "inline-block"; // Ensure inline-block layout for transforms

        el.parentNode.replaceChild(wrapper, el);
        wrapper.appendChild(el);
        return;
      }

      // Skip structural graphics, SVG nodes, and glitch components to prevent structural issues
      if (
        el.tagName === "SVG" ||
        el.tagName === "CANVAS" ||
        el.tagName === "IMG" ||
        el.classList.contains("philly-svg") ||
        el.classList.contains("google-svg") ||
        el.classList.contains("upenn-svg") ||
        el.classList.contains("analytics-svg") ||
        el.classList.contains("transition-word")
      ) {
        return;
      }

      Array.from(node.childNodes).forEach(processNode);
    }
  };

  // Helper to group transition-word nodes by offsetTop and assign line-by-line staggered delays
  const applyLineStaggers = (main: Element, instant: boolean) => {
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

    // Stagger delays top-to-bottom (0.1s step for pronounced staggered appearance)
    const sortedKeys = Array.from(linesMap.keys()).sort((a, b) => a - b);
    sortedKeys.forEach((key, lineIndex) => {
      const els = linesMap.get(key)!;
      els.forEach((el) => {
        if (instant) {
          el.style.transition = "none";
          el.style.opacity = "1";
          el.style.transform = "none";
        } else {
          el.style.transition = ""; // Restore default CSS transition (clear inline "none" state)
        }
        el.style.transitionDelay = `${lineIndex * 0.1}s`;
      });
    });
  };

  useEffect(() => {
    const main = document.querySelector("main.main-content");
    if (!main) return;

    if (!hasNavigatedRef.current) {
      const isHomepage = pathname === "/";

      // If homepage, immediately split nodes so browser registers initial opacity: 0 state before paint
      if (isHomepage) {
        const blocks = main.querySelectorAll("h1, p, h2, h3, li, blockquote");
        blocks.forEach((block) => {
          Array.from(block.childNodes).forEach(processNode);
        });
      }

      // Direct load: Wait a tiny beat for hydration, split text, and render
      const directTimer = setTimeout(() => {
        if (!isHomepage) {
          const blocks = main.querySelectorAll("h1, p, h2, h3, li, blockquote");
          blocks.forEach((block) => {
            Array.from(block.childNodes).forEach(processNode);
          });
        }

        // Stagger in if homepage, snap instantly otherwise
        applyLineStaggers(main, !isHomepage);
        setIsActive(true);
      }, 50); // Safe 50ms hydration buffer

      return () => {
        clearTimeout(directTimer);
      };
    }

    // Client-side link was clicked: Run transition out, then enter transition with a clean beat pause
    setIsExiting(false);
    setIsActive(false);
    setIsPending(true); // Hide container instantly to avoid pop-in/flash

    // 1. Split text nodes IMMEDIATELY on mount so browser registers initial transition-word classes on A tags
    const blocks = main.querySelectorAll("h1, p, h2, h3, li, blockquote");
    blocks.forEach((block) => {
      Array.from(block.childNodes).forEach(processNode);
    });

    const transitionTimer = setTimeout(() => {
      // 2. Perform responsive offsetTop sorting and apply staggered delays
      applyLineStaggers(main, false);

      // 3. Unblock pending and arm entering state
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

      // Resolve the target path to compare it with the current pathname
      let targetPath = href;
      try {
        const url = new URL(href, window.location.href);
        targetPath = url.pathname;
      } catch (err) {
        // Fallback to simple matching if URL parsing fails
      }

      // If the target path is the same as the current pathname, bypass transitions to avoid getting stuck
      if (targetPath === pathname) {
        return;
      }

      // Prevent default and stop propagation in the capture phase to bypass Next.js router instant caching navigation
      e.preventDefault();
      e.stopPropagation();

      // Enable transitions for subsequent path loads
      hasNavigatedRef.current = true;

      // Trigger exit transition
      setIsExiting(true);

      // Perform the route navigation after the upward staggered fade out completes
      setTimeout(() => {
        router.push(href);
      }, 850); // Increased to 850ms to allow all lines to cleanly stagger and transition out fully
    };

    // Attach mouseover delegation to flag hovered interactive svg links
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const phillyLink = target.closest(".philly-svg-link");
      if (phillyLink) {
        phillyLink.classList.add("has-hovered");
      }
      const googleLink = target.closest(".google-svg-link");
      if (googleLink) {
        googleLink.classList.add("has-hovered");
      }
      const upennLink = target.closest(".upenn-svg-link");
      if (upennLink) {
        upennLink.classList.add("has-hovered");
      }
      const analyticsLink = target.closest(".analytics-svg-link");
      if (analyticsLink) {
        analyticsLink.classList.add("has-hovered");
      }
    };

    // Use capture phase to intercept clicks before Next.js/React standard handlers run
    document.addEventListener("click", handleGlobalClick, true);
    document.addEventListener("mouseover", handleMouseOver);
    return () => {
      document.removeEventListener("click", handleGlobalClick, true);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [router, pathname]);

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
