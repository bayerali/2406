import React from "react";
import type { ShiftNote, ShiftNoteKind } from "../../types";
import { ShiftNotesPanel } from "./ShiftNotesPanel";

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
    <section className="execution-board-section">
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
