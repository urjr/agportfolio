"use client";

import { useState, useRef, useEffect } from "react";
import { usePageTransition } from "./TransitionProvider";

interface RetroWindowProps {
  url: string;
  title: string;
  isOpen: boolean;
  triggerId?: string;
  linkPos?: { x: number; y: number };
  isClosing?: boolean;
  onClose: () => void;
}

export default function RetroWindow({ url, title, isOpen, triggerId, linkPos, isClosing: isClosingProp, onClose }: RetroWindowProps) {
  const { isExiting } = usePageTransition();
  const [position, setPosition] = useState(() => {
    // Offset by half of window's width (580/2 = 290) and height (520/2 = 260) to scale out of the exact click coordinates
    const startX = linkPos ? linkPos.x - 290 : (typeof window !== "undefined" ? (window.innerWidth - 580) / 2 + window.scrollX : 0);
    const startY = linkPos ? linkPos.y - 260 : (typeof window !== "undefined" ? (window.innerHeight - 520) / 2 + window.scrollY : 0);
    return { x: startX, y: startY };
  });
  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(0.15);
  const [isDragging, setIsDragging] = useState(false);
  
  const dragStartRef = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Track if we are playing the closing exit animation
  const [isClosing, setIsClosing] = useState(false);

  // Center or offset initial position on open/change
  useEffect(() => {
    if (isOpen && !isClosing) {
      const rectWidth = windowRef.current?.offsetWidth || 580;
      const rectHeight = windowRef.current?.offsetHeight || 520;
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      
      let targetX = scrollX + (window.innerWidth - rectWidth) / 2;
      let targetY = scrollY + (window.innerHeight - rectHeight) / 2 - 40;

      // Apply distinct offsets depending on trigger source
      if (triggerId === "link-product-designer") {
        targetX -= 200; // Spread out more top-left
        targetY -= 140;
      } else if (triggerId === "link-educator") {
        targetX += 200; // Spread out more bottom-right
        targetY += 120;
      } else if (triggerId === "link-philadelphia") {
        targetX += 0;
        targetY += 220; // Spread out more directly lower
      }

      // Clamp target coordinates to keep the retro window 100% visible inside the browser window
      const minX = scrollX + 16;
      const maxX = scrollX + window.innerWidth - rectWidth - 16;
      const minY = scrollY + 16;
      const maxY = scrollY + window.innerHeight - rectHeight - 16;

      // If the viewport is very small and the clamping constraints overlap, fallback to centering
      let clampedX;
      if (minX > maxX) {
        clampedX = scrollX + (window.innerWidth - rectWidth) / 2;
      } else {
        clampedX = Math.max(minX, Math.min(maxX, targetX));
      }

      let clampedY;
      if (minY > maxY) {
        clampedY = scrollY + (window.innerHeight - rectHeight) / 2;
      } else {
        clampedY = Math.max(minY, Math.min(maxY, targetY));
      }

      setPosition({ x: clampedX, y: clampedY });
      setOpacity(1);
      setScale(1);
    }
  }, [isOpen, url, triggerId, linkPos]);

  const handleCloseClick = () => {
    setIsClosing(true);

    const startX = linkPos ? linkPos.x - 290 : position.x;
    const startY = linkPos ? linkPos.y - 260 : position.y;

    setPosition({ x: startX, y: startY });
    setOpacity(0);
    setScale(0.15);

    setTimeout(() => {
      onClose();
      setIsClosing(false); // Reset state for next mount
    }, 350);
  };

  const handleMaximizeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag triggers

    const rect = windowRef.current?.getBoundingClientRect();
    const width = rect ? rect.width : (windowRef.current?.offsetWidth || 580);
    const height = rect ? rect.height : (windowRef.current?.offsetHeight || 520);

    // Calculate viewport top-left relative to screen
    // Standard calculation uses mouse event's screen/client coordinates if available
    const viewportLeft = (e.screenX !== undefined && e.clientX !== undefined)
      ? (e.screenX - e.clientX)
      : window.screenX;
    
    const viewportTop = (e.screenY !== undefined && e.clientY !== undefined)
      ? (e.screenY - e.clientY)
      : window.screenY;

    const left = rect ? (viewportLeft + rect.left) : (window.screenX + (window.innerWidth - width) / 2);
    const top = rect ? (viewportTop + rect.top) : (window.screenY + (window.innerHeight - height) / 2);

    try {
      window.open(
        url,
        "_blank",
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no,toolbar=no,menubar=no`
      );
    } catch (err) {
      console.error("Popup blocker prevented opening window:", err);
    }

    onClose(); // Instantly close retro window
  };

  // Watch for dynamic close requests from parent when switching links
  useEffect(() => {
    if (isClosingProp) {
      handleCloseClick();
    }
  }, [isClosingProp]);

  // Trigger closing/exit animation when transitioning to another page
  useEffect(() => {
    if (isExiting) {
      setIsClosing(true);

      const startX = linkPos ? linkPos.x - 290 : position.x;
      const startY = linkPos ? linkPos.y - 260 : position.y;

      setPosition({ x: startX, y: startY });
      setOpacity(0);
      setScale(0.15);
    }
  }, [isExiting, linkPos]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isClosing) return; // Prevent drag during close transition
    if (e.button !== 0) return;
    
    const target = e.target as HTMLElement;
    if (target.closest(".retro-close-btn") || target.closest(".retro-zoom-btn") || target.closest(".retro-window-dot")) return;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      console.error("[RetroWindow] setPointerCapture failed:", err);
    }

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    
    const rectWidth = windowRef.current?.offsetWidth || 580;
    const rectHeight = windowRef.current?.offsetHeight || 520;

    // Strict viewport-only boundaries (with 10px padding) so the window can never be dragged out of view or cause page scrolling
    const minX = 10;
    const maxX = window.innerWidth - rectWidth - 10;
    const minY = 10;
    const maxY = window.innerHeight - rectHeight - 10;

    const boundedX = Math.max(minX, Math.min(maxX, newX));
    const boundedY = Math.max(minY, Math.min(maxY, newY));

    setPosition({ x: boundedX, y: boundedY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {
      console.error("[RetroWindow] releasePointerCapture failed:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      className="retro-window"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: opacity,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        transition: isDragging
          ? "none"
          : "left 0.35s cubic-bezier(0.16, 1, 0.3, 1), top 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      {/* Title Bar */}
      <div
        className={`retro-window-titlebar${isDragging ? " is-dragging" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: "none" }}
      >
        <button className="retro-close-btn" onClick={handleCloseClick} aria-label="Close Window">
          <div className="retro-close-inner"></div>
        </button>
        
        <div className="retro-title-stripes">
          <div className="retro-title-text">{title}</div>
        </div>

        <button className="retro-zoom-btn" onClick={handleMaximizeClick} aria-label="Maximize to New Window">
          <div className="retro-zoom-inner"></div>
        </button>
      </div>

      {/* Window Body & Iframe */}
      <div className="retro-window-body">
        <iframe
          src={url}
          title={title}
          sandbox="allow-scripts allow-same-origin allow-popups"
          className="retro-iframe"
          style={{
            pointerEvents: isDragging ? "none" : "auto"
          }}
        />
      </div>

    </div>
  );
}
