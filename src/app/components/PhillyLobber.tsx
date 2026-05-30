"use client";

import { useState, useEffect, useRef } from "react";

interface PhillyLobberProps {
  /** Theme of the particles: "philadelphia" | "product" | "educator" */
  theme: "philadelphia" | "product" | "educator";
  /**
   * Numeric counter trigger. Every time this value increases,
   * a lob animation cycle is triggered (if not on cooldown).
   */
  triggerCount: number;
}

interface Particle {
  id: string;
  src: string;
  alt: string;
  size: number;
  startX: string;
  endX: string;
  peakY: string;
  duration: string;
  delay: string;
  startRot: string;
  endRot: string;
}

interface SprinkleParticle {
  id: string;
  src: string;
  size: number;
  left: string;
  top: string;
  endX: string;
  peakY: string;
  endY: string;
  duration: string;
  delay: string;
  spinDeg: string;
}

const SPRINKLE_ASSETS = [
  "/assets/home/sprinke-1.svg",
  "/assets/home/sprinkle-2.svg",
  "/assets/home/sprinkle-3.svg"
];

const THEME_ITEMS = {
  philadelphia: [
    { src: "/assets/home/philly-steak.svg", alt: "Philly Cheesesteak", baseSize: 300 },
    { src: "/assets/home/philly-bell.svg", alt: "Liberty Bell", baseSize: 252 },
    { src: "/assets/home/philly-pretzel.svg", alt: "Philly Pretzel", baseSize: 228 }
  ],
  product: [
    { src: "/assets/home/product-laptop.svg", alt: "Product Laptop", baseSize: 300 },
    { src: "/assets/home/product-phone.svg", alt: "Product Phone", baseSize: 252 },
    { src: "/assets/home/product-tablet.svg", alt: "Product Tablet", baseSize: 228 }
  ],
  educator: [
    { src: "/assets/home/educator-cap.svg", alt: "Educator Cap", baseSize: 300 },
    { src: "/assets/home/educator-diploma.svg", alt: "Educator Diploma", baseSize: 252 },
    { src: "/assets/home/educator-upenn.svg", alt: "UPenn Crest", baseSize: 228 }
  ]
};

