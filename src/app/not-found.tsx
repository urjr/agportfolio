"use client";

import TransitionLink from "./components/TransitionLink";
import { useEffect, useRef, useState } from "react";
import { usePageTransition } from "./components/TransitionProvider";

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { isExiting } = usePageTransition();
  const [canvasHeight, setCanvasHeight] = useState(320);

  // Set theme-dark and is-404-page globally on mount and revert on unmount
  useEffect(() => {
    document.body.classList.add("theme-dark");
    document.body.classList.add("is-404-page");
    return () => {
      document.body.classList.remove("theme-dark");
      document.body.classList.remove("is-404-page");
    };
  }, []);

  // Keep a ref of isHovered so the render loop can read it without re-running the mount hook
  const isHoveredRef = useRef(isHovered);
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  // Keep a ref of isExiting so the render loop can read it without re-running the mount hook
  const isExitingRef = useRef(isExiting);
  useEffect(() => {
    isExitingRef.current = isExiting;
  }, [isExiting]);

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
        const imgRatio = img.naturalWidth / img.naturalHeight;
        // Keep asset same size (max 500px, or slightly smaller on screens narrower than 540px)
        const dWidth = Math.min(500, w - 40);
        const dHeight = dWidth / imgRatio;
        const h = Math.ceil(dHeight);

        setCanvasHeight(h);

        canvas.width = w;
        canvas.height = h;

        offscreen.width = w;
        offscreen.height = h;
        oCtx.clearRect(0, 0, w, h);

        const dx = (w - dWidth) / 2;
        const dy = 0;

        oCtx.drawImage(img, dx, dy, dWidth, dHeight);
      };

      resize();
      window.addEventListener("resize", resize);
      cleanupResize = () => window.removeEventListener("resize", resize);

      let exitStartTime: number | null = null;

      const render = () => {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        let exitProgress = 0;
        if (isExitingRef.current) {
          if (!exitStartTime) {
            exitStartTime = performance.now();
          }
          // The transition duration from 404 page is 900ms
          exitProgress = Math.min(1, (performance.now() - exitStartTime) / 900);
        }

        // Calculate CRT screen collapse factors (starts at 55% of the exit duration)
        let scaleY = 1;
        let scaleX = 1;
        if (exitProgress > 0.55) {
          const collapseProgress = (exitProgress - 0.55) / 0.45; // 0 to 1
          if (collapseProgress < 0.7) {
            // Height collapses first
            const t = collapseProgress / 0.7; // 0 to 1
            scaleY = 1 - t;
            scaleX = 1;
          } else {
            // Then width collapses
            const t = (collapseProgress - 0.7) / 0.3; // 0 to 1
            scaleY = 0.006; // extremely thin line
            scaleX = 1 - t;
          }
        }

        // Slices the offscreen pre-rendered image into horizontal bands (220 slices for an extremely fine digital look)
        const sliceCount = 220;
        const sliceHeight = h / sliceCount;

        for (let i = 0; i < sliceCount; i++) {
          const sy = i * sliceHeight;
          
          let jitter = 0;
          const rand = Math.random();
          
          if (isExitingRef.current) {
            // Glitch meltdown! Jitter grows exponentially as exit progresses
            const exitJitterIntensity = exitProgress * 180;
            if (rand > 0.1) {
              jitter = (Math.random() - 0.5) * (16 + exitJitterIntensity);
            }
          } else if (isHoveredRef.current) {
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

          // Apply CRT collapse transformations
          const destW = w * scaleX;
          const destH = sliceHeight * scaleY;
          const destX = (w / 2) + (jitter - (w / 2)) * scaleX;
          const destY = (h / 2) + (sy - (h / 2)) * scaleY;

          ctx.drawImage(
            offscreen,
            0,
            sy,
            w,
            sliceHeight,
            destX,
            destY,
            destW,
            destH
          );
        }

        // High-frequency, ultra-fine digital static noise
        const fineNoiseLineCount = isExitingRef.current
          ? Math.floor(30 + exitProgress * 150)
          : (isHoveredRef.current ? 35 : 12);

        ctx.fillStyle = isExitingRef.current
          ? `rgba(255, 255, 255, ${0.12 + exitProgress * 0.58})`
          : "rgba(255, 255, 255, 0.15)";

        for (let j = 0; j < fineNoiseLineCount; j++) {
          if (Math.random() > 0.4) {
            ctx.fillRect(
              Math.random() * w,
              Math.random() * h,
              Math.random() * (w * (isExitingRef.current ? 0.75 : 0.25)) + 10,
              isExitingRef.current ? Math.floor(Math.random() * 8 + 1) : 1
            );
          }
        }

        // Add true high-frequency CRT pixel grain / static dots
        const pixelGrainCount = isExitingRef.current
          ? Math.floor(100 + exitProgress * 300)
          : (isHoveredRef.current ? 120 : 40);
        ctx.fillStyle = isExitingRef.current
          ? `rgba(255, 255, 255, ${0.08 + exitProgress * 0.2})`
          : "rgba(255, 255, 255, 0.08)";
        for (let g = 0; g < pixelGrainCount; g++) {
          ctx.fillRect(
            Math.random() * w,
            Math.random() * h,
            Math.random() * 2 + 1,
            Math.random() * 2 + 1
          );
        }

        // Occasional ultra-fine digital chromatic aberration split bars
        const chromaticChance = isExitingRef.current ? (1 - exitProgress * 0.8) : (isHoveredRef.current ? 0.45 : 0.96);
        if (Math.random() > chromaticChance) {
          ctx.fillStyle = isExitingRef.current ? "rgba(0, 255, 240, 0.8)" : (isHoveredRef.current ? "rgba(0, 255, 240, 0.45)" : "rgba(0, 255, 240, 0.25)");
          ctx.fillRect(0, Math.random() * h, w, Math.random() * (isExitingRef.current ? 25 : 2) + 1);
        }
        if (Math.random() > chromaticChance) {
          ctx.fillStyle = isExitingRef.current ? "rgba(255, 0, 193, 0.8)" : (isHoveredRef.current ? "rgba(255, 0, 193, 0.45)" : "rgba(255, 0, 193, 0.25)");
          ctx.fillRect(0, Math.random() * h, w, Math.random() * (isExitingRef.current ? 25 : 2) + 1);
        }

        // Draw glowing CRT phosphor beam center line / dot
        if (exitProgress > 0.55) {
          const collapseProgress = (exitProgress - 0.55) / 0.45;
          ctx.fillStyle = "#FFFFFF";
          ctx.shadowBlur = 15;
          ctx.shadowColor = "#00fff0";

          if (collapseProgress < 0.7) {
            const beamWidth = w * (1 - (collapseProgress / 0.7));
            ctx.fillRect(
              (w / 2) - (beamWidth / 2),
              (h / 2) - 1.5,
              beamWidth,
              3
            );
          } else {
            const dotSize = Math.max(0, 6 * (1 - ((collapseProgress - 0.7) / 0.3)));
            if (dotSize > 0) {
              ctx.beginPath();
              ctx.arc(w / 2, h / 2, dotSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.shadowBlur = 0; // reset
        }

        animationId = requestAnimationFrame(render);
      };

      render();
    };

    // Rigorously bind handlers BEFORE assigning the image src to prevent race conditions
    img.onload = handleLoad;
    img.onerror = (e) => {
      console.error("Failed to load 404-rip.png graphic:", e);
    };

    img.src = "/assets/global/404-rip.png";

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
            html, body {
              background-color: #2B2017 !important;
              color: #FAF8F5 !important;
              overflow: hidden !important;
              height: 100% !important;
            }
            .navbar {
              background-color: transparent !important;
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
              border-bottom: 1px solid transparent !important;
            }
            .footer {
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
            minHeight: `${canvasHeight}px`,
            width: "100%",
            userSelect: "none",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <link rel="preload" href="/assets/global/404-rip.png" as="image" />
          <TransitionLink
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
          </TransitionLink>
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
