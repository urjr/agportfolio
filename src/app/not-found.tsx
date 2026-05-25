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

    // Set high-resolution canvas dimensions
    const width = 500;
    const height = 300;
    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    let animationId: number;
    let loaded = false;

    const handleLoad = () => {
      if (loaded) return;
      loaded = true;
      setImageLoaded(true);

      // Create an offscreen canvas to pre-render the static base image
      const offscreen = document.createElement("canvas");
      offscreen.width = width;
      offscreen.height = height;
      const oCtx = offscreen.getContext("2d");
      if (!oCtx) return;

      // Center and scale the image inside the offscreen canvas (contain fit)
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = width / height;
      let dWidth = width;
      let dHeight = height;
      let dx = 0;
      let dy = 0;

      if (imgRatio > canvasRatio) {
        dHeight = width / imgRatio;
        dy = (height - dHeight) / 2;
      } else {
        dWidth = height * imgRatio;
        dx = (width - dWidth) / 2;
      }

      // Draw the custom 404.png graphic (already white text on a black background) directly
      oCtx.drawImage(img, dx, dy, dWidth, dHeight);

      const render = () => {
        ctx.clearRect(0, 0, width, height);

        // Slices the offscreen pre-rendered image into horizontal bands and draws them with dynamic jitter
        const sliceCount = 45;
        const sliceHeight = height / sliceCount;

        for (let i = 0; i < sliceCount; i++) {
          const sy = i * sliceHeight;
          
          let jitter = 0;
          const rand = Math.random();
          
          if (isHoveredRef.current) {
            // Intense horizontal tearing / wave jitter when hovered
            if (rand > 0.3) {
              jitter = (Math.random() - 0.5) * 35;
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
            width,
            sliceHeight,
            jitter,
            sy,
            width,
            sliceHeight
          );
        }

        // Occasional digital chromatic aberration split bars
        if (Math.random() > (isHoveredRef.current ? 0.45 : 0.96)) {
          ctx.fillStyle = isHoveredRef.current ? "rgba(0, 255, 240, 0.45)" : "rgba(0, 255, 240, 0.25)"; // Cyan chromatic slice
          ctx.fillRect(0, Math.random() * height, width, Math.random() * 8);
        }
        if (Math.random() > (isHoveredRef.current ? 0.45 : 0.96)) {
          ctx.fillStyle = isHoveredRef.current ? "rgba(255, 0, 193, 0.45)" : "rgba(255, 0, 193, 0.25)"; // Magenta chromatic slice
          ctx.fillRect(0, Math.random() * height, width, Math.random() * 8);
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
        padding: 0, // Override main-content's header/footer paddings to perfectly center content
        backgroundColor: "#000000", // Pure black background
        color: "#ffffff", // Pure white text
        transition: "background-color 0.3s ease",
        width: "100vw",
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 100, // Mounts over navigation layers to highlight the isolated 404 broken state
      }}
    >
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
          width: "100%",
          maxWidth: "500px",
          userSelect: "none",
          position: "relative",
        }}
      >
        <canvas 
          ref={canvasRef} 
          style={{ 
            maxWidth: "100%", 
            height: "auto", 
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
          color: "#aaaaaa", // Slightly lighter grey for readability against black
          letterSpacing: "0.03em",
          textAlign: "center",
          fontFamily: "'Gabarito', sans-serif",
          fontWeight: 400,
        }}
      >
        Graphic and effect inspired by{" "}
        <a
          href="https://codepen.io/tmrDevelops/pen/jqqmOw"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "underline", color: "inherit", fontWeight: 500 }}
        >
          Tiffany Rayside (tmrDevelops)
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
          fontWeight: 900, // ExtraBold sans-serif font
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
