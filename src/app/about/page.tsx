"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { type CompanyData, COMPANY_DATA } from "../data/companies";
import { usePageTransition } from "../components/TransitionProvider";

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
  const { isExiting, transitionType, sharedCardCoords, clearSharedCoords } = usePageTransition();
  const [isFlipping, setIsFlipping] = useState(() => {
    return transitionType === "work-to-about" && !!sharedCardCoords;
  });
  const [wasFlipEntered] = useState(() => {
    return transitionType === "work-to-about" && !!sharedCardCoords;
  });
  const isFlippingRef = useRef(isFlipping);
  useEffect(() => {
    isFlippingRef.current = isFlipping;
  }, [isFlipping]);

  const hasAnimated = useRef(false);

  useEffect(() => {
    console.log("FLIP useEffect triggered:", { transitionType, hasCoords: !!sharedCardCoords, hasAnimated: hasAnimated.current, isExiting });
    if (!isExiting && transitionType === "work-to-about" && sharedCardCoords && !hasAnimated.current) {
      hasAnimated.current = true;

      const cards = document.querySelectorAll<HTMLElement>(".about-content [data-company-id]");

      cards.forEach((cardEl) => {
        const companyId = cardEl.getAttribute("data-company-id");
        if (!companyId) return;

        const firstRect = sharedCardCoords[companyId];
        if (!firstRect) return;

        // Force the aligned class immediately so the card is visible during animation
        cardEl.classList.add("aligned");

        const lastRect = cardEl.getBoundingClientRect();

        const dx = firstRect.left - lastRect.left;
        const dy = (firstRect.top - lastRect.top) + 0.5 * (firstRect.height - lastRect.height);
        const scaleX = firstRect.width / lastRect.width;
        const scaleY = firstRect.height / lastRect.height;

        cardEl.style.transition = "none";
        cardEl.style.transform = `translateY(-50%) translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;
        cardEl.style.transformOrigin = "top left";

        cardEl.offsetHeight;

        requestAnimationFrame(() => {
          cardEl.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease";
          cardEl.style.transform = "translateY(-50%) translate(0px, 0px) scale(1)";
        });

        const handleTransitionEnd = (e: TransitionEvent) => {
          if (e.propertyName === "transform") {
            cardEl.style.transition = "";
            cardEl.style.transform = "";
            cardEl.style.transformOrigin = "";
            cardEl.removeEventListener("transitionend", handleTransitionEnd);
          }
        };
        cardEl.addEventListener("transitionend", handleTransitionEnd);
      });

      console.log("FLIP useEffect: scheduling 600ms timer to clear isFlipping");
      const timer = setTimeout(() => {
        console.log("FLIP timer fired: setting isFlipping to false");
        setIsFlipping(false);
        clearSharedCoords();
      }, 600);

      return () => {
        console.log("FLIP useEffect cleanup: clearing timeout and resetting hasAnimated");
        hasAnimated.current = false;
        clearTimeout(timer);
      };
    }
  }, [transitionType, sharedCardCoords, clearSharedCoords, isExiting]);

  const layoutCache = useRef<{ linkX: number; linkY: number; cardX: number; cardY: number; }[]>([]);
  const [activeCompany, setActiveCompany] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const hideCardRef = useRef<string | null>(null);
  const animationFrameRef = useRef<number>(0);

  const openModal = useCallback((companyId: string, triggerEl?: HTMLElement) => {
    // Find the floating card element — prefer the card span, fall back to trigger
    const group = triggerEl?.closest(".about-link-group");
    const cardEl = (
      group?.querySelector(`[data-company-id="${companyId}"]`) ??
      document.querySelector(`[data-company-id="${companyId}"]`)
    ) as HTMLElement | null;

    // Capture the card's live viewport rect (includes float + parallax transforms)
    setOriginRect(cardEl?.getBoundingClientRect() ?? null);
    setActiveCompany(companyId);

    // Hide the source card so it appears to "fly into" the modal
    if (cardEl) {
      cardEl.style.opacity = "0";
      cardEl.style.pointerEvents = "none";
      hideCardRef.current = companyId;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setModalVisible(true));
    });
    document.body.style.overflow = "hidden";
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    const companyId = hideCardRef.current;
    hideCardRef.current = null;

    // Start restoring the card at 150ms — the ease-out curve means the modal
    // has already traveled ~60% back to the card by this point. A 280ms fade
    // means the card is fully visible at ~430ms, just before the modal unmounts.
    let cleanupTimer: ReturnType<typeof setTimeout>;
    const restoreTimer = setTimeout(() => {
      const card = companyId
        ? (document.querySelector(`[data-company-id="${companyId}"]`) as HTMLElement | null)
        : null;
      if (card) {
        card.style.transition = "opacity 0.28s ease";
        card.style.opacity = "1";
        card.style.pointerEvents = "";
        cleanupTimer = setTimeout(() => {
          card.style.transition = "";
          card.style.opacity = "";
        }, 280);
      }
    }, 150);

    // Unmount the modal only after its close animation fully completes
    const unmountTimer = setTimeout(() => {
      setActiveCompany(null);
      setOriginRect(null);
      document.body.style.overflow = "";
    }, 480);

    return () => {
      clearTimeout(restoreTimer);
      clearTimeout(unmountTimer);
      clearTimeout(cleanupTimer);
    };
  }, []);

  // Compute FLIP inline style: positions modal at card rect on mount, transitions to center
  const getModalStyle = (): React.CSSProperties => {
    if (typeof window === "undefined") return {};
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const modalW = Math.min(860, vw - 48);
    const modalH = Math.min(540, vh * 0.9);

    if (modalVisible || !originRect) {
      return {
        transform: "translate(-50%, -50%)",
        borderRadius: "20px",
        opacity: modalVisible ? 1 : 0,
      };
    }

    // FLIP: translate modal center from viewport center → card center, scale to card size
    const cardCX = originRect.left + originRect.width / 2;
    const cardCY = originRect.top + originRect.height / 2;
    const dx = cardCX - vw / 2;
    const dy = cardCY - vh / 2;
    const scaleX = (originRect.width / modalW).toFixed(5);
    const scaleY = (originRect.height / modalH).toFixed(5);

    return {
      transform: `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px)) scale(${scaleX}, ${scaleY})`,
      borderRadius: "12px",
      opacity: 0.85,
    };
  };

  // Close modal on Escape key
  useEffect(() => {
    if (!activeCompany) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeCompany, closeModal]);

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

      // Temporarily clear inline transforms and transitions to measure static positions accurately
      const originalTransforms: string[] = [];
      const originalTransitions: string[] = [];
      groups.forEach((group, index) => {
        const card = group.querySelector(".about-hover-card") as HTMLElement;
        if (card) {
          originalTransforms[index] = card.style.transform;
          originalTransitions[index] = card.style.transition;
          card.style.transition = "none";
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

      // Restore original transitions and transforms instantly
      groups.forEach((group, index) => {
        const card = group.querySelector(".about-hover-card") as HTMLElement;
        if (card && originalTransforms[index] !== undefined) {
          card.style.transition = originalTransitions[index];
          card.style.transform = originalTransforms[index];
        }
      });
    };

    // Perform initial static layout caching pass
    cacheStaticCoordinates();

    const startTime = Date.now();
    let animationFrameId: number;
    let lastIsFlipping = true;

    const frameUpdate = () => {
      const scrollY = document.body.scrollTop || window.scrollY || document.documentElement.scrollTop || 0;
      const elapsed = (Date.now() - startTime) / 1000;

      if (lastIsFlipping !== isFlippingRef.current) {
        console.log("Animation loop: isFlippingRef.current changed to", isFlippingRef.current);
        lastIsFlipping = isFlippingRef.current;
      }

      groups.forEach((group, index) => {
        const card = group.querySelector(".about-hover-card") as HTMLElement;
        const connector = group.querySelector(".about-hover-connector") as HTMLElement;
        const cache = layoutCache.current[index];
        if (!card || !cache) return;

        if (isFlippingRef.current) {
          if (connector) {
            connector.style.opacity = "0";
            connector.style.pointerEvents = "none";
          }
          return;
        } else {
          if (connector && connector.style.opacity !== "") {
            connector.style.opacity = "";
            connector.style.pointerEvents = "";
          }
        }

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

      // Portrait image placeholder scroll parallax effect (rises up to meet the bottom of the text exactly at scroll bottom)
      // To make the effect look highly deliberate and dramatic, the parallax translation only begins once the bottom
      // of the last text row crosses the bottom of the viewport. Before that point, the image is consistently shifted
      // down by its maximum offset (180px) and stays completely static relative to the page text.
      // The progress of the rise is calculated dynamically using the image's own height as the active scroll range,
      // guaranteeing a perfectly smooth, state-free interpolation that completes exactly at the bottom of the page.
      const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
      const winHeight = window.innerHeight;
      const maxScroll = Math.max(1, docHeight - winHeight);
      
      const imageEl = document.querySelector(".about-image-placeholder") as HTMLElement | null;
      const textRow = document.querySelector(".about-content .page-row:nth-last-child(2)") as HTMLElement | null;
      
      if (textRow && imageEl) {
        const textRect = textRow.getBoundingClientRect();
        const textBottom = textRect.bottom;
        const viewportBottom = window.innerHeight;
        
        if (textBottom > viewportBottom) {
          // Hold placeholder at maximum downward displacement offset (180px)
          imageEl.style.transform = `translateY(180px)`;
        } else {
          // Calculate how far past the crossing point the text bottom has scrolled
          const textBottomOffset = viewportBottom - textBottom;
          
          // Use the image height plus padding as the active scroll range for the glide
          const imageHeight = imageEl.offsetHeight || 600;
          const activeRange = Math.max(100, imageHeight + 80);
          
          // Smooth sine ease-out transition
          const localProgress = Math.min(1, Math.max(0, textBottomOffset / activeRange));
          const easeProgress = Math.sin(localProgress * Math.PI / 2); // Sine ease-out
          const imageParallaxY = (1 - easeProgress) * 180; // 180px maximum displacement offset
          
          imageEl.style.transform = `translateY(${imageParallaxY.toFixed(2)}px)`;
        }
      } else if (imageEl) {
        // Fallback simple parallax if text row is not found
        const scrollProgress = Math.min(1, Math.max(0, scrollY / maxScroll));
        const imageParallaxY = (1 - scrollProgress) * 120;
        imageEl.style.transform = `translateY(${imageParallaxY.toFixed(2)}px)`;
      }
      
      animationFrameId = window.requestAnimationFrame(frameUpdate);
    };

    // Run adjustment immediately on mount to ensure 0ms lag time for connector lines and cards
    const timer = setTimeout(() => {
      cacheStaticCoordinates();
      // Start high-performance frame animation loop
      animationFrameId = window.requestAnimationFrame(frameUpdate);
      animationFrameRef.current = animationFrameId;
    }, 0);

    // Re-run caching after enter animation completes to ensure perfect alignment
    const correctionTimer = setTimeout(() => {
      cacheStaticCoordinates();
    }, 1200);

    // Remove enter animation classes once completed to clear active transforms (which prevent absolute positioning from referencing .about-container!)
    const animationCleanupTimer = setTimeout(() => {
      const rows = document.querySelectorAll(".page-row");
      rows.forEach((row) => {
        row.classList.remove("page-row--enter");
        row.classList.remove("page-row--enter-about");
        row.classList.remove("page-row--enter-flip");
      });
      // Re-cache static coordinates now that all transforms are cleared!
      cacheStaticCoordinates();
    }, 1500);

    // Re-cache static bounds on resize
    const handleResize = () => {
      cacheStaticCoordinates();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      clearTimeout(correctionTimer);
      clearTimeout(animationCleanupTimer);
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const company = activeCompany ? COMPANY_DATA[activeCompany] : null;

  const isFlipExit = isExiting && transitionType === "about-to-work";
  const isFlipEnter = !isExiting && transitionType === "work-to-about";
  const getExitClass = () => {
    if (isFlipExit) return "page-row--exit-flip";
    if (isExiting) return "page-row--exit-about";
    if (isFlipEnter || wasFlipEntered) return "page-row--enter-flip";
    return "page-row--enter-about";
  };

  return (
    <main className={`about-container${isFlipping ? " is-flipping" : ""}`}>
      <div className="about-content">
        <div
          className={`page-row ${getExitClass()}`}
          style={{ "--row-index": 0 } as React.CSSProperties}
        >
          <h1 className="about-paragraph" id="hero-title" style={{ fontWeight: 500 }}>
            Hi, my name is Ulises Reyes-Kaura.
          </h1>
        </div>

        <div
          className={`page-row ${getExitClass()}`}
          style={{ "--row-index": 1 } as React.CSSProperties}
        >
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
        </div>

        <div
          className={`page-row ${getExitClass()}`}
          style={{ "--row-index": 2 } as React.CSSProperties}
        >
          <p className="about-paragraph">
            I currently work as a product designer for{" "}
            <span className="about-link-group">
              <span className="about-nowrap-group">
                <Link
                  href="#"
                  className="about-bold-link about-link-work about-link-outlined"
                  onClick={(e) => { e.preventDefault(); openModal("google", e.currentTarget as HTMLElement); }}
                >
                  Google
                </Link>
                's
              </span>
              <span className="about-hover-connector about-connector-work">
                <span className="about-connector-dot start-dot"></span>
                <span className="about-connector-line"></span>
                <span className="about-connector-dot end-dot"></span>
              </span>
              <span
                data-company-id="google"
                className="about-hover-card about-card-work left-side about-company-card"
                onClick={(e) => openModal("google", e.currentTarget as HTMLElement)}
                role="button"
                tabIndex={0}
                aria-label="Open Google company details"
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openModal("google", e.currentTarget as HTMLElement); }}
              >
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
            products. Previously at Google, I worked for the Connect team, building internal tools for Google's sales, service, and support teams.
          </p>
        </div>

        <div
          className={`page-row ${getExitClass()}`}
          style={{ "--row-index": 3 } as React.CSSProperties}
        >
          <p className="about-paragraph">
            Before Google, I worked as lead product designer at{" "}
            <span className="about-link-group">
              <Link
                href="#"
                className="about-bold-link about-link-work about-link-outlined"
                onClick={(e) => { e.preventDefault(); openModal("notarize", e.currentTarget as HTMLElement); }}
              >
                Notarize
              </Link>
              <span className="about-hover-connector about-connector-work">
                <span className="about-connector-dot start-dot"></span>
                <span className="about-connector-line"></span>
                <span className="about-connector-dot end-dot"></span>
              </span>
              <span
                data-company-id="notarize"
                className="about-hover-card about-card-work right-side about-company-card"
                onClick={(e) => openModal("notarize", e.currentTarget as HTMLElement)}
                role="button"
                tabIndex={0}
                aria-label="Open Notarize company details"
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openModal("notarize", e.currentTarget as HTMLElement); }}
              >
                <span className="about-hover-card-inner">
                  <span className="about-hover-card-label">Notarize</span>
                </span>
              </span>
            </span>{" "}
            (now known as{" "}
            <Link href="#" className="about-bold-link about-link-work">
              Proof
            </Link>
            ), creating the mortgage notarization platform from the ground up, on the world's first online notarization service. Since its launch, Proof has closed on{" "}
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
        </div>

        <div
          className={`page-row ${getExitClass()}`}
          style={{ "--row-index": 4 } as React.CSSProperties}
        >
          <p className="about-paragraph">
            Previously, I served on the founding teams of two early stage startups;{" "}
            <span className="about-link-group">
              <Link
                href="#"
                className="about-bold-link about-link-work about-link-outlined"
                onClick={(e) => { e.preventDefault(); openModal("smarking", e.currentTarget as HTMLElement); }}
              >
                Smarking
              </Link>
              <span className="about-hover-connector about-connector-work">
                <span className="about-connector-dot start-dot"></span>
                <span className="about-connector-line"></span>
                <span className="about-connector-dot end-dot"></span>
              </span>
              <span
                data-company-id="smarking"
                className="about-hover-card about-card-work left-side about-company-card"
                onClick={(e) => openModal("smarking", e.currentTarget as HTMLElement)}
                role="button"
                tabIndex={0}
                aria-label="Open Smarking company details"
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openModal("smarking", e.currentTarget as HTMLElement); }}
              >
                <span className="about-hover-card-inner">
                  <span className="about-hover-card-label">Smarking</span>
                </span>
              </span>
            </span>{" "}
            (YC W2015) and{" "}
            <span className="about-link-group">
              <Link
                href="#"
                className="about-bold-link about-link-work about-link-outlined"
                onClick={(e) => { e.preventDefault(); openModal("adhawk", e.currentTarget as HTMLElement); }}
              >
                AdHawk
              </Link>
              <span className="about-hover-connector about-connector-work">
                <span className="about-connector-dot start-dot"></span>
                <span className="about-connector-line"></span>
                <span className="about-connector-dot end-dot"></span>
              </span>
              <span
                data-company-id="adhawk"
                className="about-hover-card about-card-work right-side about-company-card"
                onClick={(e) => openModal("adhawk", e.currentTarget as HTMLElement)}
                role="button"
                tabIndex={0}
                aria-label="Open AdHawk company details"
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openModal("adhawk", e.currentTarget as HTMLElement); }}
              >
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
        </div>

        <div
          className={`page-row ${getExitClass()}`}
          style={{ "--row-index": 5 } as React.CSSProperties}
        >
          <p className="about-paragraph">
            Outside of designing for tech companies, I am a professor at{" "}
            <span className="about-link-group">
              <span className="about-nowrap-group">
                <Link
                  href="https://ipd.me.upenn.edu/about/"
                  className="about-bold-link about-link-education about-link-outlined"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => { e.preventDefault(); openModal("upenn", e.currentTarget as HTMLElement); }}
                >
                  UPenn
                </Link>
                's
              </span>
              <span className="about-hover-connector about-connector-education">
                <span className="about-connector-dot start-dot"></span>
                <span className="about-connector-line"></span>
                <span className="about-connector-dot end-dot"></span>
              </span>
              <span
                data-company-id="upenn"
                className="about-hover-card about-card-education left-side about-company-card"
                onClick={(e) => openModal("upenn", e.currentTarget as HTMLElement)}
                role="button"
                tabIndex={0}
                aria-label="Open UPenn IPD details"
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openModal("upenn", e.currentTarget as HTMLElement); }}
              >
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
        </div>

        <div
          className={`page-row ${getExitClass()}`}
          style={{ "--row-index": 6 } as React.CSSProperties}
        >
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

        <div
          className={`page-row ${getExitClass()}`}
          style={{ "--row-index": 7 } as React.CSSProperties}
        >
          <div className="about-image-placeholder">
            {/* Portrait placeholder */}
          </div>
        </div>
      </div>

      {/* Company Modal */}
      {activeCompany && company && (
        <div
          className={`company-modal-scrim${modalVisible ? " company-modal-scrim--visible" : ""}`}
          onClick={closeModal}
          aria-hidden="true"
        >
          <div
            className={`company-modal${modalVisible ? " company-modal--visible" : ""}${company.type === "education" ? " company-modal--education" : ""}`}
            style={getModalStyle()}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${company.name} details`}
          >
            {/* Close button */}
            <button
              className="company-modal-close"
              onClick={closeModal}
              aria-label="Close modal"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Image placeholder (left column) */}
            <div className="company-modal-image">
              <div className="company-modal-image-inner">
                <span className="company-modal-image-label">{company.name}</span>
              </div>
            </div>

            {/* Details (right column) */}
            <div className="company-modal-details">
              <div className="company-modal-header">
                <h2 className="company-modal-name">{company.name}</h2>
                <p className="company-modal-role">{company.role}</p>
                <p className="company-modal-dates">{company.dates}</p>
              </div>

              <div className="company-modal-chips">
                {company.chips.map((chip) => (
                  <span key={chip} className="company-modal-chip">{chip}</span>
                ))}
              </div>

              <p className="company-modal-summary">{company.summary}</p>

              <a
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="company-modal-cta"
              >
                {company.urlLabel}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
