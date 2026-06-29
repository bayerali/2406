import React from "react";

export type NavActive = "shifts" | "board";

type NavBarProps = Readonly<{
  active: NavActive;
  onDashboardClick: () => void;
}>;

function BayerLogoMark() {
  return (
    <span className="nav-brand-logo" aria-hidden="true">
      <svg viewBox="0 0 120 120" className="nav-brand-logo-svg">
        <defs>
          <linearGradient id="nav-bayer-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#57d0ff" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>

        <circle
          cx="60"
          cy="60"
          r="49"
          fill="none"
          stroke="url(#nav-bayer-ring)"
          strokeWidth="6"
        />
        <line
          x1="60"
          y1="18"
          x2="60"
          y2="102"
          stroke="url(#nav-bayer-ring)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line
          x1="18"
          y1="60"
          x2="102"
          y2="60"
          stroke="url(#nav-bayer-ring)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function NavBar({ active, onDashboardClick }: NavBarProps) {
  return (
    <header className="nav">
      <div className="nav-brand">
        <BayerLogoMark />

        <div className="nav-brand-text">
          <span className="nav-brand-title">Bayer Produktion</span>
          <span className="nav-brand-subtitle">Schichtübersicht</span>
        </div>
      </div>

      <div className="nav-links">
        <button
          type="button"
          className={"nav-link " + (active === "shifts" ? "active" : "")}
          onClick={onDashboardClick}
        >
          Übersicht
        </button>
      </div>
    </header>
  );
}
