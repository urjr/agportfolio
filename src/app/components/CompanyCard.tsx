import type { CompanyData } from "../data/companies";

interface CompanyCardProps {
  company: CompanyData;
  /** When true (Work page): no shadow, no scrim, rendered inline */
  inline?: boolean;
}

export default function CompanyCard({ company, inline = false }: CompanyCardProps) {
  const isEducation = company.type === "education";

  return (
    <div
      className={[
        "company-card",
        isEducation ? "company-card--education" : "company-card--work",
        inline ? "company-card--inline" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Image placeholder (left column) */}
      <div className="company-card-image">
        <div className="company-card-image-inner">
          <span className="company-card-image-label">{company.name}</span>
        </div>
      </div>

      {/* Details (right column) */}
      <div className="company-card-details">
        <div className="company-card-header">
          <h2 className="company-card-name">{company.name}</h2>
          <p className="company-card-role">{company.role}</p>
          <p className="company-card-dates">{company.dates}</p>
        </div>

        <div className="company-card-chips">
          {company.chips.map((chip) => (
            <span key={chip} className="company-card-chip">
              {chip}
            </span>
          ))}
        </div>

        <p className="company-card-summary">{company.summary}</p>

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
      </div>
    </div>
  );
}
