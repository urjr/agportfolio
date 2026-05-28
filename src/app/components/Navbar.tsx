"use client";

import TransitionLink from "./TransitionLink";

export default function Navbar() {
  return (
    <header className="navbar" id="navbar">
      <div className="nav-brand">
        <TransitionLink href="/" id="nav-home">
          U R-K
        </TransitionLink>
      </div>
      <nav aria-label="Main Navigation">
        <ul className="nav-links">
          <li>
            <TransitionLink href="/work" id="nav-work">
              Work
            </TransitionLink>
          </li>
          <li>
            <TransitionLink href="/about" id="nav-about">
              About
            </TransitionLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
