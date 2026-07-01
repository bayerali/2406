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
        <section className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>Schicht nicht gefunden</h2>
          <p className={styles.emptyText}>
            Die angeforderte Schicht konnte nicht geladen werden.
          </p>
        </section>
      </main>
    );
  }

  const shiftLabel = SHIFT_LABEL[shift.shiftType];

  return (
    <main className={styles.page} style={boardThemeStyle}>
      <BoardHeader
        title={selectedParent?.nameSnapshot ?? "Ausführungsboard"}
        subtitle={`${shift.operator} · ${shift.line}`}
        onBack={onBackToShifts}
        mode={selectedMode === "Secondary" ? "secondary" : "primary"}
        shiftType={shift.shiftType}
        operator={shift.operator}
        line={shift.line}
        shiftLabel={shiftLabel}
      />

      <section className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <ShiftStatusCard
            totalLeafTasks={totalLeafTasks}
            doneCount={doneCount}
            blockedCount={blockedCount}
            skippedCount={skippedCount}
            openCount={openCount}
            shiftProgressPercent={shiftProgressPercent}
          />
        </div>

        <div className={styles.parentSnapshot}>
          <div className={styles.parentSnapshotTop}>
            <div>
              <div className={styles.eyebrow}>Aktiver Bereich</div>
              <h2 className={styles.snapshotTitle}>
                {selectedParent?.nameSnapshot ?? "Kein Bereich gewählt"}
              </h2>
            </div>

            <div className={styles.snapshotPercent}>
              {selectedParentStats.percent}%
            </div>
          </div>

          <div className={styles.snapshotGrid}>
            <article className={styles.snapshotMetric}>
              <span className={styles.snapshotLabel}>Gesamt</span>
              <span className={styles.snapshotValue}>
                {selectedParentStats.total}
              </span>
            </article>

            <article className={styles.snapshotMetric}>
              <span className={styles.snapshotLabel}>Erledigt</span>
              <span className={styles.snapshotValue}>
                {selectedParentStats.done}
              </span>
            </article>

            <article className={styles.snapshotMetric}>
              <span className={styles.snapshotLabel}>Offen</span>
              <span className={styles.snapshotValue}>
                {selectedParentStats.open}
              </span>
            </article>

            <article className={styles.snapshotMetric}>
              <span className={styles.snapshotLabel}>Blockiert</span>
              <span className={styles.snapshotValue}>
                {selectedParentStats.blocked}
              </span>
            </article>

            <article className={styles.snapshotMetric}>
              <span className={styles.snapshotLabel}>Übersprungen</span>
              <span className={styles.snapshotValue}>
                {selectedParentStats.skipped}
              </span>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.workboard}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarHead}>
              <div>
                <div className={styles.eyebrow}>Steuerung</div>
                <h2 className={styles.sectionTitle}>Bereiche</h2>
                <p className={styles.sectionText}>
                  Wähle zuerst Modus und Teilbereich.
                </p>
              </div>

              <button
                type="button"
                className={styles.overviewButton}
                onClick={onDashboardClick}
              >
                Schichtübersicht
              </button>
            </div>

            <div
              className={styles.modeTabs}
              role="tablist"
              aria-label="Modus auswählen"
            >
              <button
                type="button"
                role="tab"
                aria-selected={selectedMode === "Primary"}
                className={`${styles.modeTab} ${
                  selectedMode === "Primary" ? styles.modeTabActive : ""
                }`}
                onClick={() => setSelectedMode("Primary")}
              >
                Primär
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={selectedMode === "Secondary"}
                className={`${styles.modeTab} ${
                  selectedMode === "Secondary" ? styles.modeTabActive : ""
                }`}
                onClick={() => setSelectedMode("Secondary")}
              >
                Sekundär
              </button>
            </div>

            {parentGroups.length === 0 ? (
              <div className={styles.emptyMini}>
                Keine Bereiche für diese Auswahl vorhanden.
              </div>
            ) : (
              <div className={styles.parentList}>
                {parentGroups.map((group) => {
                  const isActive = selectedParentId === group.id;
                  const latest =
                    latestEventByShiftActivityId.get(group.id) ?? null;

                  return (
                    <button
                      key={group.id}
                      type="button"
                      className={`${styles.parentItem} ${
                        isActive ? styles.parentItemActive : ""
                      }`}
                      onClick={() => setSelectedParentId(group.id)}
                    >
                      <span className={styles.parentItemTitle}>
                        {group.nameSnapshot}
                      </span>
                      <span className={styles.parentItemMeta}>
                        {latest ? "Status vorhanden" : "Noch keine Rückmeldung"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.notesCard}>
            <ShiftNotesPanel
              notes={shift.notes}
              noteText={noteText}
              noteKind={noteKind}
              onNoteTextChange={setNoteText}
              onNoteKindChange={setNoteKind}
              onSubmit={addShiftNote}
            />
          </div>
        </aside>

        <div className={styles.workspace}>
          <div className={styles.workspaceHeader}>
            <div>
              <div className={styles.eyebrow}>Ausführung</div>
              <h2 className={styles.workspaceTitle}>
                {selectedParent?.nameSnapshot ?? "Aufgaben"}
              </h2>
              <p className={styles.sectionText}>
                Aufgaben bearbeiten, Status setzen und Verlauf prüfen.
              </p>
            </div>

            <div className={styles.workspaceBadge}>
              {visibleTasks.length} Aufgaben
            </div>
          </div>

          {visibleTasks.length === 0 ? (
            <div className={styles.emptyWorkspace}>
              <h3 className={styles.emptyTitle}>Keine Aufgaben vorhanden</h3>
              <p className={styles.emptyText}>
                Für den gewählten Bereich sind aktuell keine Aufgaben hinterlegt.
              </p>
            </div>
          ) : (
            <div className={styles.taskGrid}>
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
        </div>
      </section>
    </main>
  );
}
