import React, { useMemo, useState } from "react";
import type { ShiftActivity, TaskEvent, TaskStatus } from "../../types";
import {
  formatTimestamp,
  isAutoParentDone,
  statusLabel,
} from "../../utils/executionBoard";

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

  return (
    <div
      className={[
        "shift-card",
        "task-card",
        "contextual-task-card",
        isCompact ? "task-card--compact" : "",
        latest ? `task-card--${latest.status}` : "task-card--open",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="shift-meta task-meta">
        <div className="task-topline">
          <div className="shift-date task-title">{task.nameSnapshot}</div>

          <div
            className={[
              "status-badge",
              "task-status-badge",
              latest ? `status-${latest.status}` : "status-open",
              latest ? "task-status-badge--strong" : "",
            ].join(" ")}
          >
            {latest ? statusLabel(latest.status) : "Offen"}
          </div>
        </div>

        <div className="shift-sub task-timestamp">
          {latest
            ? `Letzter Zeitstempel: ${formatTimestamp(latest.timestamp)}`
            : "Noch kein Zeitstempel"}
        </div>
      </div>

      <div className="task-actions task-actions--compact">
        <button
          type="button"
          className={[
            "btn-primary",
            "task-status-btn",
            "task-status-btn--done",
            latest?.status === "done" ? "is-active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onSaveStatus("done")}
        >
          Erledigt
        </button>

        <button
          type="button"
          className={[
            "btn-ghost",
            "task-status-btn",
            "task-status-btn--blocked",
            latest?.status === "blocked" ? "is-active is-blocked" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onSaveStatus("blocked")}
        >
          Blockiert
        </button>

        <button
          type="button"
          className={[
            "btn-ghost",
            "task-status-btn",
            "task-status-btn--skipped",
            latest?.status === "skipped" ? "is-active is-skipped" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onSaveStatus("skipped")}
        >
          Übersprungen
        </button>

        {hasDetails ? (
          <button
            type="button"
            className={[
              "task-details-toggle",
              isDetailsOpen ? "is-open" : "",
              history.length > 0 ? "has-history" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-expanded={isDetailsOpen}
            aria-controls={detailsId}
            aria-label={isDetailsOpen ? "Verlauf ausblenden" : "Verlauf einblenden"}
            title={isDetailsOpen ? "Verlauf ausblenden" : "Verlauf einblenden"}
            onClick={() => setIsDetailsOpen((value) => !value)}
          >
            <span className="task-details-toggle__icon" aria-hidden="true">
              {isDetailsOpen ? "−" : "+"}
            </span>

            {history.length > 0 ? (
              <span className="task-details-toggle__count">{history.length}</span>
            ) : null}
          </button>
        ) : null}
      </div>

      {isDetailsOpen ? (
        <div id={detailsId} className="task-details-panel">
          {description ? (
            <div className="task-description contextual-surface">{description}</div>
          ) : null}

          {history.length > 0 ? (
            <div className="task-note-preview contextual-surface">
              {history.map((event) => (
                <div key={event.id} className="task-history-row">
                  <div className="task-history-row__top">
                    <span
                      className={[
                        "status-badge",
                        "task-history-badge",
                        `status-${event.status}`,
                      ].join(" ")}
                    >
                      {statusLabel(event.status)}
                    </span>
                    <span className="shift-sub">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>

                  {event.note && !isAutoParentDone(event.note) ? (
                    <div className="task-history-note">{event.note}</div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
