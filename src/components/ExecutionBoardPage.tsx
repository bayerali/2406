import React, { useMemo, useState } from "react";
import type {
  BoardMode,
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
  onDashboardClick: () => void;
};

function getShiftLabel(shiftType: Shift["shiftType"]): string {
  if (shiftType === "Frueh") return "Frühschicht";
  if (shiftType === "Spaet") return "Spätschicht";
  return "Nachtschicht";
}

function normalizeLabel(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("de-DE")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue");
}

function getModeForActivity(activity: ShiftActivity): BoardMode {
  const normalizedName = normalizeLabel(activity.nameSnapshot);

  if (
    normalizedName.includes("primaer") ||
    normalizedName.includes("primary") ||
    normalizedName === "p"
  ) {
    return "Primary";
  }

  return "Secondary";
}

function createTaskEvent(task: ShiftActivity, status: TaskStatus): TaskEvent {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    shiftActivityId: task.id,
    status,
    note: "",
    timestamp: Date.now(),
    imageData: null,
  };
}

export function ExecutionBoardPage({
  db,
  shiftId,
  setDB,
  onBackToShifts,
  onDashboardClick,
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

  const sortedActivities = [...shift.shiftActivities].sort(
    (a, b) => a.sortOrderSnapshot - b.sortOrderSnapshot
  );

  const childrenByParentId = new Map<number, ShiftActivity[]>();

  sortedActivities.forEach((activity) => {
    if (activity.parentIdSnapshot === null) return;
    const current = childrenByParentId.get(activity.parentIdSnapshot) ?? [];
    current.push(activity);
    childrenByParentId.set(activity.parentIdSnapshot, current);
  });

  const latestEventByShiftActivityId = new Map<number, TaskEvent>();
  const historyByShiftActivityId = new Map<number, TaskEvent[]>();

  [...shift.taskEvents]
    .sort((a, b) => a.timestamp - b.timestamp)
    .forEach((event) => {
      latestEventByShiftActivityId.set(event.shiftActivityId, event);

      const current = historyByShiftActivityId.get(event.shiftActivityId) ?? [];
      current.push(event);
      historyByShiftActivityId.set(event.shiftActivityId, current);
    });

  const allLeafTasks = sortedActivities.filter(
    (activity) => !childrenByParentId.has(activity.id)
  );

  const doneCount = allLeafTasks.filter(
    (task) => latestEventByShiftActivityId.get(task.id)?.status === "done"
  ).length;

  const blockedCount = allLeafTasks.filter(
    (task) => latestEventByShiftActivityId.get(task.id)?.status === "blocked"
  ).length;

  const skippedCount = allLeafTasks.filter(
    (task) => latestEventByShiftActivityId.get(task.id)?.status === "skipped"
  ).length;

  const totalLeafTasks = allLeafTasks.length;
  const openCount = Math.max(
    totalLeafTasks - doneCount - blockedCount - skippedCount,
    0
  );
  const shiftProgressPercent =
    totalLeafTasks > 0 ? Math.round((doneCount / totalLeafTasks) * 100) : 0;

  const allParentGroups = sortedActivities.filter((activity) =>
    childrenByParentId.has(activity.id)
  );

  const primaryParentGroups = allParentGroups.filter(
    (activity) => getModeForActivity(activity) === "Primary"
  );

  const secondaryParentGroups = allParentGroups.filter(
    (activity) => getModeForActivity(activity) === "Secondary"
  );

  const parentGroups =
    selectedMode === "Primary" ? primaryParentGroups : secondaryParentGroups;

  const effectiveParentId =
    selectedParentId !== null &&
    parentGroups.some((group) => group.id === selectedParentId)
      ? selectedParentId
      : parentGroups[0]?.id ?? null;

  const selectedParent =
    parentGroups.find((group) => group.id === effectiveParentId) ?? null;

  const childTasks =
    selectedParent !== null
      ? sortedActivities.filter(
          (activity) => activity.parentIdSnapshot === selectedParent.id
        )
      : [];

  const subtitle = `${shift.date} · ${shift.operator} · ${shift.line}`;

  const saveTaskStatus = (task: ShiftActivity, status: TaskStatus) => {
    const event = createTaskEvent(task, status);

    const nextShifts = db.shifts.map((entry) =>
      entry.id === shift.id
        ? {
            ...entry,
            taskEvents: [...entry.taskEvents, event],
          }
        : entry
    );

    setDB({
      ...db,
      shifts: nextShifts,
    });
  };

  const handleSubmitNote = (event: React.FormEvent<HTMLFormElement>) => {
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
      <div className={styles.executionBoard}>
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

        <section className={`${styles.contextualCard} ${styles.controlCard}`}>
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
                Gesamtfortschritt der laufenden Schicht.
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

            <ParentGroupPicker
              parentGroups={parentGroups}
              selectedParentId={effectiveParentId}
              latestEventByShiftActivityId={latestEventByShiftActivityId}
              onSelect={setSelectedParentId}
            />
          </div>
        </section>

        <div className={styles.dashboardGrid}>
          <section className={`${styles.contextualCard} ${styles.workCard}`}>
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

              <button
                type="button"
                className={styles.secondaryAction}
                onClick={onDashboardClick}
              >
                Zur Schichtübersicht
              </button>
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
                    onSaveStatus={(status) => saveTaskStatus(task, status)}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className={styles.sideColumn}>
            <section className={`${styles.contextualCard} ${styles.notesCard}`}>
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
                    Hinweise für die nächste Schicht, Warnungen oder allgemeine
                    Infos.
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
          </aside>
        </div>
      </div>
    </main>
  );
}
