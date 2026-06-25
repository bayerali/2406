import React from "react";
import type { ShiftActivity, TaskEvent } from "../../types";
import { statusLabel } from "../../utils/executionBoard";

type ParentGroupPickerProps = {
  parentGroups: ShiftActivity[];
  selectedParentId: number | null;
  latestEventByShiftActivityId: Map<number, TaskEvent | null>;
  onSelect: (parentId: number) => void;
};

export function ParentGroupPicker({
  parentGroups,
  selectedParentId,
  latestEventByShiftActivityId,
  onSelect,
}: ParentGroupPickerProps) {
  return (
    <div className="shift-list">
      {parentGroups.length === 0 ? (
        <div className="card empty">Keine Elternpunkte vorhanden.</div>
      ) : (
        parentGroups.map((parent) => {
          const latest = latestEventByShiftActivityId.get(parent.id) ?? null;
          const isActive = selectedParentId === parent.id;

          return (
            <button
              key={parent.id}
              type="button"
              className={`shift-card contextual-task-card ${
                isActive ? "parent-row--active" : ""
              }`}
              onClick={() => onSelect(parent.id)}
            >
              <div className="shift-meta">
                <div className="shift-date">{parent.nameSnapshot}</div>
                <div className="shift-sub">
                  {latest ? statusLabel(latest.status) : "Noch keine Rückmeldung"}
                </div>
              </div>

              <div
                className={`status-badge ${
                  latest ? `status-${latest.status}` : "status-open"
                }`}
              >
                {latest ? statusLabel(latest.status) : "Offen"}
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
