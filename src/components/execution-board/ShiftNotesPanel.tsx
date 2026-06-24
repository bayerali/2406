import React from "react";
import type { NoteKind, Shift } from "../../types";
import { formatTimestamp } from "../../utils/executionBoard";

type ShiftNotesPanelProps = {
  notes: Shift["notes"];
  noteText: string;
  noteKind: NoteKind;
  onNoteTextChange: (value: string) => void;
  onNoteKindChange: (value: NoteKind) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function ShiftNotesPanel({
  notes,
  noteText,
  noteKind,
  onNoteTextChange,
  onNoteKindChange,
  onSubmit,
}: ShiftNotesPanelProps) {
  return (
    <section className="card contextual-card">
      <h2 className="card-title">Übergabe & Meldungen</h2>
      <p className="card-subtitle">
        Hinweise für die nächste Schicht, Warnungen oder allgemeine Infos.
      </p>

      <form onSubmit={onSubmit}>
        <div className="field">
          <label className="label" htmlFor="shift-note-kind">
            Typ
          </label>

          <select
            id="shift-note-kind"
            className="select contextual-input"
            value={noteKind}
            onChange={(event) => onNoteKindChange(event.target.value as NoteKind)}
          >
            <option value="handover">Übergabe</option>
            <option value="warning">Warnung</option>
            <option value="info">Info</option>
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="shift-note">
            Neue Notiz
          </label>

          <textarea
            id="shift-note"
            className="input textarea contextual-input"
            value={noteText}
            onChange={(event) => onNoteTextChange(event.target.value)}
            rows={4}
            placeholder="Zum Beispiel: Material knapp, Linie wartet auf Freigabe ..."
          />
        </div>

        <div className="parent-list" style={{ marginTop: 12 }}>
          <button type="submit" className="btn-primary">
            Notiz speichern
          </button>
        </div>
      </form>

      <div className="shift-list" style={{ marginTop: 16 }}>
        {notes.length === 0 ? (
          <div className="card empty">
            Noch keine Übergaben oder Meldungen erfasst.
          </div>
        ) : (
          [...notes]
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((note) => (
              <div
                key={note.id}
                className={`shift-card note-card note-${note.kind}`}
              >
                <div className="shift-meta">
                  <div className="shift-date">
                    {note.kind === "handover"
                      ? "Übergabe"
                      : note.kind === "warning"
                      ? "Warnung"
                      : "Info"}
                  </div>

                  <div className="shift-sub">
                    {formatTimestamp(note.createdAt)}
                  </div>

                  <div className="shift-sub">{note.text}</div>
                </div>
              </div>
            ))
        )}
      </div>
    </section>
  );
}
