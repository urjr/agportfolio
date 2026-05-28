"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface TransitionContextValue {
  isExiting: boolean;
  navigateTo: (href: string) => void;
}

const TransitionContext = createContext<TransitionContextValue>({
  isExiting: false,
  navigateTo: () => {},
});

export function usePageTransition() {
  return useContext(TransitionContext);
}

const EXIT_DURATION = 380; // ms — must match CSS --exit-duration

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isExiting, setIsExiting] = useState(false);
  const pendingHref = useRef<string | null>(null);

  // When pathname actually changes (navigation committed), end exit state
  useEffect(() => {
    setIsExiting(false);
  }, [pathname]);

  const navigateTo = useCallback(
    (href: string) => {
      // Already on this page — no transition needed
      if (href === pathname) return;
      // Same-page hash or external — let browser handle it
      if (href.startsWith("#") || href.startsWith("http")) {
        window.open(href, href.startsWith("http") ? "_blank" : "_self");
        return;
      }

      pendingHref.current = href;
      setIsExiting(true);

      setTimeout(() => {
        router.push(href);
      }, EXIT_DURATION);
    },
    [pathname, router]
  );

  return (
    <TransitionContext.Provider value={{ isExiting, navigateTo }}>
      {children}
    </TransitionContext.Provider>
  );
}
