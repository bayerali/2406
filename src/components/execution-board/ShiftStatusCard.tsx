import React from "react";
import styles from "./ShiftStatusCard.module.css";

type ShiftStatusCardProps = {
  totalLeafTasks: number;
  doneCount: number;
  blockedCount: number;
  skippedCount: number;
  openCount: number;
  shiftProgressPercent: number;
};

export function ShiftStatusCard({
  totalLeafTasks,
  doneCount,
  blockedCount,
  skippedCount,
  openCount,
  shiftProgressPercent,
}: ShiftStatusCardProps) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div className={styles.progressMeta}>
          <div className={styles.progressEyebrow}>Fortschritt</div>
          <div className={styles.progressSummary}>
            {doneCount} von {totalLeafTasks} Aufgaben erledigt
          </div>
        </div>

        <div className={styles.progressValue}>{shiftProgressPercent}%</div>
      </div>

      <div className={styles.kpiGrid}>
        <article className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Erledigt</div>
          <div className={styles.kpiValue}>{doneCount}</div>
        </article>

        <article className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Offen</div>
          <div className={styles.kpiValue}>{openCount}</div>
        </article>

        <article className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Blockiert</div>
          <div className={styles.kpiValue}>{blockedCount}</div>
        </article>

        <article className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Übersprungen</div>
          <div className={styles.kpiValue}>{skippedCount}</div>
        </article>

        <article className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Gesamt</div>
          <div className={styles.kpiValue}>{totalLeafTasks}</div>
        </article>
      </div>

      <div className={styles.progressBar} aria-hidden="true">
        <div
          className={styles.progressBarFill}
          style={{ width: `${shiftProgressPercent}%` }}
        />
      </div>
    </section>
  );
}
