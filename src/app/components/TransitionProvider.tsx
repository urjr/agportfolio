"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface CardCoords {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface TransitionContextValue {
  isExiting: boolean;
  navigateTo: (href: string) => void;
  transitionType: "about-to-work" | "work-to-about" | "standard";
  sharedCardCoords: Record<string, CardCoords> | null;
  clearSharedCoords: () => void;
}

const TransitionContext = createContext<TransitionContextValue>({
  isExiting: false,
  navigateTo: () => {},
  transitionType: "standard",
  sharedCardCoords: null,
  clearSharedCoords: () => {},
});

export function usePageTransition() {
  return useContext(TransitionContext);
}

const EXIT_DURATION = 380; // ms — must match CSS --exit-duration

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isExiting, setIsExiting] = useState(false);
  const [transitionType, setTransitionType] = useState<"about-to-work" | "work-to-about" | "standard">("standard");
  const [sharedCardCoords, setSharedCardCoords] = useState<Record<string, CardCoords> | null>(null);
  const pendingHref = useRef<string | null>(null);

  // When pathname actually changes (navigation committed), end exit state
  useEffect(() => {
    setIsExiting(false);
  }, [pathname]);

  const clearSharedCoords = useCallback(() => {
    setTransitionType("standard");
    setSharedCardCoords(null);
  }, []);

  const navigateTo = useCallback(
    (href: string) => {
      // Already on this page — no transition needed
      if (href === pathname) return;
      // Same-page hash or external — let browser handle it
      if (href.startsWith("#") || href.startsWith("http")) {
        window.open(href, href.startsWith("http") ? "_blank" : "_self");
        return;
      }

      // Check if this is a custom FLIP transition between About and Work
      const isAboutToWork = pathname === "/about" && href === "/work";
      const isWorkToAbout = pathname === "/work" && href === "/about";
      const isWideScreen = typeof window !== "undefined" && window.innerWidth >= 1025;

      if ((isAboutToWork || isWorkToAbout) && isWideScreen) {
        const coords: Record<string, CardCoords> = {};
        document.querySelectorAll("[data-company-id]").forEach((el) => {
          const companyId = el.getAttribute("data-company-id");
          if (companyId) {
            const rect = el.getBoundingClientRect();
            coords[companyId] = {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
            };
          }
        });

        setTransitionType(isAboutToWork ? "about-to-work" : "work-to-about");
        setSharedCardCoords(coords);
      } else {
        setTransitionType("standard");
        setSharedCardCoords(null);
      }

      const is404 = typeof document !== "undefined" && document.body.classList.contains("is-404-page");
      const duration = is404 ? 900 : EXIT_DURATION;

      pendingHref.current = href;
      setIsExiting(true);

      setTimeout(() => {
        router.push(href);
      }, duration);
    },
    [pathname, router]
  );

  return (
    <TransitionContext.Provider
      value={{
        isExiting,
        navigateTo,
        transitionType,
        sharedCardCoords,
        clearSharedCoords,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}
