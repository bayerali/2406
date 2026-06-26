import React, { useMemo, useState } from "react";
import type { ShiftActivity, TaskEvent, TaskStatus } from "../../types";
import {
  formatTimestamp,
  isAutoParentDone,
  statusLabel,
} from "../../utils/executionBoard";
import styles from "./TaskCard.module.css";

type TaskCardProps = {
  task: ShiftActivity;
  latest: TaskEvent | null;
  history: TaskEvent[];
  isCompact?: boolean;
  onSaveStatus: (status: TaskStatus) => void;
};

export function TaskCard({
  task,
  latest,
  history,
  isCompact = false,
  onSaveStatus,
}: TaskCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const detailsId = useMemo(() => `task-details-${task.id}`, [task.id]);

  const hasDetails = history.length > 0;
  const isAutoDone = isAutoParentDone(task.nameSnapshot);
  const currentStatus: TaskStatus | null = latest?.status ?? null;

  return (
    <article className={`${styles.card} ${isCompact ? styles.cardCompact : ""}`}>
      <div className={styles.meta}>
        <div className={styles.topline}>
          <div className={styles.titleBlock}>
            <div className={styles.titleRow}>
              <h3 className={styles.title}>{task.nameSnapshot}</h3>

              <span
                className={`${styles.statusBadge} ${
                  currentStatus
                    ? styles[`status${currentStatus}`]
                    : styles.statusOpen
                }`}
              >
                {currentStatus ? statusLabel(currentStatus) : "Offen"}
              </span>
            </div>

            {latest?.note ? (
              <p className={styles.latestNote}>{latest.note}</p>
            ) : null}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.statusButton} ${styles.statusButtonDone} ${
              currentStatus === "done" || isAutoDone ? styles.isActive : ""
            }`}
            onClick={() => onSaveStatus("done")}
          >
            Erledigt
          </button>

          <button
            type="button"
            className={`${styles.statusButton} ${styles.statusButtonBlocked} ${
              currentStatus === "blocked" ? styles.isActive : ""
            }`}
            onClick={() => onSaveStatus("blocked")}
          >
            Blockiert
          </button>

          <button
            type="button"
            className={`${styles.statusButton} ${styles.statusButtonSkipped} ${
              currentStatus === "skipped" ? styles.isActive : ""
            }`}
            onClick={() => onSaveStatus("skipped")}
          >
            Übersprungen
          </button>
        </div>

        {hasDetails ? (
          <>
            <button
              type="button"
              className={styles.detailsToggle}
              aria-expanded={isDetailsOpen}
              aria-controls={detailsId}
              onClick={() => setIsDetailsOpen((value) => !value)}
            >
              <span>Verlauf anzeigen</span>
              <span
                className={`${styles.detailsToggleIcon} ${
                  isDetailsOpen ? styles.isOpen : ""
                }`}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>

            {isDetailsOpen ? (
              <div id={detailsId} className={styles.detailsPanel}>
                <div className={styles.history}>
                  {history
                    .slice()
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((event) => (
                      <div key={event.id} className={styles.historyItem}>
                        <div className={styles.historyTopline}>
                          <span
                            className={`${styles.statusBadge} ${
                              styles[`status${event.status}`]
                            }`}
                          >
                            {statusLabel(event.status)}
                          </span>

                          <span className={styles.historyTime}>
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>

                        {event.note ? (
                          <div className={styles.notePreview}>{event.note}</div>
                        ) : null}
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}
