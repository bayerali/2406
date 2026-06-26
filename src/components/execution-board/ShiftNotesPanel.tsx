import React from "react";
import type { Shift, ShiftNoteKind } from "../../types";
import { formatTimestamp } from "../../utils/executionBoard";
import styles from "./ShiftNotesPanel.module.css";

type ShiftNotesPanelProps = {
  notes: Shift["notes"];
  noteText: string;
  noteKind: ShiftNoteKind;
  onNoteTextChange: (value: string) => void;
  onNoteKindChange: (value: ShiftNoteKind) => void;
  onSubmit: (event: React.FormEvent) => void;
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
    <section className={styles.card}>
      <h2 className={styles.title}>Übergabe & Meldungen</h2>
      <p className={styles.subtitle}>
        Hinweise für die nächste Schicht, Warnungen oder allgemeine Infos.
      </p>

      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="shift-note-kind">
            Typ
          </label>
          <select
            id="shift-note-kind"
            className={styles.select}
            value={noteKind}
            onChange={(event) =>
              onNoteKindChange(event.target.value as ShiftNoteKind)
            }
          >
            <option value="handover">Übergabe</option>
            <option value="warning">Warnung</option>
            <option value="info">Info</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="shift-note-text">
            Neue Notiz
          </label>
          <textarea
            id="shift-note-text"
            className={styles.textarea}
            value={noteText}
            onChange={(event) => onNoteTextChange(event.target.value)}
            rows={4}
            placeholder="Zum Beispiel: Material knapp, Linie wartet auf Freigabe ..."
          />
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.primaryButton}>
            Notiz speichern
          </button>
        </div>
      </form>

      {notes.length === 0 ? (
        <div className={styles.emptyState}>
          Noch keine Übergaben oder Meldungen erfasst.
        </div>
      ) : (
        <div className={styles.notesList}>
          {[...notes]
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((note) => (
              <article
                key={note.id}
                className={`${styles.noteCard} ${
                  note.kind === "handover"
                    ? styles.noteHandover
                    : note.kind === "warning"
                    ? styles.noteWarning
                    : styles.noteInfo
                }`}
              >
                <div className={styles.noteTopline}>
                  <span className={styles.noteKind}>
                    {note.kind === "handover"
                      ? "Übergabe"
                      : note.kind === "warning"
                      ? "Warnung"
                      : "Info"}
                  </span>

                  <span className={styles.noteTime}>
                    {formatTimestamp(note.createdAt)}
                  </span>
                </div>

                <div className={styles.noteText}>{note.text}</div>
              </article>
            ))}
        </div>
      )}
    </section>
  );
}
