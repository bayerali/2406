import React from "react";
import type { ShiftActivity, TaskEvent } from "../../types";

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
  if (parentGroups.length === 0) {
    return <div className="card empty">Keine Elternpunkte gefunden.</div>;
  }

  return (
    <div className="parent-list">
      {parentGroups.map((parent) => {
        const latest = latestEventByShiftActivityId.get(parent.id);
        const isActive = selectedParentId === parent.id;

        return (
          <button
            key={parent.id}
            type="button"
            className={`parent-pill contextual-child-pill ${
              isActive ? "parent-pill--active" : ""
            }`}
            onClick={() => onSelect(parent.id)}
          >
            {parent.nameSnapshot}
            {latest?.status === "done" ? " · Erledigt" : ""}
          </button>
        );
      })}
    </div>
  );
}
