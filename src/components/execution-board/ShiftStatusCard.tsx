import React from "react";

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
    <section className="card contextual-card shift-status-card">
      <div className="shift-status-head">
        <div>
          <h2 className="card-title">Schichtstatus</h2>
          <p className="card-subtitle">
            Gesamtfortschritt der laufenden Schicht statt nur eines Aufgabenblocks.
          </p>
        </div>

        <div className="shift-status-percent">{shiftProgressPercent}%</div>
      </div>

      <div className="shift-status-bar">
        <div
          className="shift-status-bar-fill"
          style={{ width: `${shiftProgressPercent}%` }}
        />
      </div>

      <div className="shift-status-meta">
        <div className="shift-status-chip shift-status-chip--done">
          Erledigt: {doneCount}
        </div>
        <div className="shift-status-chip shift-status-chip--open">
          Offen: {openCount}
        </div>
        <div className="shift-status-chip shift-status-chip--blocked">
          Blockiert: {blockedCount}
        </div>
        <div className="shift-status-chip shift-status-chip--skipped">
          Übersprungen: {skippedCount}
        </div>
        <div className="shift-status-chip shift-status-chip--total">
          Gesamt: {totalLeafTasks}
        </div>
      </div>
    </section>
  );
}
