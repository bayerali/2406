import React, { useMemo, useState } from "react";
import type {
  DB,
  Shift,
  ShiftActivity,
  ShiftNoteKind,
  TaskEvent,
  TaskStatus,
} from "../types";
import { BoardHeader } from "./execution-board/BoardHeader";
import { ShiftStatusCard } from "./execution-board/ShiftStatusCard";
import { ShiftNotesPanel } from "./execution-board/ShiftNotesPanel";
import { ParentGroupPicker } from "./execution-board/ParentGroupPicker";
import { TaskCard } from "./execution-board/TaskCard";
import styles from "./ExecutionBoardPage.module.css";

type ExecutionBoardPageProps = {
  db: DB;
  shiftId: number;
  setDB: (db: DB) => void;
  onBackToShifts: () => void;
};

type BoardMode = "Primary" | "Secondary";

function getShiftLabel(shiftType: Shift["shiftType"]): string {
  if (shiftType === "Frueh") return "Frühschicht";
  if (shiftType === "Spaet") return "Spätschicht";
  return "Nachtschicht";
}

function createTaskEvent(
  task: ShiftActivity,
  shiftId: number,
  status: TaskStatus
): TaskEvent {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    shiftId,
    shiftActivityId: task.id,
    status,
    createdAt: Date.now(),
    note: "",
  };
}

function isLeafTask(task: ShiftActivity): boolean {
  return !task.children || task.children.length === 0;
}

