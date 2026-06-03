"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import TransitionLink from "./components/TransitionLink";
import LineReveal from "./components/LineReveal";
import PhillyLobber from "./components/PhillyLobber";
import RetroWindow from "./components/RetroWindow";

const LINK_IDS = [
  "link-ulises",
  "link-product-designer",
  "link-educator",
  "link-philadelphia",
  "link-google",
  "link-analytics",
  "link-upenn"
];

const LOB_LINK_URLS: Record<string, { url: string; title: string }> = {
  "link-product-designer": {
    url: "https://en.wikipedia.org/wiki/Product_design",
    title: "Product Designer"
  },
  "link-educator": {
    url: "https://en.wikipedia.org/wiki/Professor",
    title: "Professor"
  },
  "link-philadelphia": {
    url: "https://www.visitphilly.com",
    title: "Philadelphia"
  }
};

export default function Home() {
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);
  const [hasHoveredIds, setHasHoveredIds] = useState<Set<string>>(new Set());
  const [firstLineCount, setFirstLineCount] = useState(0);
  const [phillyTriggerCount, setPhillyTriggerCount] = useState(0);
  const [productTriggerCount, setProductTriggerCount] = useState(0);
  const [educatorTriggerCount, setEducatorTriggerCount] = useState(0);

  // Retro Window States
  const [retroWindow, setRetroWindow] = useState<{
    id: string;
    url: string;
    title: string;
    linkPos?: { x: number; y: number };
  } | null>(null);

  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [touchClickCounts, setTouchClickCounts] = useState<Record<string, number>>({});
  const [isWaveRevealed, setIsWaveRevealed] = useState(false);

  const [pendingRetroWindow, setPendingRetroWindow] = useState<{
    id: string;
    url: string;
    title: string;
    linkPos?: { x: number; y: number };
  } | null>(null);

  const LOCKOUT_DURATION = 5600;                                          // Individual link lockout (ms)
  const BASE_COOLDOWN    = Math.round(LOCKOUT_DURATION * 0.25);           // 1400ms — starting global cooldown (25% of lockout)
  const COOLDOWN_STEP    = Math.round((LOCKOUT_DURATION - BASE_COOLDOWN) / 5); // 840ms — linear increment per rapid trigger
  const [isGlobalCooldown, setIsGlobalCooldown] = useState(false);
  const globalCooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTriggeredIdRef = useRef<string | null>(null);
  const lastTriggeredTimesRef = useRef<Record<string, number>>({});
  const cooldownEndTimeRef = useRef<number>(0);         // When the last global cooldown expired
  const cooldownStepRef = useRef<number>(0);             // How many consecutive "immediate" triggers in a row
  const hasEverTriggeredRef = useRef<boolean>(false);    // Flips true after first animation fires — delay no longer needed
  const activeHoverIdRef = useRef<string | null>(null);  // Mirror of activeHoverId for use inside timer callbacks
  const pendingFirstTriggerRef = useRef<NodeJS.Timeout | null>(null); // 150ms intent-delay timer for first-ever trigger
  const [lockedLinks, setLockedLinks] = useState<Record<string, boolean>>({});

  const lastRevealTimeRef = useRef<number>(0);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const waveRevealDelayRef = useRef<NodeJS.Timeout | null>(null); // Intent delay timer
  const MIN_REVEAL_DURATION = 500; // Minimum time wave figure must stay open (ms)
 
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (globalCooldownTimerRef.current) clearTimeout(globalCooldownTimerRef.current);
      if (pendingFirstTriggerRef.current) clearTimeout(pendingFirstTriggerRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (waveRevealDelayRef.current) clearTimeout(waveRevealDelayRef.current);
    };
  }, []);

  const lockLink = (id: string) => {
    setLockedLinks((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setLockedLinks((prev) => ({ ...prev, [id]: false }));
    }, LOCKOUT_DURATION);
  };

  // Fires the lob animation for whichever link is currently hovered (shared by immediate and delayed paths)
  const fireLobTrigger = (id: string) => {
    // If retro window is open, do not trigger animations
    if (retroWindow) return;

    const now = Date.now();

    // Progressive cooldown step: reset if user waits longer than 0.25s (250ms) after cooldown expires
    const timeSinceCooldownEnd = now - cooldownEndTimeRef.current;
    if (timeSinceCooldownEnd <= 250) {
      cooldownStepRef.current = Math.min(cooldownStepRef.current + 1, 6);
    } else {
      cooldownStepRef.current = 0;
    }

    lastTriggeredTimesRef.current[id] = now;
    lockLink(id);
    triggerGlobalCooldown();
    hasEverTriggeredRef.current = true;

    if (id === "link-philadelphia") {
      setPhillyTriggerCount((prev) => prev + 1);
      lastTriggeredIdRef.current = "link-philadelphia";
    } else if (id === "link-product-designer") {
      setProductTriggerCount((prev) => prev + 1);
      lastTriggeredIdRef.current = "link-product-designer";
    } else if (id === "link-educator") {
      setEducatorTriggerCount((prev) => prev + 1);
      lastTriggeredIdRef.current = "link-educator";
    }
  };

  // Trigger lob animations when themed links get hovered (with global cooldown, sustained hover, and individual link lockout checks)
  useEffect(() => {
    if (retroWindow) return; // Do not trigger while window is open

    const LOB_LINK_IDS = ["link-philadelphia", "link-product-designer", "link-educator"];
    if (!activeHoverId || !LOB_LINK_IDS.includes(activeHoverId)) {
      lastTriggeredIdRef.current = null;
      return;
    }

    if (isGlobalCooldown) return;
    if (activeHoverId === lastTriggeredIdRef.current) return;

    const now = Date.now();
    const lastTriggeredTime = lastTriggeredTimesRef.current[activeHoverId] || 0;
    if (now - lastTriggeredTime < LOCKOUT_DURATION) return;

    // Apply a 150ms intent delay to all animation hovers to avoid incidental mouseovers at all times
    if (pendingFirstTriggerRef.current) return; // timer already running — wait for it
    const capturedId = activeHoverId;
    pendingFirstTriggerRef.current = setTimeout(() => {
      pendingFirstTriggerRef.current = null;
      // Only fire if the user is still hovering the same link
      if (activeHoverIdRef.current === capturedId) {
        fireLobTrigger(capturedId);
      }
    }, 150);
  }, [activeHoverId, isGlobalCooldown, retroWindow]);

  const triggerGlobalCooldown = () => {
    // Make the first 2 cooldowns (step 0 and 1) 1.4 seconds, then scale linearly afterwards
    const effectiveStep = Math.max(0, cooldownStepRef.current - 1);
    const duration = BASE_COOLDOWN + effectiveStep * COOLDOWN_STEP;
    setIsGlobalCooldown(true);
    if (globalCooldownTimerRef.current) {
      clearTimeout(globalCooldownTimerRef.current);
    }
    globalCooldownTimerRef.current = setTimeout(() => {
      setIsGlobalCooldown(false);
      cooldownEndTimeRef.current = Date.now(); // Record when this cooldown expired
      globalCooldownTimerRef.current = null;
    }, duration);
  };

  const handleMouseEnter = (id: string) => {
    if (retroWindow) return; // Ignore hover states if window is open
    activeHoverIdRef.current = id;
    setActiveHoverId(id);
    setHasHoveredIds((prev) => {
      if (prev.has(id)) return prev;
      const nextSet = new Set(prev);
      nextSet.add(id);
      return nextSet;
    });
  };

  const handleMouseLeave = (id: string) => {
    activeHoverIdRef.current = null;
    // Cancel the first-trigger intent delay if the user moved away before it fired
    if (pendingFirstTriggerRef.current) {
      clearTimeout(pendingFirstTriggerRef.current);
      pendingFirstTriggerRef.current = null;
    }
    setActiveHoverId((prev) => (prev === id ? null : prev));
  };

  const handleNameLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMobileDevice) {
      e.preventDefault();
      if (!isWaveRevealed) {
        setIsWaveRevealed(true);
      } else {
        if (window.innerWidth <= 580) {
          setIsWaveRevealed(false);
        }
      }
    }
  };

  const handleOtherLinkClick = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (isWaveRevealed) {
      setIsWaveRevealed(false);
    }
  };

  // Sync wave reveal with activeHoverId on desktop
  useEffect(() => {
    if (isMobileDevice) return;

    if (activeHoverId === "link-ulises") {
      // Cancel any pending hide timers so the wave stays visible
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      if (isWaveRevealed) return;

      // Start a 150ms intent delay timer to avoid triggering on quick swipes
      if (!waveRevealDelayRef.current) {
        waveRevealDelayRef.current = setTimeout(() => {
          setIsWaveRevealed(true);
          lastRevealTimeRef.current = Date.now();
          waveRevealDelayRef.current = null;
        }, 150);
      }
    } else {
      // Cancel any pending reveal timer if user leaves early
      if (waveRevealDelayRef.current) {
        clearTimeout(waveRevealDelayRef.current);
        waveRevealDelayRef.current = null;
      }

      if (isWaveRevealed) {
        const elapsed = Date.now() - lastRevealTimeRef.current;
        const remaining = MIN_REVEAL_DURATION - elapsed;

        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }

        if (remaining > 0) {
          hideTimeoutRef.current = setTimeout(() => {
            setIsWaveRevealed(false);
            hideTimeoutRef.current = null;
          }, remaining);
        } else {
          setIsWaveRevealed(false);
        }
      }
    }
  }, [activeHoverId, isMobileDevice, isWaveRevealed]);

  // Close wave figure when tapping outside on touch devices
  useEffect(() => {
    if (!isMobileDevice || !isWaveRevealed) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const nameLink = document.getElementById("link-ulises");
      if (nameLink && nameLink.contains(e.target as Node)) {
        return;
      }
      setIsWaveRevealed(false);
    };

    window.addEventListener("click", handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener("click", handleGlobalClick, { capture: true });
    };
  }, [isMobileDevice, isWaveRevealed]);

  // On touch-only devices, auto-hide the wave SVG after 1.5 seconds
  useEffect(() => {
    if (!isMobileDevice || !isWaveRevealed) return;

    const timer = setTimeout(() => {
      setIsWaveRevealed(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [isMobileDevice, isWaveRevealed]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (isWaveRevealed) {
      setIsWaveRevealed(false);
    }
    if (isMobileDevice) {
      e.preventDefault();

      // Check if below mobile phone breakpoint (580px)
      if (window.innerWidth <= 580) {
        const lastTriggeredTime = lastTriggeredTimesRef.current[id] || 0;
        const now = Date.now();
        // 2800ms matches the particle lob animation flight duration in PhillyLobber
        if (now - lastTriggeredTime < 2800) {
          return;
        }
      }

      // Check if this is a larger touch device (larger than 580px, e.g. iPad Pro)
      if (window.innerWidth > 580) {
        const currentCount = touchClickCounts[id] || 0;

        if (currentCount >= 1) {
          // Second click: reset count and open the retro window
          setTouchClickCounts((prev) => ({ ...prev, [id]: 0 }));

          const scrollX = window.scrollX || window.pageXOffset;
          const scrollY = window.scrollY || window.pageYOffset;
          const linkPos = {
            x: e.clientX + scrollX,
            y: e.clientY + scrollY
          };

          const newWindow = {
            id,
            ...LOB_LINK_URLS[id],
            linkPos
          };

          // Handle window opening/switching
          if (retroWindow) {
            if (retroWindow.id === id) {
              setRetroWindow(newWindow);
            } else {
              setPendingRetroWindow(newWindow);
            }
            return;
          }

          setRetroWindow(newWindow);
          return;
        } else {
          // First click: increment count, trigger animation and hover state below
          setTouchClickCounts((prev) => ({ ...prev, [id]: 1 }));
        }
      }

      // Trigger the active hover jiggle visual state temporarily on mobile click
      setActiveHoverId(id);
      setHasHoveredIds((prev) => {
        const nextSet = new Set(prev);
        nextSet.add(id);
        return nextSet;
      });
      setTimeout(() => {
        setActiveHoverId(null);
      }, 500);

      // Fire the particle lob throwing animation! (Bypass cooldowns on touch-only)
      fireLobTrigger(id);
      return;
    }

    // Check if below mobile breakpoint (580px)
    if (window.innerWidth <= 580) {
      // Allow default click action
      return;
    }

    e.preventDefault();

    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const linkPos = {
      x: e.clientX + scrollX,
      y: e.clientY + scrollY
    };

    const newWindow = {
      id,
      ...LOB_LINK_URLS[id],
      linkPos
    };

    // If click on any of the links, close the current retro window (or do nothing if clicking the same)
    // and open/switch to the other one
    if (retroWindow) {
      if (retroWindow.id === id) {
        // Re-trigger same window
        setRetroWindow(newWindow);
      } else {
        // Switch windows: set the new one as pending so the old one can trigger its closing animation first
        setPendingRetroWindow(newWindow);
      }
      return;
    }

    setRetroWindow(newWindow);
  };

  const handleWindowClose = () => {
    if (pendingRetroWindow) {
      setRetroWindow(pendingRetroWindow);
      setPendingRetroWindow(null);
    } else {
      setRetroWindow(null);
    }
  };

  useEffect(() => {
    // 1. Device-based detection (User Agent + Touch capabilities)
    if (typeof window === "undefined") return;

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isMaciPad = /macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    
    // Check if a mouse or trackpad is connected/active
    const hasMouseOrPointer = window.matchMedia("(any-hover: hover)").matches;

    // Only run on mobile/tablet touch devices that do NOT have a physical mouse or trackpad connected
    const isMobile = (isMobileUA || isMaciPad) && isTouchDevice && !hasMouseOrPointer;
    setIsMobileDevice(isMobile);
    if (isMobile) {
      // Add CSS class to body for mobile/tablet device targeting
      document.body.classList.add("is-mobile-device");
    }

    let timeoutId: NodeJS.Timeout;
    
    // Shuffle queue management
    // On mobile-only devices, remove the auto-hover showcase from non-glitch links
    const cycleQueue = isMobile
      ? ["link-google", "link-analytics", "link-upenn"]
      : [...LINK_IDS];
    const shuffleArray = (array: string[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    // Initial shuffle
    shuffleArray(cycleQueue);
    let currentIndex = 0;

    const runShowcase = () => {
      if (retroWindow) return; // Pause showcase while window is open

      if (currentIndex >= cycleQueue.length) {
        // Start a new cycle: shuffle the queue again and reset index
        const lastTriggeredId = cycleQueue[cycleQueue.length - 1];
        shuffleArray(cycleQueue);

        // Prevent triggering the same element consecutively across cycles
        if (cycleQueue[0] === lastTriggeredId && cycleQueue.length > 1) {
          const swapIndex = 1 + Math.floor(Math.random() * (cycleQueue.length - 1));
          [cycleQueue[0], cycleQueue[swapIndex]] = [cycleQueue[swapIndex], cycleQueue[0]];
        }

        currentIndex = 0;
      }

      const nextId = cycleQueue[currentIndex];
      currentIndex++;

      // Trigger hover state and mark as hovered
      activeHoverIdRef.current = nextId;
      setActiveHoverId(nextId);
      setHasHoveredIds((prev) => {
        const nextSet = new Set(prev);
        nextSet.add(nextId);
        return nextSet;
      });

      // Keep active for a natural showcase duration (1.4s to 2.0s - cut in half to 0.7s to 1.0s for mobile)
      const hoverDuration = (1400 + Math.random() * 600) * 0.5;
      
      timeoutId = setTimeout(() => {
        // Clear active hover state (triggering exit glitch/animations)
        activeHoverIdRef.current = null;
        setActiveHoverId(null);

        // Rest/pause before highlighting the next link:
        // Use a 2.0s to 3.0s pause to give the page visual breathing room and let animations complete
        const restDuration = 2000 + Math.random() * 1000;

        timeoutId = setTimeout(runShowcase, restDuration);
      }, hoverDuration);
    };

    // Stagger start by 2.5 seconds to let initial page intro animations finish
    if (isMobile) {
      timeoutId = setTimeout(runShowcase, 2500);
    }

    return () => {
      clearTimeout(timeoutId);
      document.body.classList.remove("is-mobile-device");
    };
  }, [retroWindow]);


  return (
    <main className="main-content" style={{ position: "relative", overflow: "hidden", height: "100vh" }}>
      <PhillyLobber theme="philadelphia" triggerCount={phillyTriggerCount} />
      <PhillyLobber theme="product" triggerCount={productTriggerCount} />
      <PhillyLobber theme="educator" triggerCount={educatorTriggerCount} />

      {retroWindow && (
        <RetroWindow
          key={retroWindow.id}
          url={retroWindow.url}
          title={retroWindow.title}
          isOpen={!!retroWindow}
          triggerId={retroWindow.id}
          linkPos={retroWindow.linkPos}
          isClosing={!!pendingRetroWindow}
          onClose={handleWindowClose}
        />
      )}

      <div className="bio-container">
        {/* Row 1 — intro line */}
        <LineReveal
          as="h1"
          className="hero-title intro-title first-line"
          id="hero-title"
          rowIndex={0}
          onLinesMeasured={setFirstLineCount}
        >
          My name is{" "}
          <TransitionLink
            href="/about"
            className={`nowrap-link highlight-name${activeHoverId === "link-ulises" ? " active-hover" : ""}${hasHoveredIds.has("link-ulises") ? " has-hovered" : ""}`}
            id="link-ulises"
            onMouseEnter={() => handleMouseEnter("link-ulises")}
            onMouseLeave={() => handleMouseLeave("link-ulises")}
            onClick={handleNameLinkClick}
          >
            Ulises Reyes-Kaura
          </TransitionLink>
          . I am a{" "}
          <Link
            href={isMobileDevice ? "" : "https://en.wikipedia.org/wiki/Product_design"}
            className={`nowrap-link highlight-work${activeHoverId === "link-product-designer" ? " active-hover" : ""}${hasHoveredIds.has("link-product-designer") ? " has-hovered" : ""}${lockedLinks["link-product-designer"] ? " is-locked" : ""}${retroWindow ? " retro-window-open" : ""}`}
            id="link-product-designer"
            onMouseEnter={() => handleMouseEnter("link-product-designer")}
            onMouseLeave={() => handleMouseLeave("link-product-designer")}
            onClick={(e) => handleLinkClick(e, "link-product-designer")}
          >
            product designer
          </Link>{" "}
          and{" "}
          <Link
            href={isMobileDevice ? "" : "https://en.wikipedia.org/wiki/Professor"}
            className={`highlight-education${activeHoverId === "link-educator" ? " active-hover" : ""}${hasHoveredIds.has("link-educator") ? " has-hovered" : ""}${lockedLinks["link-educator"] ? " is-locked" : ""}${retroWindow ? " retro-window-open" : ""}`}
            id="link-educator"
            onMouseEnter={() => handleMouseEnter("link-educator")}
            onMouseLeave={() => handleMouseLeave("link-educator")}
            onClick={(e) => handleLinkClick(e, "link-educator")}
          >
            educator
          </Link>{" "}
          based in{" "}
          <Link
            href={isMobileDevice ? "" : "https://www.visitphilly.com"}
            id="link-philadelphia"
            className={`highlight-geography${activeHoverId === "link-philadelphia" ? " active-hover" : ""}${hasHoveredIds.has("link-philadelphia") ? " has-hovered" : ""}${lockedLinks["link-philadelphia"] ? " is-locked" : ""}${retroWindow ? " retro-window-open" : ""}`}
            target={isMobileDevice ? undefined : "_blank"}
            rel={isMobileDevice ? undefined : "noopener noreferrer"}
            onMouseEnter={() => handleMouseEnter("link-philadelphia")}
            onMouseLeave={() => handleMouseLeave("link-philadelphia")}
            onClick={(e) => handleLinkClick(e, "link-philadelphia")}
          >
            Philadelphia
          </Link>
          .
        </LineReveal>

        {/* Row 2 — current role line */}
        <LineReveal
          as="p"
          className="hero-title intro-title second-line"
          id="hero-subtitle"
          rowIndex={1}
          lineOffset={firstLineCount}
          waitForOffset={true}
        >
          Currently, I work at{" "}
          <Link
            href="https://about.google"
            id="link-google"
            className={`google-svg-link highlight-work${activeHoverId === "link-google" ? " active-hover" : ""}${hasHoveredIds.has("link-google") ? " has-hovered" : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOtherLinkClick}
          >
            <span className="google-text">Google</span>
            <img
              src="/assets/home/google-logo.svg"
              alt="Google"
              className="google-svg"
            />
          </Link>
          , designing agentic experiences for{" "}
          <Link
            href="https://marketingplatform.google.com/about/analytics/"
            id="link-analytics"
            className={`analytics-svg-link highlight-work${activeHoverId === "link-analytics" ? " active-hover" : ""}${hasHoveredIds.has("link-analytics") ? " has-hovered" : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOtherLinkClick}
          >
            <span className="analytics-text">Analytics</span>
            <img
              src="/assets/home/analytics.svg"
              alt="Analytics"
              className="analytics-svg"
            />
          </Link>
          , and teach design at{" "}
          <Link
            href="https://ipd.me.upenn.edu/about/"
            id="link-upenn"
            className={`upenn-svg-link highlight-education${activeHoverId === "link-upenn" ? " active-hover" : ""}${hasHoveredIds.has("link-upenn") ? " has-hovered" : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOtherLinkClick}
          >
            <span className="upenn-text">UPenn</span>
            <img
              src="/assets/home/penn.svg"
              alt="UPenn"
              className="upenn-svg"
            />
          </Link>
          .
        </LineReveal>
      </div>

      <img
        src="/assets/home/wave.svg"
        alt="Waving illustration"
        className={`wave-figure${isWaveRevealed ? " revealed" : ""}`}
      />
    </main>
  );
}
