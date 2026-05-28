"use client";

import CompanyCard from "../components/CompanyCard";
import { COMPANY_DATA, WORK_PAGE_ORDER } from "../data/companies";
import { usePageTransition } from "../components/TransitionProvider";

export default function Work() {
  const { isExiting } = usePageTransition();

  return (
    <main className="work-container">
      <div className="work-content">
        {WORK_PAGE_ORDER.map((id, index) => {
          const company = COMPANY_DATA[id];
          if (!company) return null;
          return (
            <div
              key={id}
              className={`page-row ${isExiting ? "page-row--exit" : "page-row--enter"}`}
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
