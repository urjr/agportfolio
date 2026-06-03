"use client";

import { usePathname } from "next/navigation";
import { usePageTransition } from "../components/TransitionProvider";

export default function Footer() {
  const pathname = usePathname();
  const { isExiting } = usePageTransition();

  // Only render the social links bar on the homepage
  if (pathname !== "/") {
    return null;
  }

  return (
    <footer
      className={`footer page-row ${isExiting ? "page-row--exit" : "page-row--enter"}`}
      id="footer"
      style={{ "--row-index": 2 } as React.CSSProperties}
    >
      <nav aria-label="Social and Contact Links">
        <ul className="footer-links">
          <li>
            <a
              href="https://www.linkedin.com/in/ulirey/"
              target="_blank"
              rel="noopener noreferrer"
              id="footer-linkedin"
              aria-label="LinkedIn"
            >
              <img
                src="/assets/home/socials/linkedin_cute_re.svg"
                alt="LinkedIn"
                className="footer-icon"
                width={36}
                height={36}
              />
            </a>
          </li>
          <li>
            <a
              href="mailto:hello@ulises.fyi"
              id="footer-email"
              aria-label="Email"
            >
              <img
                src="/assets/home/socials/email.svg"
                alt="Email"
                className="footer-icon"
                width={36}
                height={36}
              />
            </a>
          </li>
          <li>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              id="footer-resume"
              aria-label="Resume"
            >
              <img
                src="/assets/home/socials/resume.svg"
                alt="Resume"
                className="footer-icon"
                width={36}
                height={36}
              />
            </a>
          </li>
        </ul>
      </nav>
    </footer>
  );
}
