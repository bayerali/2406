import React from "react";
import styles from "./NavBar.module.css";

export type NavActive = "shifts" | "board";

type NavBarProps = Readonly<{
  active: NavActive;
  onDashboardClick: () => void;
}>;

function BayerLogoMark() {
  return (
    <span className={styles.brandLogo} aria-hidden="true">
      <svg
        viewBox="0 0 64 64"
        className={styles.brandLogoSvg}
        role="img"
        aria-label="Bayer Logo"
      >
        <defs>
          <linearGradient id="bayerNavGreen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#89D329" />
            <stop offset="100%" stopColor="#6FC61B" />
          </linearGradient>

          <linearGradient id="bayerNavBlue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00BCFF" />
            <stop offset="100%" stopColor="#00A7E1" />
          </linearGradient>
        </defs>

        <path
          d="M32 7a25 25 0 0 0 0 50"
          fill="none"
          stroke="url(#bayerNavGreen)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M32 7a25 25 0 0 1 0 50"
          fill="none"
          stroke="url(#bayerNavBlue)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        <circle
          cx="32"
          cy="32"
          r="13"
          fill="none"
          stroke="#10384F"
          strokeWidth="2.5"
          opacity="0.12"
        />

        <line
          x1="32"
          y1="18"
          x2="32"
          y2="46"
          stroke="#10384F"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1="18"
          y1="32"
          x2="46"
          y2="32"
          stroke="#10384F"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function NavBar({ active, onDashboardClick }: NavBarProps) {
  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>
        <BayerLogoMark />

        <div className={styles.brandText}>
          <span className={styles.brandTitle}>Bayer Produktion</span>
          <span className={styles.brandSubtitle}>Schichtübersicht</span>
        </div>
      </div>

      <div className={styles.links}>
        <button
          type="button"
          className={[
            styles.navLink,
            active === "shifts" ? styles.active : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={onDashboardClick}
        >
          Übersicht
        </button>
      </div>
    </header>
  );
}
