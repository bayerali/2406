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
      <svg viewBox="0 0 120 120" className={styles.brandLogoSvg}>
        <defs>
          <linearGradient id="navBayerRingLeft" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#89D329" />
            <stop offset="100%" stopColor="#89D329" />
          </linearGradient>
          <linearGradient id="navBayerRingRight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00BCFF" />
            <stop offset="100%" stopColor="#00BCFF" />
          </linearGradient>
        </defs>

        <path
          d="M60 10a50 50 0 0 0 0 100"
          fill="none"
          stroke="url(#navBayerRingLeft)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M60 10a50 50 0 0 1 0 100"
          fill="none"
          stroke="url(#navBayerRingRight)"
          strokeWidth="7"
          strokeLinecap="round"
        />

        <line
          x1="60"
          y1="22"
          x2="60"
          y2="98"
          stroke="#10384F"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <line
          x1="22"
          y1="60"
          x2="98"
          y2="60"
          stroke="#10384F"
          strokeWidth="6"
          strokeLinecap="round"
        />

        <text x="60" y="30" textAnchor="middle" className={styles.brandLogoText}>
          B
        </text>
        <text x="60" y="48" textAnchor="middle" className={styles.brandLogoText}>
          A
        </text>
        <text x="60" y="92" textAnchor="middle" className={styles.brandLogoText}>
          E
        </text>
        <text x="60" y="110" textAnchor="middle" className={styles.brandLogoText}>
          R
        </text>

        <text
          x="33"
          y="67"
          textAnchor="middle"
          className={styles.brandLogoTextWide}
        >
          B
        </text>
        <text
          x="48"
          y="67"
          textAnchor="middle"
          className={styles.brandLogoTextWide}
        >
          A
        </text>
        <text
          x="60"
          y="67"
          textAnchor="middle"
          className={styles.brandLogoTextWide}
        >
          Y
        </text>
        <text
          x="74"
          y="67"
          textAnchor="middle"
          className={styles.brandLogoTextWide}
        >
          E
        </text>
        <text
          x="90"
          y="67"
          textAnchor="middle"
          className={styles.brandLogoTextWide}
        >
          R
        </text>
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
