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
  description?: string;
  isCompact?: boolean;
  onSaveStatus: (status: TaskStatus) => void;
};

export function TaskCard({
  task,
  latest,
  history,
  description,
  isCompact = false,
  onSaveStatus,
}: TaskCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const detailsId = useMemo(() => `task-details-${task.id}`, [task.id]);
  const hasDetails = Boolean(description) || history.length > 0;

  const cardClassName = [
    styles.card,
    isCompact ? styles.cardCompact : "",
  ]
    .filter(Boolean)
    .join(" ");

  const currentStatusBadgeClassName = [
    styles.statusBadge,
    latest?.status === "done"
      ? styles.statusDone
      : latest?.status === "blocked"
      ? styles.statusBlocked
      : latest?.status === "skipped"
      ? styles.statusSkipped
      : styles.statusOpen,
  ].join(" ");

  const doneButtonClassName = [
    styles.statusButton,
    styles.statusButtonDone,
    latest?.status === "done" ? styles.isActive : "",
  ]
    .filter(Boolean)
    .join(" ");

  const blockedButtonClassName = [
    styles.statusButton,
    styles.statusButtonBlocked,
    latest?.status === "blocked" ? styles.isActive : "",
  ]
    .filter(Boolean)
    .join(" ");

  const skippedButtonClassName = [
    styles.statusButton,
    styles.statusButtonSkipped,
    latest?.status === "skipped" ? styles.isActive : "",
  ]
    .filter(Boolean)
    .join(" ");

  const toggleIconClassName = [
    styles.detailsToggleIcon,
    isDetailsOpen ? styles.isOpen : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClassName}>
      <div className={styles.meta}>
        <div className={styles.topline}>
          <div className={styles.titleBlock}>
            <div className={styles.titleRow}>
              <h3 className={styles.title}>{task.nameSnapshot}</h3>

              <span className={currentStatusBadgeClassName}>
                {latest ? statusLabel(latest.status) : "Offen"}
              </span>
            </div>

            <div className={styles.latestNote}>
              {latest
                ? `Letzter Zeitstempel: ${formatTimestamp(latest.timestamp)}`
                : "Noch kein Zeitstempel"}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={doneButtonClassName}
            onClick={() => onSaveStatus("done")}
          >
            Erledigt
          </button>

          <button
            type="button"
            className={blockedButtonClassName}
            onClick={() => onSaveStatus("blocked")}
          >
            Blockiert
          </button>

          <button
            type="button"
            className={skippedButtonClassName}
            onClick={() => onSaveStatus("skipped")}
          >
            Übersprungen
          </button>

          {hasDetails ? (
            <button
              type="button"
              className={styles.detailsToggle}
              aria-expanded={isDetailsOpen}
              aria-controls={detailsId}
              aria-label={
                isDetailsOpen ? "Verlauf ausblenden" : "Verlauf einblenden"
              }
              title={isDetailsOpen ? "Verlauf ausblenden" : "Verlauf einblenden"}
              onClick={() => setIsDetailsOpen((value) => !value)}
            >
              <span className={toggleIconClassName} aria-hidden="true">
                ⌄
              </span>

              {history.length > 0 ? (
                <span className={styles.detailsToggleCount}>
                  {history.length}
                </span>
              ) : null}
            </button>
          ) : null}
        </div>
      </div>

      {isDetailsOpen ? (
        <div id={detailsId} className={styles.detailsPanel}>
          {description ? (
            <div className={styles.description}>{description}</div>
          ) : null}

          {history.length > 0 ? (
            <div className={styles.history}>
              {history.map((event) => {
                const historyBadgeClassName = [
                  styles.statusBadge,
                  event.status === "done"
                    ? styles.statusDone
                    : event.status === "blocked"
                    ? styles.statusBlocked
                    : event.status === "skipped"
                    ? styles.statusSkipped
                    : styles.statusOpen,
                ].join(" ");

                return (
                  <div key={event.id} className={styles.historyItem}>
                    <div className={styles.historyTopline}>
                      <span className={historyBadgeClassName}>
                        {statusLabel(event.status)}
                      </span>

                      <span className={styles.historyTime}>
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>

                    {event.note && !isAutoParentDone(event.note) ? (
                      <div className={styles.notePreview}>{event.note}</div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
