import React from "react";

type BoardHeaderProps = {
  title: string;
  subtitle: string;
  onBack: () => void;
};

export function BoardHeader({
  title,
  subtitle,
  onBack,
}: BoardHeaderProps) {
  return (
    <section className="card contextual-card">
      <div className="row">
        <div>
          <h1 className="card-title">{title}</h1>
          <p className="card-subtitle">{subtitle}</p>
        </div>

        <div className="spacer" />

        <button
          type="button"
          className="btn-ghost contextual-ghost-btn"
          onClick={onBack}
        >
          ← Zurück zu Schichten
        </button>
      </div>
    </section>
  );
}
