import React from "react";

type BoardHeaderProps = {
  title: string;
  subtitle: string;
  onBack: () => void;
  modeClassName?: string;
  shiftType?: "Frueh" | "Spaet" | "Nacht";
  operator?: string;
  line?: string;
  shiftLabel?: string;
};

export function BoardHeader({
  title,
  subtitle,
  onBack,
  modeClassName = "",
  shiftType,
  operator,
  line,
  shiftLabel,
}: BoardHeaderProps) {
  const shiftTypeClass = shiftType ? `shift-type-badge shift-type-badge--${shiftType}` : "";

  return (
    <section className={`board-header ${modeClassName}`.trim()}>
      <div className="board-header__row">
        <div className="board-header__content">
          <div className="board-header__text">
            <h1 className="board-header__title">{title}</h1>

            <div className="board-header__meta">
              {operator ? (
                <span className="board-header__operator">{operator}</span>
              ) : null}

              {shiftLabel && shiftType ? (
                <span className={shiftTypeClass}>{shiftLabel}</span>
              ) : null}

              {line ? <span className="board-header__line">{line}</span> : null}

              <span className="board-header__subtitle">{subtitle}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn-ghost board-header__back"
          onClick={onBack}
        >
          Zurück zu Schichten
        </button>
      </div>
    </section>
  );
}
