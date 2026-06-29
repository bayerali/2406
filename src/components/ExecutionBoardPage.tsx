import React, { useEffect, useMemo, useState } from "react";
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

function getModeLabel(mode: BoardMode): string {
  return mode === "Primary" ? "Primär" : "Sekundär";
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

function formatShiftDate(dateValue: string): string {
  const parsed = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateValue;

  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

export function ExecutionBoardPage({
  db,
  shiftId,
  setDB,
  onBackToShifts,
  onDashboardClick,
}: ExecutionBoardPageProps) {
  const [isShiftStatusOpen, setIsShiftStatusOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<BoardMode>("Primary");
  const [selectedTopParentId, setSelectedTopParentId] = useState<number | null>(
    null
  );
  const [selectedSubParentId, setSelectedSubParentId] = useState<number | null>(
    null
  );
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
  const formattedDate = formatShiftDate(shift.date);

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

  const topParents = sortedActivities.filter(
    (activity) => activity.parentIdSnapshot === null
  );

  const filteredTopParents = topParents.filter(
    (activity) => getModeForActivity(activity) === selectedMode
  );

  const effectiveTopParentId =
    selectedTopParentId !== null &&
    filteredTopParents.some((group) => group.id === selectedTopParentId)
      ? selectedTopParentId
      : filteredTopParents[0]?.id ?? null;

  const selectedTopParent =
    filteredTopParents.find((group) => group.id === effectiveTopParentId) ?? null;

  const subParents =
    selectedTopParent !== null
      ? sortedActivities.filter(
          (activity) => activity.parentIdSnapshot === selectedTopParent.id
        )
      : [];

  const effectiveSubParentId =
    selectedSubParentId !== null &&
    subParents.some((group) => group.id === selectedSubParentId)
      ? selectedSubParentId
      : subParents[0]?.id ?? null;

  const selectedSubParent =
    subParents.find((group) => group.id === effectiveSubParentId) ?? null;

  const leafTasks =
    selectedSubParent !== null
      ? sortedActivities.filter(
          (activity) => activity.parentIdSnapshot === selectedSubParent.id
        )
      : [];

  useEffect(() => {
    setSelectedTopParentId(null);
    setSelectedSubParentId(null);
  }, [selectedMode, shift.id]);

  useEffect(() => {
    setSelectedSubParentId(null);
  }, [effectiveTopParentId]);

  const subtitle = `${formattedDate}`;

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

        <section className={styles.statusShell}>
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
                Fortschritt, offene Punkte und aktuelle Lage der Schicht.
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
        </section>

        <section className={styles.selectionShell}>
          <div className={styles.modeTabsWrap}>
            <div
              className={styles.modeTabs}
              role="tablist"
              aria-label="Auswahl der Arbeitsbereiche"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedMode === "Primary"}
                className={`${styles.modeTab} ${styles.modeTabPrimary} ${
                  selectedMode === "Primary" ? styles.modeTabPrimaryActive : ""
                }`}
                onClick={() => setSelectedMode("Primary")}
              >
                Primär
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={selectedMode === "Secondary"}
                className={`${styles.modeTab} ${styles.modeTabSecondary} ${
                  selectedMode === "Secondary"
                    ? styles.modeTabSecondaryActive
                    : ""
                }`}
                onClick={() => setSelectedMode("Secondary")}
              >
                Sekundär
              </button>
            </div>
          </div>
        </section>

        <div className={styles.workspaceGrid}>
          <section className={styles.masterPane}>
            <div className={styles.paneHead}>
              <div>
                <h2 className={styles.cardTitle}>Teilbereiche</h2>
                <p className={styles.cardSubtitle}>
                  {selectedTopParent
                    ? `Untergruppen für ${getModeLabel(selectedMode)}.`
                    : "Wähle zuerst einen Bereich aus."}
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

            {subParents.length === 0 ? (
              <div className={styles.emptyCard}>
                Keine Teilbereiche für diese Auswahl vorhanden.
              </div>
            ) : (
              <div className={styles.subParentList}>
                {subParents.map((group) => {
                  const groupLeafTasks = sortedActivities.filter(
                    (activity) => activity.parentIdSnapshot === group.id
                  );

                  const groupDoneCount = groupLeafTasks.filter(
                    (task) =>
                      latestEventByShiftActivityId.get(task.id)?.status === "done"
                  ).length;

                  return (
                    <button
                      key={group.id}
                      type="button"
                      className={`${styles.subParentItem} ${
                        effectiveSubParentId === group.id
                          ? styles.subParentItemActive
                          : ""
                      }`}
                      onClick={() => setSelectedSubParentId(group.id)}
                    >
                      <span className={styles.subParentTitle}>
                        {group.nameSnapshot}
                      </span>
                      <span className={styles.subParentMeta}>
                        {groupLeafTasks.length} Aufgaben · {groupDoneCount} erledigt
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className={styles.detailPane}>
            <div className={styles.paneHead}>
              <div>
                <h2 className={styles.cardTitle}>
                  {selectedSubParent?.nameSnapshot ?? "Aufgaben"}
                </h2>
                <p className={styles.cardSubtitle}>
                  {selectedSubParent
                    ? "Bearbeite die Aufgaben dieses Teilbereichs. Verlauf ist pro Aufgabe einklappbar."
                    : "Wähle links einen Teilbereich aus."}
                </p>
              </div>
            </div>

            {leafTasks.length === 0 ? (
              <div className={styles.emptyCard}>
                Keine Aufgaben für diesen Teilbereich vorhanden.
              </div>
            ) : (
              <div className={styles.taskList}>
                {leafTasks.map((task) => (
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
        </div>

        <aside className={styles.notesShell}>
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
                Hinweise, Warnungen und Informationen für die nächste Schicht.
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
        </aside>
      </div>
    </main>
  );
}
