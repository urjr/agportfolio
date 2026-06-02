"use client";

import { usePageTransition } from "./TransitionProvider";
import type { ComponentProps } from "react";

type TransitionLinkProps = ComponentProps<"a"> & {
  href: string;
};

/**
 * Drop-in replacement for Next.js <Link> for internal navigation.
 * Plays the page exit animation before committing the route change.
 */
export default function TransitionLink({
  href,
  children,
  onClick,
  ...props
}: TransitionLinkProps) {
  const { navigateTo } = usePageTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Let modifier-key clicks (open in new tab etc.) pass through
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    // External links pass through
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) return;

    onClick?.(e);

    if (e.defaultPrevented) return;

    e.preventDefault();
    navigateTo(href);
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
