import React from "react";
import type { BoardMode } from "../../types";

type BoardModeTabsProps = {
  selectedMode: BoardMode;
  availableModes: BoardMode[];
  onSelect: (mode: BoardMode) => void;
};

const MODE_COPY: Record<
  BoardMode,
  { title: string; accentClass: string }
> = {
  Primary: {
    title: "Primär",
    accentClass: "bereich-card--primary",
  },
  Secondary: {
    title: "Sekundär",
    accentClass: "bereich-card--secondary",
  },
};

export function BoardModeTabs({
  selectedMode,
  availableModes,
  onSelect,
}: BoardModeTabsProps) {
  return (
    <div className="bereich-grid" role="tablist" aria-label="Bereiche">
      {availableModes.map((mode) => {
        const config = MODE_COPY[mode];
        const isActive = selectedMode === mode;

        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`bereich-card ${config.accentClass} ${
              isActive ? "bereich-card--active" : ""
            }`}
            onClick={() => onSelect(mode)}
          >
            <div className="bereich-card__top">
              <span className="bereich-card__indicator" aria-hidden="true" />
            </div>

            <div className="bereich-card__body">
              <div className="bereich-card__title">{config.title}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
