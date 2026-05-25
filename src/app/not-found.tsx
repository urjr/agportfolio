"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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
      setImageLoaded(true);

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

        // Slices the offscreen pre-rendered image into horizontal bands and draws them with dynamic jitter
        const sliceCount = 45;
        const sliceHeight = h / sliceCount;

        for (let i = 0; i < sliceCount; i++) {
          const sy = i * sliceHeight;
          
          let jitter = 0;
          const rand = Math.random();
          
          if (isHoveredRef.current) {
            // Intense horizontal tearing / wave jitter when hovered (up to 45px displacement)
            if (rand > 0.3) {
              jitter = (Math.random() - 0.5) * 45;
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

        // Occasional digital chromatic aberration split bars
        if (Math.random() > (isHoveredRef.current ? 0.45 : 0.96)) {
          ctx.fillStyle = isHoveredRef.current ? "rgba(0, 255, 240, 0.45)" : "rgba(0, 255, 240, 0.25)"; // Cyan chromatic slice
          ctx.fillRect(0, Math.random() * h, w, Math.random() * 8);
        }
        if (Math.random() > (isHoveredRef.current ? 0.45 : 0.96)) {
          ctx.fillStyle = isHoveredRef.current ? "rgba(255, 0, 193, 0.45)" : "rgba(255, 0, 193, 0.25)"; // Magenta chromatic slice
          ctx.fillRect(0, Math.random() * h, w, Math.random() * 8);
        }

        animationId = requestAnimationFrame(render);
      };

      render();
    };

    // Rigorously bind handlers BEFORE assigning the image src to prevent race conditions
    img.onload = handleLoad;
    img.onerror = (e) => {
      console.error("Failed to load 404.png graphic:", e);
      // Fallback in case of asset failures to prevent being permanently stuck
      setImageLoaded(true);
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
        padding: "80px 0 0 0", // Top padding to clear the reintroduced inverted navbar elegantly
        backgroundColor: "#000000", // Pure black background
        color: "#ffffff", // Pure white text
        transition: "background-color 0.3s ease",
        width: "100vw",
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 100, // Mounts over root pages to showcase the isolated 404 state
      }}
    >
      {/* Custom Inverted Navbar */}
      <header 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "70px",
          backgroundColor: "rgba(0, 0, 0, 0.85)", // Inverted dark background
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.15)", // Premium subtle border
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 2rem",
          zIndex: 110, // Renders above main 404 content
        }}
      >
        <div 
          style={{
            position: "absolute",
            left: "2rem",
            fontFamily: "'Pecita', cursive, serif",
            fontSize: "1.4rem",
            fontWeight: "normal",
            textTransform: "none",
          }}
        >
          <Link href="/" style={{ color: "#ffffff", textDecoration: "none" }}>
            U R-K
          </Link>
        </div>
        <nav aria-label="Main Navigation">
          <ul 
            style={{
              display: "flex",
              gap: "2.5rem",
              listStyle: "none",
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily: "'Gabarito', sans-serif",
              fontWeight: 500,
              padding: 0,
              margin: 0,
            }}
          >
            <li>
              <Link 
                href="/work" 
                style={{ 
                  color: "#ffffff", 
                  textDecoration: "none",
                  transition: "color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#ff00c1"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#ffffff"}
              >
                Work
              </Link>
            </li>
            <li>
              <Link 
                href="/about" 
                style={{ 
                  color: "#ffffff", 
                  textDecoration: "none",
                  transition: "color 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#ff00c1"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#ffffff"}
              >
                About
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Full-width glitch viewport container */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "320px",
          width: "100%", // Span full width of screen
          userSelect: "none",
          position: "relative",
          overflow: "hidden", // Prevents horizontal scrollbars during canvas horizontal jitter
        }}
      >
        <canvas 
          ref={canvasRef} 
          style={{ 
            width: "100%", 
            height: "100%", 
            display: imageLoaded ? "block" : "none" 
          }} 
        />
        {!imageLoaded && (
          <div 
            style={{ 
              fontFamily: "'Gabarito', sans-serif", 
              fontSize: "1.2rem", 
              fontWeight: 500, 
              opacity: 0.5,
              position: "absolute"
            }}
          >
            LOADING MATRIX...
          </div>
        )}
      </div>

      <p
        style={{
          marginTop: "1.5rem",
          fontSize: "0.68rem",
          color: "#aaaaaa", // Lighter grey for readability
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

      <Link
        href="/"
        style={{
          display: "inline-block",
          marginTop: "3.5rem",
          textTransform: "uppercase",
          fontSize: "0.85rem",
          letterSpacing: "0.15em",
          fontFamily: "'Gabarito', sans-serif",
          fontWeight: 900, // ExtraBold
          borderBottom: "2px solid #ffffff",
          paddingBottom: "4px",
          color: "#ffffff",
          textDecoration: "none",
          transition: "border-color 0.2s, color 0.2s, opacity 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#ff00c1";
          e.currentTarget.style.color = "#ff00c1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#ffffff";
          e.currentTarget.style.color = "#ffffff";
        }}
      >
        take me home
      </Link>
    </main>
  );
}
