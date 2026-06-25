import React from "react";
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
  noteDraft: string;
  isCompact?: boolean;
  onNoteChange: (value: string) => void;
  onSaveStatus: (status: TaskStatus) => void;
};

export function TaskCard({
  task,
  latest,
  history,
  isCompact = false,
  onSaveStatus,
}: TaskCardProps) {
  return (
    <div
      className={`shift-card task-card contextual-task-card ${
        isCompact ? "task-card--compact" : ""
      }`}
    >
      <div className="shift-meta task-meta">
        <div className="task-topline">
          <div className="shift-date">{task.nameSnapshot}</div>

          <div
            className={`status-badge ${
              latest ? `status-${latest.status}` : "status-open"
            }`}
          >
            {latest ? statusLabel(latest.status) : "Offen"}
          </div>
        </div>

        <div className="task-actions task-actions--semantic">
          <button
            type="button"
            className={`task-status-btn task-status-btn--done ${
              latest?.status === "done" ? "is-active" : ""
            }`}
            onClick={() => onSaveStatus("done")}
          >
            Erledigt
          </button>

          <button
            type="button"
            className={`task-status-btn task-status-btn--blocked ${
              latest?.status === "blocked" ? "is-active is-blocked" : ""
            }`}
            onClick={() => onSaveStatus("blocked")}
          >
            Blockiert
          </button>

          <button
            type="button"
            className={`task-status-btn task-status-btn--skipped ${
              latest?.status === "skipped" ? "is-active is-skipped" : ""
            }`}
            onClick={() => onSaveStatus("skipped")}
          >
            Übersprungen
          </button>
        </div>

        {history.length > 0 ? (
          <div className="task-note-preview contextual-surface">
            <strong>Historie:</strong>
            <div style={{ marginTop: 8 }}>
              {history.map((event) => (
                <div key={event.id} className="shift-sub">
                  {statusLabel(event.status)} · {formatTimestamp(event.timestamp)}
                  {event.note && !isAutoParentDone(event.note)
                    ? ` · ${event.note}`
                    : ""}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
