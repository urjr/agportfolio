"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

// Hand-crafted organic float timings, amplitudes, sways, and unified negative parallax scroll speeds.
// By keeping all speeds negative (between -0.08 and -0.18), all cards float slightly slower than the text
// (creating a natural background depth layer) and will never cross paths or collide on scroll.
const FLOAT_PARAMS = [
  { duration: "6.8s", delay: "0.2s", y: "-7px", x: "-2px", speed: -0.15 },   // Google (left)
  { duration: "8.4s", delay: "1.5s", y: "6px",  x: "3px",  speed: -0.16 },   // Notarize (right)
  { duration: "5.6s", delay: "0.8s", y: "-5px", x: "1.5px", speed: -0.08 },   // $640B (left)
  { duration: "9.2s", delay: "2.3s", y: "-8px", x: "-1.5px", speed: -0.14 },  // Smarking (left)
  { duration: "7.1s", delay: "1.1s", y: "7px",  x: "-3px",  speed: -0.18 },   // AdHawk (right)
  { duration: "6.3s", delay: "0.4s", y: "5px",  x: "2px",  speed: -0.10 },   // Parkhub (right)
  { duration: "8.0s", delay: "1.9s", y: "-6px", x: "-2px", speed: -0.12 },   // Cyncly (left)
  { duration: "7.5s", delay: "1.0s", y: "-8px", x: "2.5px", speed: -0.09 },   // UPenn (left)
];

export default function About() {
  const layoutCache = useRef<{ linkX: number; linkY: number; cardX: number; cardY: number; }[]>([]);

  useEffect(() => {
    const container = document.querySelector(".about-container") as HTMLElement;
    const content = document.querySelector(".about-content");
    const groups = document.querySelectorAll(".about-link-group");
    if (!container || !content || !groups.length) return;

    // Cache the static positions without active transforms to prevent layout tracking discrepancies
    const cacheStaticCoordinates = () => {
      const containerRect = container.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const contentCenter = contentRect.left + contentRect.width / 2;

      // Temporarily clear inline transforms to measure static positions accurately
      const originalTransforms: string[] = [];
      groups.forEach((group, index) => {
        const card = group.querySelector(".about-hover-card") as HTMLElement;
        if (card) {
          originalTransforms[index] = card.style.transform;
          card.style.transform = "translateY(-50%) translate(0px, 0px)";
        }
      });

      // Synchronous DOM coordinate measurement pass
      groups.forEach((group, index) => {
        const link = group.querySelector(".about-bold-link") as HTMLElement;
        const card = group.querySelector(".about-hover-card") as HTMLElement;
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

        const linkX = linkRect.left - containerRect.left + linkRect.width / 2;
        const linkY = linkRect.top - containerRect.top + linkRect.height / 2;

        const cardRect = card.getBoundingClientRect();
        const cardWidth = cardRect.width || 130;
        const cardX = isLeft ? (-170 + cardWidth / 2) : (containerRect.width + 170 - cardWidth / 2);
        const cardY = cardRect.top - containerRect.top + cardRect.height / 2;

        layoutCache.current[index] = { linkX, linkY, cardX, cardY };
      });

      // Restore original transforms instantly
      groups.forEach((group, index) => {
        const card = group.querySelector(".about-hover-card") as HTMLElement;
        if (card && originalTransforms[index] !== undefined) {
          card.style.transform = originalTransforms[index];
        }
      });
    };

    // Perform initial static layout caching pass
    cacheStaticCoordinates();

    const startTime = Date.now();
    let animationFrameId: number;

    const frameUpdate = () => {
      const scrollY = document.body.scrollTop || window.scrollY || document.documentElement.scrollTop || 0;
      const elapsed = (Date.now() - startTime) / 1000;

      groups.forEach((group, index) => {
        const card = group.querySelector(".about-hover-card") as HTMLElement;
        const connector = group.querySelector(".about-hover-connector") as HTMLElement;
        const cache = layoutCache.current[index];
        if (!card || !cache) return;

        const params = FLOAT_PARAMS[index] || { duration: "6.0s", delay: "0.0s", y: "-6px", x: "0px", speed: 0 };
        const duration = parseFloat(params.duration);
        const delay = parseFloat(params.delay);
        const speed = params.speed;
        const yAmplitude = parseFloat(params.y);
        const xAmplitude = parseFloat(params.x);

        const time = elapsed + delay;
        const angle = (time * 2 * Math.PI) / duration;

        // Mathematical organic float bobbing (y) and horizontal swaying (x) offsets
        const floatY = yAmplitude * Math.sin(angle);
        const floatX = xAmplitude * Math.sin(angle);

        // Real-time scroll parallax offset
        const parallaxY = scrollY * speed;

        // Apply dynamic transforms inline (gpu accelerated)
        card.style.transform = `translateY(-50%) translate(${floatX.toFixed(2)}px, ${(floatY + parallaxY).toFixed(2)}px)`;

        if (connector) {
          // Calculate diagonal coordinates relative to container (fully synced with float offsets!)
          const startX = cache.linkX;
          const startY = cache.linkY;
          const endX = cache.cardX + floatX;
          const endY = cache.cardY + floatY + parallaxY;

          // Trigonometry
          const dx = endX - startX;
          const dy = endY - startY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angleRad = Math.atan2(dy, dx);
          const angleDeg = angleRad * (180 / Math.PI);

          // Apply styling parameters
          connector.style.left = `${startX}px`;
          connector.style.top = `${startY}px`;
          connector.style.width = `${distance.toFixed(1)}px`;
          connector.style.transform = `rotate(${angleDeg.toFixed(2)}deg)`;
        }

        // Fade in aligned card and connector beautifully
        card.classList.add("aligned");
        if (connector) {
          connector.classList.add("aligned");
        }
      });

      animationFrameId = window.requestAnimationFrame(frameUpdate);
    };

    // Run adjustment after brief load pass to ensure settled dimensions
    const timer = setTimeout(() => {
      cacheStaticCoordinates();
      // Start high-performance frame animation loop
      animationFrameId = window.requestAnimationFrame(frameUpdate);
    }, 100);

    // Re-cache static bounds on resize
    const handleResize = () => {
      cacheStaticCoordinates();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
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
