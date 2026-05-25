"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high-resolution canvas dimensions
    const width = 450;
    const height = 220;
    canvas.width = width;
    canvas.height = height;

    // Create an offscreen canvas to pre-render the static text
    const offscreen = document.createElement("canvas");
    offscreen.width = width;
    offscreen.height = height;
    const oCtx = offscreen.getContext("2d");
    if (!oCtx) return;

    // Pre-draw the "404" static text on the offscreen canvas
    oCtx.fillStyle = "#000000";
    oCtx.font = "900 125px 'Gabarito', sans-serif";
    oCtx.textAlign = "center";
    oCtx.textBaseline = "middle";
    oCtx.fillText("404", width / 2, height / 2 - 15);

    oCtx.font = "700 15px 'Gabarito', sans-serif";
    if ("letterSpacing" in oCtx) {
      oCtx.letterSpacing = "6px";
    }
    oCtx.fillText("PAGE NOT FOUND", width / 2 + 3, height / 2 + 65);

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Slices the offscreen pre-rendered text into horizontal bands and draws them with dynamic jitter
      const sliceCount = 35;
      const sliceHeight = height / sliceCount;

      for (let i = 0; i < sliceCount; i++) {
        const sy = i * sliceHeight;
        
        let jitter = 0;
        const rand = Math.random();
        
        if (isHovered) {
          // Intense horizontal tearing / wave jitter when hovered
          if (rand > 0.35) {
            jitter = (Math.random() - 0.5) * 22;
          }
        } else {
          // Subtle, eerie digital vibration when idle
          if (rand > 0.85) {
            jitter = (Math.random() - 0.5) * 4;
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
      if (Math.random() > (isHovered ? 0.5 : 0.95)) {
        ctx.fillStyle = isHovered ? "rgba(0, 255, 240, 0.4)" : "rgba(0, 255, 240, 0.25)"; // Cyan chromatic slice
        ctx.fillRect(0, Math.random() * height, width, Math.random() * 6);
      }
      if (Math.random() > (isHovered ? 0.5 : 0.95)) {
        ctx.fillStyle = isHovered ? "rgba(255, 0, 193, 0.4)" : "rgba(255, 0, 193, 0.25)"; // Magenta chromatic slice
        ctx.fillRect(0, Math.random() * height, width, Math.random() * 6);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isHovered]);

  return (
    <main className="main-content" style={{ flexDirection: "column", minHeight: "100vh", justifyContent: "center" }}>
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "240px",
          width: "100%",
          maxWidth: "450px",
          userSelect: "none",
        }}
      >
        <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto" }} />
      </div>

      <p
        style={{
          marginTop: "1rem",
          fontSize: "0.68rem",
          color: "#888",
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
          fontWeight: 800, // Bold (ExtraBold) sans-serif font
          borderBottom: "2px solid #000",
          paddingBottom: "4px",
          color: "#000",
          textDecoration: "none",
          transition: "border-color 0.2s, opacity 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#ff00c1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#000";
        }}
      >
        take me home
      </Link>
    </main>
  );
}
