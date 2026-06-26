import React from "react";
import type { ShiftNote, ShiftNoteKind } from "../../types";
import { ShiftNotesPanel } from "./ShiftNotesPanel";
import styles from "./ShiftNotesSection.module.css";

type ShiftNotesSectionProps = {
  notes: ShiftNote[];
  noteText: string;
  noteKind: ShiftNoteKind;
  onNoteTextChange: (value: string) => void;
  onNoteKindChange: (value: ShiftNoteKind) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function ShiftNotesSection({
  notes,
  noteText,
  noteKind,
  onNoteTextChange,
  onNoteKindChange,
  onSubmit,
}: ShiftNotesSectionProps) {
  return (
    <section className={styles.section}>
      <ShiftNotesPanel
        notes={notes}
        noteText={noteText}
        noteKind={noteKind}
        onNoteTextChange={onNoteTextChange}
        onNoteKindChange={onNoteKindChange}
        onSubmit={onSubmit}
      />
    </section>
  );
}
