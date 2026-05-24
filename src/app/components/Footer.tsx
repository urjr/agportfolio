export default function Footer() {
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
