"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Only render the social links bar on the homepage
  if (pathname !== "/") {
    return null;
  }

  return (
    <footer className="footer" id="footer">
      <nav aria-label="Social and Contact Links">
        <ul className="footer-links">
          <li>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              id="footer-linkedin"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a href="mailto:hello@example.com" id="footer-email">
              Email
            </a>
          </li>
        </ul>
      </nav>
    </footer>
  );
}