export default function PhillyLobber({ theme, triggerCount }: PhillyLobberProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [sprinkles, setSprinkles] = useState<SprinkleParticle[]>([]);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up any active timers strictly when the component unmounts
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (triggerCount === 0) return;

    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }

    // KICK OFF ANIMATION

    // Enforce travel direction contrast: guarantee at least 1 of the 3 items flies in the opposite direction.
    // Base array is either [true, true, false] or [true, false, false].
    const directions = Math.random() > 0.5 
      ? [true, true, false] 
      : [true, false, false];
    
    // Fisher-Yates shuffle the directions array so assignments to Cheesecake, Bell, and Pretzel are random
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    // Generate randomized particles for the three Philly items
    const newParticles = THEME_ITEMS[theme].map((item, idx) => {
      const id = `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`;

      // Use the contrast-guaranteed launch direction for this index
      const fromLeft = directions[idx];

      let startX: number;
      let endX: number;
      let startRot: number;
      let endRot: number;

      if (fromLeft) {
        // Launch from Left, arc to Right
        startX = 5 + Math.random() * 20; // 5vw to 25vw
        endX = 55 + Math.random() * 35;  // 55vw to 90vw
        
        // Aerodynamic clockwise tilt
        startRot = -15 + Math.random() * 8; // -15deg to -7deg
        endRot = 10 + Math.random() * 12;   // 10deg to 22deg
      } else {
        // Launch from Right, arc to Left
        startX = 75 + Math.random() * 20; // 75vw to 95vw
        endX = 10 + Math.random() * 35;  // 10vw to 45vw
        
        // Aerodynamic counter-clockwise tilt
        startRot = 7 + Math.random() * 8;   // 7deg to 15deg
        endRot = -22 - Math.random() * 10;  // -32deg to -22deg
      }

      // Fully randomize peak height across items
      const peakY = 55 + Math.random() * 28; // 55vh to 83vh

      // Fully randomize duration and delay (staggered in random order!)
      const duration = 1.9 + Math.random() * 0.6; // 1.9s to 2.5s
      const delay = Math.random() * 0.25; // 0s to 0.25s

      return {
        id,
        src: item.src,
        alt: item.alt,
        size: item.baseSize,
        startX: `${startX}vw`,
        endX: `${endX}vw`,
        peakY: `${peakY}vh`,
        duration: `${duration}s`,
        delay: `${delay}s`,
        startRot: `${startRot}deg`,
        endRot: `${endRot}deg`
      };
    });

    setParticles(newParticles);

    // Generate 45 randomized sprinkle confetti particles (15 Left, 15 Right, 15 Top)
    const newSprinkles: SprinkleParticle[] = [];
    const sprinkleCount = 45;

    for (let idx = 0; idx < sprinkleCount; idx++) {
      const id = `${Date.now()}-sprinkle-${idx}-${Math.random().toString(36).substr(2, 9)}`;
      const src = SPRINKLE_ASSETS[Math.floor(Math.random() * SPRINKLE_ASSETS.length)];
      
      // Randomize sizes from 12px to 26px
      const size = 12 + Math.random() * 14;

      let left: string;
      let top: string;
      let endX: string;
      let peakY: string;
      let endY: string;
      let duration: number;
      let delay: number;
      let spinDeg: number;

      // Group into three types: 15 Left Burst, 15 Right Burst, 15 Top Bursts
      if (idx % 3 === 0) {
        // Left Side Burst: launches from upper-middle section of left edge
        left = "-6vw"; 
        top = `${25 + Math.random() * 30}vh`; // 25vh to 55vh
        
        // Shoots diagonally across the screen with a wide horizontal throw
        endX = `${45 + Math.random() * 45}vw`; // 45vw to 90vw
        
        // Beautiful gravity arch vertical coordinates (relative to start)
        peakY = `-${30 + Math.random() * 20}vh`; // Arcs UP by 30vh to 50vh (negative Y)
        endY = `${85 + Math.random() * 35}vh`;   // Falls DOWN completely off the screen
        
        duration = 1.6 + Math.random() * 0.7; // 1.6s to 2.3s
        delay = Math.random() * 0.2;
        spinDeg = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540);
      } else if (idx % 3 === 1) {
        // Right Side Burst: launches from upper-middle section of right edge
        left = "106vw";
        top = `${25 + Math.random() * 30}vh`;
        
        // Shoots diagonally left with a wide horizontal throw
        endX = `${-45 - Math.random() * 45}vw`; // -45vw to -90vw
        
        // Beautiful gravity arch vertical coordinates
        peakY = `-${30 + Math.random() * 20}vh`; // Arcs UP by 30vh to 50vh (negative Y)
        endY = `${85 + Math.random() * 35}vh`;   // Falls DOWN completely off the screen
        
        duration = 1.6 + Math.random() * 0.7;
        delay = Math.random() * 0.2;
        spinDeg = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540);
      } else {
        // Top Bursts: launches from the top edge, shoots slightly up and wide sideways, then falls
        left = `${15 + Math.random() * 70}vw`; // 15vw to 85vw across the top
        top = "-5vh";
        
        // Distinct horizontal push in either direction for a beautiful arcing fall
        endX = `${(Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 25)}vw`; // -45vw to -20vw OR +20vw to +45vw
        
        // Launches upwards above the screen before peaking and plunging
        peakY = `-${15 + Math.random() * 20}vh`; // Arcs UP by 15vh to 35vh
        endY = `${115 + Math.random() * 20}vh`;  // Plunges all the way down below screen
        
        duration = 1.8 + Math.random() * 0.8;  // 1.8s to 2.6s (drifts/falls gracefully)
        delay = Math.random() * 0.25;
        spinDeg = (Math.random() > 0.5 ? 1 : -1) * (270 + Math.random() * 360);
      }

      newSprinkles.push({
        id,
        src,
        size,
        left,
        top,
        endX,
        peakY,
        endY,
        duration: `${duration}s`,
        delay: `${delay}s`,
        spinDeg: `${spinDeg}deg`
      });
    }

    setSprinkles(newSprinkles);

    // Cooldown matches maximum flight time (duration + delay)
    // Max animation duration is 2.5s duration + 0.25s delay = 2.75s.
    // Setting cooldown to 2.8 seconds.
    cooldownTimerRef.current = setTimeout(() => {
      setParticles([]);
      setSprinkles([]);
      cooldownTimerRef.current = null;
    }, 2800);
  }, [triggerCount]);

  return (
    <>
      {/* SPRINKLE CONFETTI OVERLAY (Layered behind bio text at z-index: 1) */}
      <div className={`philly-sprinkles-overlay theme-${theme}`}>
        {sprinkles.map((sprinkle) => (
          <div
            key={sprinkle.id}
            className="sprinkle-particle"
            style={{
              left: sprinkle.left,
              top: sprinkle.top,
              "--end-x": sprinkle.endX,
              animationDuration: sprinkle.duration,
              animationDelay: sprinkle.delay,
            } as React.CSSProperties}
          >
            <div
              className="sprinkle-particle-y"
              style={{
                "--peak-y": sprinkle.peakY,
                "--end-y": sprinkle.endY,
                animationDuration: sprinkle.duration,
                animationDelay: sprinkle.delay,
              } as React.CSSProperties}
            >
              <div
                className="sprinkle-particle-rot"
                style={{
                  "--spin-deg": sprinkle.spinDeg,
                  animationDuration: sprinkle.duration,
                  animationDelay: sprinkle.delay,
                } as React.CSSProperties}
              >
                <img
                  src={sprinkle.src}
                  alt="sprinkle confetti"
                  className="philly-sprinkle-img"
                  style={{
                    "--size": sprinkle.size
                  } as React.CSSProperties}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* OVERSIZED PHILLY OVERLAY (Layered in front of text at z-index: 10) */}
      <div className={`philly-lobber-overlay theme-${theme}`}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="philly-particle"
            style={{
              "--start-x": particle.startX,
              "--end-x": particle.endX,
              animationDuration: particle.duration,
              animationDelay: particle.delay,
            } as React.CSSProperties}
          >
            <div
              className="philly-particle-y"
              style={{
                "--peak-y": particle.peakY,
                animationDuration: particle.duration,
                animationDelay: particle.delay,
              } as React.CSSProperties}
            >
              <div
                className="philly-particle-rot"
                style={{
                  "--start-rot": particle.startRot,
                  "--end-rot": particle.endRot,
                  animationDuration: particle.duration,
                  animationDelay: particle.delay,
                } as React.CSSProperties}
              >
                <img
                  src={particle.src}
                  alt={particle.alt}
                  className="philly-particle-img"
                  style={{
                    "--size": particle.size
                  } as React.CSSProperties}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
