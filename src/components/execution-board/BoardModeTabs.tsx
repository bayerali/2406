import React from "react";
import type { BoardMode } from "../../types";
import { BOARD_LABEL } from "../../utils/executionBoard";

const BOARD_MODES = ["Primary", "Secondary"] as const satisfies readonly BoardMode[];

type BoardModeTabsProps = {
  selectedMode: BoardMode;
  availableModes: readonly BoardMode[];
  onSelect: (mode: BoardMode) => void;
};

export function BoardModeTabs({
  selectedMode,
  availableModes,
  onSelect,
}: BoardModeTabsProps) {
  return (
    <div className="parent-list">
      {BOARD_MODES.map((mode) => {
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