export function ExecutionBoardPage({
  db,
  shiftId,
  setDB,
  onBackToShifts,
}: ExecutionBoardPageProps) {
  const [isShiftStatusOpen, setIsShiftStatusOpen] = useState(true);
  const [isNotesOpen, setIsNotesOpen] = useState(true);
  const [selectedMode, setSelectedMode] = useState<BoardMode>("Primary");
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteKind, setNoteKind] = useState<ShiftNoteKind>("handover");

  const shift = useMemo(
    () => db.shifts.find((entry) => entry.id === shiftId) ?? null,
    [db.shifts, shiftId]
  );

  if (!shift) {
    return (
      <main className={styles.page}>
        <div className={styles.emptyCard}>Schicht nicht gefunden.</div>
      </main>
    );
  }

  const shiftLabel = getShiftLabel(shift.shiftType);

  const latestEventByShiftActivityId = new Map<number, TaskEvent>();
  const historyByShiftActivityId = new Map<number, TaskEvent[]>();

  [...db.taskEvents]
    .filter((event) => event.shiftId === shift.id)
    .sort((a, b) => a.createdAt - b.createdAt)
    .forEach((event) => {
      latestEventByShiftActivityId.set(event.shiftActivityId, event);

      const current = historyByShiftActivityId.get(event.shiftActivityId) ?? [];
      current.push(event);
      historyByShiftActivityId.set(event.shiftActivityId, current);
    });

  const allLeafTasks = shift.activities.filter(isLeafTask);
  const doneCount = allLeafTasks.filter(
    (task) => latestEventByShiftActivityId.get(task.id)?.status === "Done"
  ).length;
  const blockedCount = allLeafTasks.filter(
    (task) => latestEventByShiftActivityId.get(task.id)?.status === "Blocked"
  ).length;
  const skippedCount = allLeafTasks.filter(
    (task) => latestEventByShiftActivityId.get(task.id)?.status === "Skipped"
  ).length;
  const totalLeafTasks = allLeafTasks.length;
  const openCount = Math.max(
    totalLeafTasks - doneCount - blockedCount - skippedCount,
    0
  );
  const shiftProgressPercent =
    totalLeafTasks > 0 ? Math.round((doneCount / totalLeafTasks) * 100) : 0;

  const primaryParentGroups = shift.activities.filter(
    (task) =>
      !task.parentId &&
      (task.mode === "Primary" || !task.mode)
  );

  const secondaryParentGroups = shift.activities.filter(
    (task) => !task.parentId && task.mode === "Secondary"
  );

  const parentGroups =
    selectedMode === "Primary" ? primaryParentGroups : secondaryParentGroups;

  const effectiveParentId =
    selectedParentId && parentGroups.some((group) => group.id === selectedParentId)
      ? selectedParentId
      : parentGroups[0]?.id ?? null;

  const selectedParent =
    parentGroups.find((group) => group.id === effectiveParentId) ?? null;

  const childTasks = selectedParent
    ? shift.activities.filter((task) => task.parentId === selectedParent.id)
    : [];

  const subtitle = `${shift.date} · ${shift.operator} · ${shift.line}`;

  const saveTaskStatus = (task: ShiftActivity, status: TaskStatus) => {
    const event = createTaskEvent(task, shift.id, status);

    setDB({
      ...db,
      taskEvents: [...db.taskEvents, event],
    });
  };

  const handleSubmitNote = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmed = noteText.trim();
    if (!trimmed) return;

    const nextNote = {
      id: Date.now(),
      kind: noteKind,
      text: trimmed,
      createdAt: Date.now(),
    };

    const nextShifts = db.shifts.map((entry) =>
      entry.id === shift.id
        ? {
            ...entry,
            notes: [...entry.notes, nextNote],
          }
        : entry
    );

    setDB({
      ...db,
      shifts: nextShifts,
    });

    setNoteText("");
    setNoteKind("handover");
  };

  return (
    <main className={styles.page}>
      <div
        className={`${styles.executionBoard} ${
          selectedMode === "Secondary" ? styles.boardSecondary : styles.boardPrimary
        }`}
      >
        <div className={styles.boardHeaderShell}>
          <BoardHeader
            title="Ausführungsboard"
            subtitle={subtitle}
            onBack={onBackToShifts}
            mode={selectedMode === "Secondary" ? "secondary" : "primary"}
            shiftType={shift.shiftType}
            shiftLabel={shiftLabel}
            operator={shift.operator}
            line={shift.line}
          />
        </div>

        <section className={styles.contextualCard}>
          <button
            type="button"
            className={styles.foldableSectionToggle}
            onClick={() => setIsShiftStatusOpen((value) => !value)}
            aria-expanded={isShiftStatusOpen}
          >
            <span className={styles.foldableSectionToggleText}>
              <span className={styles.foldableSectionToggleTitle}>
                Schichtstatus
              </span>
              <span className={styles.foldableSectionToggleSubtitle}>
                Gesamtfortschritt der laufenden Schicht statt nur eines Aufgabenblocks.
              </span>
            </span>

            <span
              className={`${styles.foldableSectionToggleIcon} ${
                isShiftStatusOpen ? styles.isOpen : ""
              }`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {isShiftStatusOpen ? (
            <div className={styles.foldableSectionPanel}>
              <ShiftStatusCard
                totalLeafTasks={totalLeafTasks}
                doneCount={doneCount}
                blockedCount={blockedCount}
                skippedCount={skippedCount}
                openCount={openCount}
                shiftProgressPercent={shiftProgressPercent}
              />
            </div>
          ) : null}

          <div className={styles.modeTabsWrap}>
            <div className={styles.modeTabs}>
              <button
                type="button"
                className={`${styles.modeTab} ${
                  selectedMode === "Primary" ? styles.modeTabActive : ""
                }`}
                onClick={() => {
                  setSelectedMode("Primary");
                  setSelectedParentId(null);
                }}
              >
                Primary
              </button>

              <button
                type="button"
                className={`${styles.modeTab} ${
                  selectedMode === "Secondary" ? styles.modeTabActive : ""
                }`}
                onClick={() => {
                  setSelectedMode("Secondary");
                  setSelectedParentId(null);
                }}
              >
                Secondary
              </button>
            </div>
          </div>

          <ParentGroupPicker
            parentGroups={parentGroups}
            selectedParentId={effectiveParentId}
            latestEventByShiftActivityId={latestEventByShiftActivityId}
            onSelect={setSelectedParentId}
          />
        </section>

        <div className={styles.dashboardGrid}>
          <section className={styles.contextualCard}>
            <div className={styles.taskSectionHead}>
              <div>
                <h2 className={styles.cardTitle}>
                  {selectedParent?.nameSnapshot ?? "Aufgaben"}
                </h2>
                <p className={styles.cardSubtitle}>
                  {selectedParent
                    ? "Bearbeite die zugeordneten Aufgaben innerhalb dieses Blocks."
                    : "Wähle zuerst einen Elternpunkt aus."}
                </p>
              </div>
            </div>

            {childTasks.length === 0 ? (
              <div className={styles.emptyCard}>
                Keine Aufgaben für diesen Bereich vorhanden.
              </div>
            ) : (
              <div className={styles.taskList}>
                {childTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    latest={latestEventByShiftActivityId.get(task.id) ?? null}
                    history={historyByShiftActivityId.get(task.id) ?? []}
                    description={task.descriptionSnapshot}
                    onSaveStatus={(status) => saveTaskStatus(task, status)}
                  />
                ))}
              </div>
            )}
          </section>

          <div className={styles.sideColumn}>
            <section className={styles.contextualCard}>
              <button
                type="button"
                className={styles.foldableSectionToggle}
                onClick={() => setIsNotesOpen((value) => !value)}
                aria-expanded={isNotesOpen}
              >
                <span className={styles.foldableSectionToggleText}>
                  <span className={styles.foldableSectionToggleTitle}>
                    Übergabe & Meldungen
                  </span>
                  <span className={styles.foldableSectionToggleSubtitle}>
                    Hinweise für die nächste Schicht, Warnungen oder allgemeine Infos.
                  </span>
                </span>

                <span
                  className={`${styles.foldableSectionToggleIcon} ${
                    isNotesOpen ? styles.isOpen : ""
                  }`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              {isNotesOpen ? (
                <div className={styles.foldableSectionPanel}>
                  <ShiftNotesPanel
                    notes={shift.notes}
                    noteText={noteText}
                    noteKind={noteKind}
                    onNoteTextChange={setNoteText}
                    onNoteKindChange={setNoteKind}
                    onSubmit={handleSubmitNote}
                  />
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
