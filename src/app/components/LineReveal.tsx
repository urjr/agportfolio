"use client";

import React, {
  useRef,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { usePageTransition } from "./TransitionProvider";

interface LineRevealProps {
  /** The block-level element to render ("h1" | "p" | "div") */
  as?: React.ElementType;
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children: ReactNode;
  /** Row-level exit animation index (for whole-block exit, same as before) */
  rowIndex?: number;
  /** Number of lines rendered in previous blocks to stagger timing sequentially */
  lineOffset?: number;
  /** Whether this block should wait for a lineOffset to be calculated before starting */
  waitForOffset?: boolean;
  /** Callback fired once lines are measured, notifying the parent of the line count */
  onLinesMeasured?: (count: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mark every highlighted inline link as a single animation unit.
 * The whole <a> (text + background pill) will animate together as one piece.
 * Idempotent: safe to call multiple times.
 */
function markLinkUnits(root: HTMLElement): void {
  const links = root.querySelectorAll<HTMLElement>('a[class*="highlight"]');
  for (const link of links) {
    link.dataset.lw = "1";
  }
}

/**
 * Wrap every non-whitespace text token in a [data-lw] span.
 * Skips text nodes already inside a [data-lw] element — so this is
 * naturally idempotent and safe to call multiple times (e.g. React
 * StrictMode double-invocation).
 */
function wrapWords(root: HTMLElement): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      // Skip text inside already-marked animation units
      if (parent.closest("[data-lw]")) return NodeFilter.FILTER_REJECT;
      // Skip script, style, svg
      if (
        parent.tagName === "SCRIPT" ||
        parent.tagName === "STYLE" ||
        parent.closest("svg")
      )
        return NodeFilter.FILTER_REJECT;
      // Skip pure whitespace nodes
      if (!node.textContent?.trim()) return NodeFilter.FILTER_SKIP;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) textNodes.push(n as Text);

  for (const textNode of textNodes) {
    const text = textNode.textContent ?? "";
    const tokens = text.split(/(\s+)/);

    const frag = document.createDocumentFragment();
    for (const token of tokens) {
      if (!token) continue;
      if (/^\s+$/.test(token)) {
        frag.appendChild(document.createTextNode(token));
      } else {
        const span = document.createElement("span");
        span.dataset.lw = "1";
        span.textContent = token;
        frag.appendChild(span);
      }
    }
    textNode.parentNode?.replaceChild(frag, textNode);
  }
}

/**
 * Group all [data-lw] elements by their rounded top position.
 * Each unique top = one visual line.
 */
function groupByLine(root: HTMLElement): Map<number, HTMLElement[]> {
  const els = Array.from(root.querySelectorAll<HTMLElement>("[data-lw]"));
  const map = new Map<number, HTMLElement[]>();
  for (const el of els) {
    const top = Math.round(el.getBoundingClientRect().top);
    if (!map.has(top)) map.set(top, []);
    map.get(top)!.push(el);
  }
  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function LineReveal({
  as: Tag = "div",
  className = "",
  id,
  style,
  children,
  rowIndex = 0,
  lineOffset = 0,
  waitForOffset = false,
  onLinesMeasured,
}: LineRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const { isExiting } = usePageTransition();
  const [linesReady, setLinesReady] = useState(false);

  useEffect(() => {
    // Gates:
    //   isExiting      — Wait for exit states to clear
    //   linesReady     — Avoid double-initialization
    //   waitForOffset  — Wait for parent/previous line count offset to be ready
    if (isExiting || linesReady || (waitForOffset && lineOffset === 0)) return;

    const el = ref.current;
    if (!el) return;

    // 1. Mark entire highlighted <a> links as single animation units
    //    so the pill background + text animate together as one piece.
    markLinkUnits(el);

    // 2. Wrap remaining free-text words in individual [data-lw] spans.
    wrapWords(el);

    // 3. One frame for layout to settle, then measure line positions.
    const raf = requestAnimationFrame(() => {
      const lineMap = groupByLine(el);
      const sortedTops = Array.from(lineMap.keys()).sort((a, b) => a - b);

      if (onLinesMeasured) {
        onLinesMeasured(sortedTops.length);
      }

      sortedTops.forEach((top, lineIdx) => {
        lineMap.get(top)!.forEach((animEl, wordIdx) => {
          animEl.style.setProperty("--line-index", String(lineIdx + lineOffset));
          animEl.style.setProperty("--word-index", String(wordIdx));
          animEl.classList.add("lw--animate");

          // After animation, remove overrides so hover/transition effects
          // work normally (CSS forwards-fill would otherwise lock opacity).
          animEl.addEventListener(
            "animationend",
            () => {
              animEl.removeAttribute("data-lw");
              animEl.classList.remove("lw--animate");
              animEl.style.removeProperty("--line-index");
              animEl.style.removeProperty("--word-index");
            },
            { once: true }
          );
        });
      });

      setLinesReady(true);
    });

    return () => cancelAnimationFrame(raf);
  }, [isExiting, linesReady, lineOffset, waitForOffset]);

  const exitClass = isExiting ? "page-row--exit" : "";
  const enterClass = !isExiting && linesReady ? "page-row--enter-done" : "";

  return (
    <Tag
      ref={ref}
      id={id}
      className={`page-row line-reveal ${exitClass} ${enterClass} ${className}`}
      style={{ "--row-index": rowIndex, ...style } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
