"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePageTransition } from "./components/TransitionProvider";

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { isExiting } = usePageTransition();

  // Set theme-dark globally on mount and revert on unmount
  useEffect(() => {
    document.body.classList.add("theme-dark");
    return () => {
      document.body.classList.remove("theme-dark");
    };
  }, []);

  // Keep a ref of isHovered so the render loop can read it without re-running the mount hook
  const isHoveredRef = useRef(isHovered);
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    let animationId: number;
    let loaded = false;
    let cleanupResize: (() => void) | null = null;

    const handleLoad = () => {
      if (loaded) return;
      loaded = true;

      // Create an offscreen canvas to pre-render the static base image
      const offscreen = document.createElement("canvas");
      const oCtx = offscreen.getContext("2d");
      if (!oCtx) return;

      const resize = () => {
        const w = window.innerWidth;
        const h = 320; // Perfect responsive height for the 404 graphic container
        canvas.width = w;
        canvas.height = h;

        offscreen.width = w;
        offscreen.height = h;
        oCtx.clearRect(0, 0, w, h);

        const imgRatio = img.naturalWidth / img.naturalHeight;
        // Keep asset same size (max 500px, or slightly smaller on screens narrower than 540px)
        const dWidth = Math.min(500, w - 40);
        const dHeight = dWidth / imgRatio;
        const dx = (w - dWidth) / 2;
        const dy = (h - dHeight) / 2;

        oCtx.drawImage(img, dx, dy, dWidth, dHeight);
      };

      resize();
      window.addEventListener("resize", resize);
      cleanupResize = () => window.removeEventListener("resize", resize);

      const render = () => {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Slices the offscreen pre-rendered image into horizontal bands (125 slices for an extremely fine digital look)
        const sliceCount = 125;
        const sliceHeight = h / sliceCount;

        for (let i = 0; i < sliceCount; i++) {
          const sy = i * sliceHeight;
          
          let jitter = 0;
          const rand = Math.random();
          
          if (isHoveredRef.current) {
            // Refined horizontal tearing / wave jitter when hovered (up to 16px displacement to prevent text overlapping)
            if (rand > 0.3) {
              jitter = (Math.random() - 0.5) * 16;
            }
          } else {
            // Subtle, eerie digital vibration when idle
            if (rand > 0.85) {
              jitter = (Math.random() - 0.5) * 5;
            }
          }

          ctx.drawImage(
            offscreen,
            0,
            sy,
            w,
            sliceHeight,
            jitter,
            sy,
            w,
            sliceHeight
          );
        }

        // High-frequency, ultra-fine digital static noise (1px high hair-thin lines for fine static feel)
        const fineNoiseLineCount = isHoveredRef.current ? 16 : 5;
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        for (let j = 0; j < fineNoiseLineCount; j++) {
          if (Math.random() > 0.4) {
            ctx.fillRect(
              Math.random() * w,
              Math.random() * h,
              Math.random() * (w * 0.25) + 10,
              1 // Exactly 1px thick for maximum high-res fine detail
            );
          }
        }

        // Occasional ultra-fine digital chromatic aberration split bars (max 3px height)
        if (Math.random() > (isHoveredRef.current ? 0.45 : 0.96)) {
          ctx.fillStyle = isHoveredRef.current ? "rgba(0, 255, 240, 0.45)" : "rgba(0, 255, 240, 0.25)"; // Cyan chromatic slice
          ctx.fillRect(0, Math.random() * h, w, Math.random() * 2 + 1); // Shrunk height to 1px - 3px
        }
        if (Math.random() > (isHoveredRef.current ? 0.45 : 0.96)) {
          ctx.fillStyle = isHoveredRef.current ? "rgba(255, 0, 193, 0.45)" : "rgba(255, 0, 193, 0.25)"; // Magenta chromatic slice
          ctx.fillRect(0, Math.random() * h, w, Math.random() * 2 + 1); // Shrunk height to 1px - 3px
        }

        animationId = requestAnimationFrame(render);
      };

      render();
    };

    // Rigorously bind handlers BEFORE assigning the image src to prevent race conditions
    img.onload = handleLoad;
    img.onerror = (e) => {
      console.error("Failed to load 404.png graphic:", e);
    };

    img.src = "/404.png";

    // Immediate execution fallback if already resolved from memory cache
    if (img.complete) {
      handleLoad();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (cleanupResize) {
        cleanupResize();
      }
    };
  }, []); // Run EXACTLY once on mount

  return (
    <main 
      className="main-content" 
      style={{ 
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh", 
        padding: "80px 0 0 0",
        backgroundColor: "transparent", // Inherit background from body transition smoothly
        color: "inherit", // Inherit color from body transition smoothly
        width: "100vw",
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 100, // Mounts over root pages to showcase the isolated 404 state
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body {
              background-color: #2B2017 !important;
              color: #FAF8F5 !important;
            }
            .navbar, .footer {
              background-color: rgba(43, 32, 23, 0.85) !important;
              color: #FAF8F5 !important;
            }
          `,
        }}
      />
      <div
        className={`page-row ${isExiting ? "page-row--exit" : "page-row--enter"}`}
        style={{ "--row-index": 0 } as React.CSSProperties}
      >
        <div
          ref={containerRef}
          className="glitch-canvas-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "320px",
            width: "100%",
            userSelect: "none",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <link rel="preload" href="/404.png" as="image" />
          <Link
            href="/"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              outline: "none",
              opacity: isHovered ? 1 : 0.6,
              transition: "opacity 0.2s ease",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
          </Link>
        </div>
      </div>

      <div
        className={`page-row ${isExiting ? "page-row--exit" : "page-row--enter"}`}
        style={{ "--row-index": 1 } as React.CSSProperties}
      >
        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.68rem",
            color: "#aaaaaa",
            letterSpacing: "0.03em",
            textAlign: "center",
            fontFamily: "'Gabarito', sans-serif",
            fontWeight: 400,
          }}
        >
          Shoutout to{" "}
          <a
            href="https://codepen.io/tmrDevelops/pen/jqqmOw"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline", color: "inherit", fontWeight: 500 }}
          >
            Tiffany Rayside
          </a>
        </p>
      </div>


    </main>
  );
}
