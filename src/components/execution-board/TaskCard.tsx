import React from "react";
import type { ShiftActivity, TaskEvent } from "../../types";
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
  onNoteChange: (value: string) => void;
  onSaveStatus: (status: TaskEvent["status"]) => void;
};

export function TaskCard({
  task,
  latest,
  history,
  noteDraft,
  onNoteChange,
  onSaveStatus,
}: TaskCardProps) {
  return (
    <div className="shift-card task-card contextual-task-card">
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

        <div className="shift-sub">
          {latest
            ? `Letzter Zeitstempel: ${formatTimestamp(latest.timestamp)}`
            : "Noch kein Zeitstempel"}
        </div>

        <div className="task-actions">
          <button
            type="button"
            className={`btn-primary task-status-btn ${
              latest?.status === "done" ? "is-active" : ""
            }`}
            onClick={() => onSaveStatus("done")}
          >
            Erledigt
          </button>

          <button
            type="button"
            className={`btn-ghost task-status-btn ${
              latest?.status === "blocked" ? "is-active is-blocked" : ""
            }`}
            onClick={() => onSaveStatus("blocked")}
          >
            Blockiert
          </button>

          <button
            type="button"
            className={`btn-ghost task-status-btn ${
              latest?.status === "skipped" ? "is-active is-skipped" : ""
            }`}
            onClick={() => onSaveStatus("skipped")}
          >
            Übersprungen
          </button>
        </div>

        <div className="field task-note-field">
          <label className="label" htmlFor={`task-note-${task.id}`}>
            Notiz
          </label>

          <textarea
            id={`task-note-${task.id}`}
            className="input textarea task-note-textarea contextual-input"
            rows={3}
            value={noteDraft}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Hinweis, Beobachtung oder Grund eintragen ..."
          />
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
