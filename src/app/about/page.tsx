"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function About() {
  useEffect(() => {
    const adjustHoverCardSides = () => {
      const container = document.querySelector(".about-container") as HTMLElement;
      const content = document.querySelector(".about-content");
      const groups = document.querySelectorAll(".about-link-group");
      if (!container || !content || !groups.length) return;

      const containerRect = container.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const contentCenter = contentRect.left + contentRect.width / 2;

      groups.forEach((group) => {
        const link = group.querySelector(".about-bold-link") as HTMLElement;
        const card = group.querySelector(".about-hover-card") as HTMLElement;
        const connector = group.querySelector(".about-hover-connector") as HTMLElement;
        if (!link || !card) return;

        const linkRect = link.getBoundingClientRect();
        const linkCenter = linkRect.left + linkRect.width / 2;
        const isLeft = linkCenter < contentCenter;

        if (isLeft) {
          card.classList.remove("right-side");
          card.classList.add("left-side");
        } else {
          card.classList.remove("left-side");
          card.classList.add("right-side");
        }

        if (connector) {
          const cardRect = card.getBoundingClientRect();
          const cardWidth = cardRect.width || 130;
          const cardCenter = isLeft ? (-170 + cardWidth / 2) : (containerRect.width + 170 - cardWidth / 2);
          const linkCenterInContainer = linkRect.left - containerRect.left + linkRect.width / 2;
          const leftPoint = Math.min(cardCenter, linkCenterInContainer);
          const rightPoint = Math.max(cardCenter, linkCenterInContainer);
          const width = rightPoint - leftPoint;
          const topOffset = linkRect.top - containerRect.top + linkRect.height / 2;

          connector.style.left = `${leftPoint}px`;
          connector.style.width = `${width}px`;
          connector.style.top = `${topOffset}px`;
        }
      });
    };

    // Run immediately on client mount
    adjustHoverCardSides();

    // Run adjustment after brief load pass to ensure settled dimensions (e.g. after font layout settling)
    const timer = setTimeout(adjustHoverCardSides, 100);

    window.addEventListener("resize", adjustHoverCardSides);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", adjustHoverCardSides);
    };
  }, []);

  return (
    <main className="about-container">
      <div className="about-content">
        <h1 className="about-paragraph" id="hero-title" style={{ fontWeight: 500 }}>
          Hi, my name is Ulises Reyes-Kaura.
        </h1>
        <p className="about-paragraph">
          I am a product designer with over a decade of experience working on complex, data-driven web and mobile applications. I hold a Bachelors of Architecture from{" "}
          <Link href="#" className="about-bold-link about-link-education">
            FIU Department of Architecture
          </Link>
          , and Masters of Architecture at the{" "}
          <Link href="#" className="about-bold-link about-link-education">
            MIT School of Architecture
          </Link>
          .
        </p>

        <p className="about-paragraph">
          I currently work as a product designer for{" "}
          <span className="about-link-group">
            <span className="about-nowrap-group">
              <Link href="#" className="about-bold-link about-link-work about-link-outlined">
                Google
              </Link>
              ’s
            </span>
            <span className="about-hover-connector about-connector-work">
              <span className="about-connector-dot start-dot"></span>
              <span className="about-connector-line"></span>
              <span className="about-connector-dot end-dot"></span>
            </span>
            <span className="about-hover-card about-card-work left-side">
              <span className="about-hover-card-inner">
                <span className="about-hover-card-label">Google</span>
              </span>
            </span>
          </span>{" "}
          Measurement team, designing AI-first experiences across Google{" "}
          <Link href="#" className="about-bold-link about-link-work">
            Ads
          </Link>
          ,{" "}
          <Link href="#" className="about-bold-link about-link-work">
            Analytics
          </Link>
          , and{" "}
          <Link href="#" className="about-bold-link about-link-work">
            Marketing platform
          </Link>{" "}
          products. Previously at Google, I worked for the Connect team, building internal tools for Google’s sales, service, and support teams.
        </p>

        <p className="about-paragraph">
          Before Google, I worked as lead product designer at{" "}
          <span className="about-link-group">
            <Link href="#" className="about-bold-link about-link-work about-link-outlined">
              Notarize
            </Link>
            <span className="about-hover-connector about-connector-work">
              <span className="about-connector-dot start-dot"></span>
              <span className="about-connector-line"></span>
              <span className="about-connector-dot end-dot"></span>
            </span>
            <span className="about-hover-card about-card-work right-side">
              <span className="about-hover-card-inner">
                <span className="about-hover-card-label">Notarize</span>
              </span>
            </span>
          </span>{" "}
          (now known as{" "}
          <Link href="#" className="about-bold-link about-link-work">
            Proof
          </Link>
          ), creating the mortgage notarization platform from the ground up, on the world’s first online notarization service. Since its launch, Proof has closed on{" "}
          <span className="about-link-group">
            <Link href="#" className="about-bold-link about-link-geography">
              $640B
            </Link>
            <span className="about-hover-connector about-connector-geography">
              <span className="about-connector-dot start-dot"></span>
              <span className="about-connector-line"></span>
              <span className="about-connector-dot end-dot"></span>
            </span>
            <span className="about-hover-card about-card-geography left-side">
              <span className="about-hover-card-inner">
                <span className="about-geography-pill-text">
                  Proof has secured over $640B in remote online transactions as the world's leading eNotary system.
                </span>
                <Link href="https://www.proof.com" target="_blank" rel="noopener noreferrer" className="about-geography-read-more">
                  Read more
                </Link>
              </span>
            </span>
          </span>{" "}
          in fully-remote online real estate transactions.
        </p>

        <p className="about-paragraph">
          Previously, I served on the founding teams of two early stage startups;{" "}
          <span className="about-link-group">
            <Link href="#" className="about-bold-link about-link-work about-link-outlined">
              Smarking
            </Link>
            <span className="about-hover-connector about-connector-work">
              <span className="about-connector-dot start-dot"></span>
              <span className="about-connector-line"></span>
              <span className="about-connector-dot end-dot"></span>
            </span>
            <span className="about-hover-card about-card-work left-side">
              <span className="about-hover-card-inner">
                <span className="about-hover-card-label">Smarking</span>
              </span>
            </span>
          </span>{" "}
          (YC W2015) and{" "}
          <span className="about-link-group">
            <Link href="#" className="about-bold-link about-link-work about-link-outlined">
              AdHawk
            </Link>
            <span className="about-hover-connector about-connector-work">
              <span className="about-connector-dot start-dot"></span>
              <span className="about-connector-line"></span>
              <span className="about-connector-dot end-dot"></span>
            </span>
            <span className="about-hover-card about-card-work right-side">
              <span className="about-hover-card-inner">
                <span className="about-hover-card-label">AdHawk</span>
              </span>
            </span>
          </span>{" "}
          (Techstars Boulder 2015). At both companies, I helped establish the early branding, product, and vision, playing a key role in securing admission to both accelerator programs, and over $5MM in total of seed funding. Smarking was{" "}
          <span className="about-link-group">
            <Link href="#" className="about-bold-link about-link-geography">
              acquired by Parkhub
            </Link>
            <span className="about-hover-connector about-connector-geography">
              <span className="about-connector-dot start-dot"></span>
              <span className="about-connector-line"></span>
              <span className="about-connector-dot end-dot"></span>
            </span>
            <span className="about-hover-card about-card-geography right-side">
              <span className="about-hover-card-inner">
                <span className="about-geography-pill-text">
                  Smarking merged with Parkhub to integrate real-time parking analytics with modern venue operations.
                </span>
                <Link href="https://www.parkhub.com" target="_blank" rel="noopener noreferrer" className="about-geography-read-more">
                  Read more
                </Link>
              </span>
            </span>
          </span>{" "}
          in 2022, and Broadlume (formerly AdHawk) was{" "}
          <span className="about-link-group">
            <Link href="#" className="about-bold-link about-link-geography">
              acquired by Cyncly
            </Link>
            <span className="about-hover-connector about-connector-geography">
              <span className="about-connector-dot start-dot"></span>
              <span className="about-connector-line"></span>
              <span className="about-connector-dot end-dot"></span>
            </span>
            <span className="about-hover-card about-card-geography left-side">
              <span className="about-hover-card-inner">
                <span className="about-geography-pill-text">
                  Broadlume partnered with Cyncly to expand retail sales and digital marketing tools globally.
                </span>
                <Link href="https://www.cyncly.com" target="_blank" rel="noopener noreferrer" className="about-geography-read-more">
                  Read more
                </Link>
              </span>
            </span>
          </span>{" "}
          in 2024.
        </p>

        <p className="about-paragraph">
          Outside of designing for tech companies, I am a professor at{" "}
          <span className="about-link-group">
            <span className="about-nowrap-group">
              <Link href="https://ipd.me.upenn.edu/about/" className="about-bold-link about-link-education about-link-outlined" target="_blank" rel="noopener noreferrer">
                UPenn
              </Link>
              ’s
            </span>
            <span className="about-hover-connector about-connector-education">
              <span className="about-connector-dot start-dot"></span>
              <span className="about-connector-line"></span>
              <span className="about-connector-dot end-dot"></span>
            </span>
            <span className="about-hover-card about-card-education left-side">
              <span className="about-hover-card-inner">
                <span className="about-hover-card-label">UPenn</span>
              </span>
            </span>
          </span>{" "}
          <Link href="https://ipd.me.upenn.edu/about/" className="about-bold-link about-link-education" target="_blank" rel="noopener noreferrer">
            Integrated Product Design
          </Link>{" "}
          program, blending design, engineering, and business knowledge to teach students interdisciplinary methods for creating physical and digital products.
        </p>

        <p className="about-paragraph">
          Send me a shout on{" "}
          <Link href="https://www.linkedin.com/in/ulirey/" className="about-bold-link about-link-special" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </Link>{" "}
          or{" "}
          <Link href="mailto:hello@example.com" className="about-bold-link about-link-special">
            email
          </Link>
          !
        </p>
      </div>
    </main>
  );
}
