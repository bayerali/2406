import React from "react";
import styles from "./BoardHeader.module.css";

type BoardHeaderProps = {
  title: string;
  subtitle: string;
  onBack: () => void;
  mode?: "primary" | "secondary";
  shiftType?: "Frueh" | "Spaet" | "Nacht";
  operator?: string;
  line?: string;
  shiftLabel?: string;
};

export function BoardHeader({
  title,
  subtitle,
  onBack,
  mode = "primary",
  shiftType,
  operator,
  line,
  shiftLabel,
}: BoardHeaderProps) {
  const headerModeClass =
    mode === "secondary" ? styles.headerSecondary : styles.headerPrimary;

  const shiftTypeClass = shiftType
    ? styles[`shiftTypeBadge${shiftType}`]
    : "";

  return (
    <header className={`${styles.header} ${headerModeClass}`}>
      <div className={styles.row}>
        <div className={styles.content}>
          <div className={styles.text}>
            <h1 className={styles.title}>{title}</h1>

            <div className={styles.meta}>
              {operator ? (
                <span className={styles.operator}>{operator}</span>
              ) : null}

              {shiftLabel && shiftType ? (
                <span className={`${styles.shiftTypeBadge} ${shiftTypeClass}`}>
                  {shiftLabel}
                </span>
              ) : null}

              {line ? <span className={styles.line}>{line}</span> : null}
            </div>

            <p className={styles.subtitle}>{subtitle}</p>
          </div>
        </div>

        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
        >
          Zurück zu Schichten
        </button>
      </div>
    </header>
  );
}
