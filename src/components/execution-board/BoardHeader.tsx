import React from "react";

type BoardHeaderProps = {
  title: string;
  subtitle: string;
  onBack: () => void;
  modeClassName?: string;
};

export function BoardHeader({
  title,
  subtitle,
  onBack,
  modeClassName = "",
}: BoardHeaderProps) {
  return (
    <section className={`board-header ${modeClassName}`.trim()}>
      <div className="board-header__content">
        <button type="button" className="btn-ghost board-header__back" onClick={onBack}>
          Zurück zu Schichten
        </button>

        <div className="board-header__text">
          <h1 className="board-header__title">{title}</h1>
          <p className="board-header__subtitle">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}
