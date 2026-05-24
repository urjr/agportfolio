import Link from "next/link";

export default function Navbar() {
  return (
    <header className="navbar" id="navbar">
      <nav aria-label="Main Navigation">
        <ul className="nav-links">
          <li>
            <Link href="/" id="nav-home">
              Home
            </Link>
          </li>
          <li>
            <Link href="#work" id="nav-work">
              Work
            </Link>
          </li>
          <li>
            <Link href="#about" id="nav-about">
              About
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
