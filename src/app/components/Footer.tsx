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
              href="mailto:hello@example.com" 
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
        </ul>
      </nav>
    </footer>
  );
}

