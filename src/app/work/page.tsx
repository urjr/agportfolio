"use client";

import { useEffect, useRef, useState } from "react";
import CompanyCard from "../components/CompanyCard";
import { COMPANY_DATA, WORK_PAGE_ORDER } from "../data/companies";
import { usePageTransition } from "../components/TransitionProvider";

export default function Work() {
  const { isExiting, transitionType, sharedCardCoords, clearSharedCoords } = usePageTransition();
  const [wasFlipEntered] = useState(() => {
    return transitionType === "about-to-work" && !!sharedCardCoords;
  });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isExiting && transitionType === "about-to-work" && sharedCardCoords && !hasAnimated.current) {
      hasAnimated.current = true;

      // Find all company card containers rendered on the page
      const cards = document.querySelectorAll<HTMLElement>(".work-content [data-company-id]");

      cards.forEach((cardEl) => {
        const companyId = cardEl.getAttribute("data-company-id");
        if (!companyId) return;

        const firstRect = sharedCardCoords[companyId];
        if (!firstRect) return;

        // 1. Measure Last position (vertical list layout on Work page)
        const lastRect = cardEl.getBoundingClientRect();

        // 2. Calculate offset transitions
        const dx = firstRect.left - lastRect.left;
        const dy = firstRect.top - lastRect.top;
        const scaleX = firstRect.width / lastRect.width;
        const scaleY = firstRect.height / lastRect.height;

        // 3. Invert (instantly place the card at its old floating coordinates & scale)
        cardEl.style.transition = "none";
        cardEl.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;
        cardEl.style.transformOrigin = "top left";
        cardEl.classList.add("company-card--flip");

        // Force a browser reflow/layout pass
        cardEl.offsetHeight;

        // 4. Play (transition to target layout)
        requestAnimationFrame(() => {
          cardEl.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease, border-radius 0.6s ease, box-shadow 0.6s ease, background-color 0.6s ease";
          cardEl.style.transform = "none";
          cardEl.classList.remove("company-card--flip");
        });

        // 5. Clean up inline styles once transition completes
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

      // Clear cached coordinates in transition provider
      clearSharedCoords();
    }
  }, [transitionType, sharedCardCoords, clearSharedCoords, isExiting]);

  const isFlipExit = isExiting && transitionType === "work-to-about";
  const isFlipEnter = !isExiting && transitionType === "about-to-work";
  const getExitClass = () => {
    if (isFlipExit) return "page-row--exit-flip";
    if (isExiting) return "page-row--exit";
    if (isFlipEnter || wasFlipEntered) return "page-row--enter-flip";
    return "page-row--enter";
  };

  return (
    <main className="work-container">
      <div className="work-content">
        {WORK_PAGE_ORDER.map((id, index) => {
          const company = COMPANY_DATA[id];
          if (!company) return null;
          return (
            <div
              key={id}
              className={`page-row ${getExitClass()}`}
              style={{ "--row-index": index } as React.CSSProperties}
            >
              <CompanyCard company={company} inline />
            </div>
          );
        })}
      </div>
    </main>
  );
}
