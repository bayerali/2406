import React from "react";
import type { DB } from "../types";
import { useExecutionBoard } from "../hooks/useExecutionBoard";
import { BoardHeader } from "./execution-board/BoardHeader";
import { ShiftStatusCard } from "./execution-board/ShiftStatusCard";
import { ShiftNotesPanel } from "./execution-board/ShiftNotesPanel";
import { TaskCard } from "./execution-board/TaskCard";
import styles from "./ExecutionBoardPage.module.css";

type ExecutionBoardPageProps = {
  db: DB;
  setDB: (db: DB) => void;
  shiftId: number;
  onBackToShifts: () => void;
  onDashboardClick: () => void;
};

const SHIFT_LABEL: Record<"Frueh" | "Spaet" | "Nacht", string> = {
  Frueh: "Frühschicht",
  Spaet: "Spätschicht",
  Nacht: "Nachtschicht",
};

export function ExecutionBoardPage({
  db,
  setDB,
  shiftId,
  onBackToShifts,
  onDashboardClick,
}: ExecutionBoardPageProps) {
  const {
    shift,
    selectedMode,
    setSelectedMode,
    selectedParentId,
    setSelectedParentId,
    selectedParent,
    parentGroups,
    visibleTasks,
    latestEventByShiftActivityId,
    noteText,
    setNoteText,
    noteKind,
    setNoteKind,
    totalLeafTasks,
    doneCount,
    blockedCount,
    skippedCount,
    openCount,
    shiftProgressPercent,
    selectedParentStats,
    boardThemeStyle,
    saveStatus,
    getHistory,
    addShiftNote,
  } = useExecutionBoard({
    db,
    setDB,
    shiftId,
  });

  if (!shift) {
    return (
      <main className={styles.page}>
        <div className={styles.emptyCard}>Schicht nicht gefunden.</div>
      </main>
    );
  }

  const shiftLabel = SHIFT_LABEL[shift.shiftType];

  return (
    <main className={styles.page} style={boardThemeStyle}>
      <div className={styles.executionBoard}>
        <div className={styles.boardHeaderShell}>
          <BoardHeader
            title={selectedParent?.nameSnapshot ?? "Ausführungsboard"}
            subtitle={`${shift.operator} · ${shift.line}`}
            onBack={onBackToShifts}
            mode={selectedMode === "Secondary" ? "secondary" : "primary"}
            shiftType={shift.shiftType}
            shiftLabel={shiftLabel}
            operator={shift.operator}
            line={shift.line}
          />
        </div>

        <section className={styles.statusShell}>
          <ShiftStatusCard
            totalLeafTasks={totalLeafTasks}
            doneCount={doneCount}
            blockedCount={blockedCount}
            skippedCount={skippedCount}
            openCount={openCount}
            shiftProgressPercent={shiftProgressPercent}
          />
        </section>

        <section className={styles.selectionShell}>
          <div className={styles.selectionHeader}>
            <div>
              <h2 className={styles.cardTitle}>Bereiche</h2>
              <p className={styles.cardSubtitle}>
                Wähle Modus und Teilbereich für die aktuelle Bearbeitung.
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

          {parentGroups.length === 0 ? (
            <div className={styles.emptyCard}>
              Keine Teilbereiche für diese Auswahl vorhanden.
            </div>
          ) : (
            <div className={styles.subParentList}>
              {parentGroups.map((group) => {
                const isActive = selectedParentId === group.id;
                const latest = latestEventByShiftActivityId.get(group.id) ?? null;

                return (
                  <button
                    key={group.id}
                    type="button"
                    className={`${styles.subParentItem} ${
                      isActive ? styles.subParentItemActive : ""
                    }`}
                    onClick={() => setSelectedParentId(group.id)}
                  >
                    <span className={styles.subParentTitle}>
                      {group.nameSnapshot}
                    </span>
                    <span className={styles.subParentMeta}>
                      {latest ? "Status vorhanden" : "Noch keine Rückmeldung"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.parentStatsShell}>
          <div className={styles.sectionHeadCompact}>
            <h2 className={styles.cardTitle}>
              {selectedParent?.nameSnapshot ?? "Ausgewählter Bereich"}
            </h2>
            <span className={styles.parentStatsBadge}>
              {selectedParentStats.percent}%
            </span>
          </div>

          <div className={styles.parentStatsGrid}>
            <article className={styles.parentStatItem}>
              <span className={styles.parentStatLabel}>Gesamt</span>
              <span className={styles.parentStatValue}>
                {selectedParentStats.total}
              </span>
            </article>

            <article className={styles.parentStatItem}>
              <span className={styles.parentStatLabel}>Erledigt</span>
              <span className={styles.parentStatValue}>
                {selectedParentStats.done}
              </span>
            </article>

            <article className={styles.parentStatItem}>
              <span className={styles.parentStatLabel}>Offen</span>
              <span className={styles.parentStatValue}>
                {selectedParentStats.open}
              </span>
            </article>

            <article className={styles.parentStatItem}>
              <span className={styles.parentStatLabel}>Blockiert</span>
              <span className={styles.parentStatValue}>
                {selectedParentStats.blocked}
              </span>
            </article>

            <article className={styles.parentStatItem}>
              <span className={styles.parentStatLabel}>Übersprungen</span>
              <span className={styles.parentStatValue}>
                {selectedParentStats.skipped}
              </span>
            </article>
          </div>
        </section>

        <section className={styles.detailPane}>
          <div className={styles.paneHead}>
            <div>
              <h2 className={styles.cardTitle}>
                {selectedParent?.nameSnapshot ?? "Aufgaben"}
              </h2>
              <p className={styles.cardSubtitle}>
                Bearbeite die Aufgaben dieses Teilbereichs. Verlauf ist pro
                Aufgabe einklappbar.
              </p>
            </div>
          </div>

          {visibleTasks.length === 0 ? (
            <div className={styles.emptyCard}>
              Keine Aufgaben für diesen Teilbereich vorhanden.
            </div>
          ) : (
            <div className={styles.taskList}>
              {visibleTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  latest={latestEventByShiftActivityId.get(task.id) ?? null}
                  history={getHistory(task.id)}
                  onSaveStatus={(status) => saveStatus(task, status)}
                />
              ))}
            </div>
          )}
        </section>

        <aside className={styles.notesShell}>
          <ShiftNotesPanel
            notes={shift.notes}
            noteText={noteText}
            noteKind={noteKind}
            onNoteTextChange={setNoteText}
            onNoteKindChange={setNoteKind}
            onSubmit={addShiftNote}
          />
        </aside>
      </div>
    </main>
  );
}
