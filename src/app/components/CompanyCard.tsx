import type { CompanyData } from "../data/companies";

interface CompanyCardProps {
  company: CompanyData;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const isEducation = company.type === "education";

  return (
    <div
      data-company-id={company.id}
      className={[
        "company-card",
        isEducation ? "company-card--education" : "company-card--work",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Image placeholder (left column) */}
      <div
        className="company-card-image"
        style={company.iconBg ? { backgroundColor: company.iconBg, backgroundImage: "none" } : undefined}
      >
        {company.imageSrc ? (
          <img
            src={company.imageSrc}
            alt={`${company.name} logo`}
            className="company-card-img-element"
          />
        ) : (
          <div className="company-card-image-inner">
            <span className="company-card-image-label">{company.name}</span>
          </div>
        )}
      </div>

      {/* Details (right column) */}
      <div className="company-card-details">
        <div className="company-card-header">
          <h2 className="company-card-name">{company.name}</h2>
          <p className="company-card-role">{company.role}</p>
          <p className="company-card-dates">{company.dates}</p>
        </div>

        {company.chips && company.chips.length > 0 && (
          <div className="company-card-chips">
            {company.chips.map((chip) => (
              <span key={chip} className="company-card-chip">
                {chip}
              </span>
            ))}
          </div>
        )}

        <p className="company-card-summary">{company.summary}</p>

        <div className="company-card-actions">
          <a
            href={company.url}
            target="_blank"
            rel="noopener noreferrer"
            className="company-card-cta"
          >
            {company.urlLabel}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2 12L12 2M12 2H5M12 2V9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          {(company.id === "google" || company.id === "upenn") && (
            <div className="company-card-case-study-wrapper">
              <button
                type="button"
                className="company-card-cta company-card-cta--disabled company-card-case-study"
                aria-label="Case study not available"
              >
                View Case Study
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lock-icon"
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </button>
              <span className="case-study-tooltip">Not available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
