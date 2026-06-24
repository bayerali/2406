import React from "react";
import type { BoardMode } from "../../types";
import { BOARD_LABEL } from "../../utils/executionBoard";

type BoardModeTabsProps = {
  selectedMode: BoardMode;
  availableModes: BoardMode[];
  onSelect: (mode: BoardMode) => void;
};

export function BoardModeTabs({
  selectedMode,
  availableModes,
  onSelect,
}: BoardModeTabsProps) {
  return (
    <div className="parent-list">
      {(["Primary", "Secondary"] as BoardMode[]).map((mode) => {
        const isAvailable = availableModes.includes(mode);
        const isActive = selectedMode === mode;

        return (
          <button
            key={mode}
            type="button"
            className={`parent-pill contextual-pill ${
              isActive ? "parent-pill--active" : ""
            }`}
            onClick={() => onSelect(mode)}
            disabled={!isAvailable}
          >
            {BOARD_LABEL[mode]}
          </button>
        );
      })}
    </div>
  );
}
