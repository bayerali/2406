import React from "react";
import type { ParentStats } from "../../hooks/useExecutionBoard";

type TaskProgressCardProps = Readonly<ParentStats>;

export function TaskProgressCard({
  total,
  done,
  blocked,
  skipped,
  open,
  percent,
}: TaskProgressCardProps) {
  return (
    <div className="task-progress-card contextual-surface">
      <div className="task-progress-head">
        <span className="task-progress-title">Fortschritt</span>
        <span className="task-progress-value">
          {done} / {total} erledigt ({percent}%)
        </span>
      </div>

      <div className="task-progress-bar">
        <div
          className="task-progress-bar-fill"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="task-progress-meta">
        <span>Offen: {open}</span>
        <span>Blockiert: {blocked}</span>
        <span>Übersprungen: {skipped}</span>
      </div>
    </div>
  );
}
