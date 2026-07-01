import React from "react";
import type { DB, ShiftActivity, TaskStatus } from "../types";
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

function formatBoardSubtitle(
  shiftType: "Frueh" | "Spaet" | "Nacht",
  line: string,
  operator: string
): string {
  return `${SHIFT_LABEL[shiftType]} · ${line} · ${operator}`;
}

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
    availableModes,
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
    return null;
  }

  const boardSubtitle = formatBoardSubtitle(
    shift.shiftType,
    shift.line,
    shift.operator
  );

  return (
    <main className={`main ${styles.page}`} style={boardThemeStyle}>
      <BoardHeader
        title="Ausführungsboard"
        subtitle={boardSubtitle}
        onBack={onBackToShifts}
        modeClassName={
          selectedMode === "Primary" ? styles.headerPrimary : styles.headerSecondary
        }
        shiftType={shift.shiftType}
        operator={shift.operator}
        line={shift.line}
        shiftLabel={SHIFT_LABEL[shift.shiftType]}
      />

      <section className={styles.summaryRow}>
        <div className={styles.summaryMain}>
          <ShiftStatusCard
            totalLeafTasks={totalLeafTasks}
            doneCount={doneCount}
            blockedCount={blockedCount}
            skippedCount={skippedCount}
            openCount={openCount}
            shiftProgressPercent={shiftProgressPercent}
          />
        </div>

        <aside className={styles.summarySide}>
          <div className={styles.contextCard}>
            <div className={styles.contextTop}>
              <div>
                <div className={styles.eyebrow}>Aktiver Bereich</div>
                <h2 className={styles.contextTitle}>
                  {selectedParent?.nameSnapshot ?? "Kein Bereich gewählt"}
                </h2>
              </div>

              <div className={styles.contextPercent}>
                {selectedParentStats.percent}%
              </div>
            </div>

            <div className={styles.contextGrid}>
              <article className={styles.contextMetric}>
                <div className={styles.contextLabel}>Gesamt</div>
                <div className={styles.contextValue}>{selectedParentStats.total}</div>
              </article>

              <article className={styles.contextMetric}>
                <div className={styles.contextLabel}>Erledigt</div>
                <div className={styles.contextValue}>{selectedParentStats.done}</div>
              </article>

              <article className={styles.contextMetric}>
                <div className={styles.contextLabel}>Offen</div>
                <div className={styles.contextValue}>{selectedParentStats.open}</div>
              </article>

              <article className={styles.contextMetric}>
                <div className={styles.contextLabel}>Blockiert</div>
                <div className={styles.contextValue}>{selectedParentStats.blocked}</div>
              </article>

              <article className={styles.contextMetric}>
                <div className={styles.contextLabel}>Übersprungen</div>
                <div className={styles.contextValue}>{selectedParentStats.skipped}</div>
              </article>
            </div>
          </div>
        </aside>
      </section>

      <section className={styles.boardGrid}>
        <aside className={styles.sidebar}>
          <section className={styles.sidebarCard}>
            <div className={styles.sidebarHead}>
              <div>
                <div className={styles.eyebrow}>Board-Modus</div>
                <h2 className={styles.sectionTitle}>Primär / Sekundär</h2>
                <p className={styles.sectionText}>
                  Wähle den passenden Modus für die aktuelle Bearbeitung.
                </p>
              </div>

              <button
                type="button"
                className={styles.overviewButton}
                onClick={onDashboardClick}
              >
                Übersicht
              </button>
            </div>

            <div className={styles.modeTabs}>
              {availableModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`${styles.modeTab} ${
                    selectedMode === mode ? styles.modeTabActive : ""
                  }`}
                  onClick={() => setSelectedMode(mode)}
                >
                  {mode === "Primary" ? "Primär" : "Sekundär"}
                </button>
              ))}
            </div>
          </section>

          <section className={styles.sidebarCard}>
            <div className={styles.sidebarHead}>
              <div>
                <div className={styles.eyebrow}>Bereiche</div>
                <h2 className={styles.sectionTitle}>Top Parent</h2>
                <p className={styles.sectionText}>
                  Wähle links einen Bereich, um die Aufgaben rechts zu filtern.
                </p>
              </div>
            </div>

            {parentGroups.length === 0 ? (
              <div className={styles.emptyMini}>Keine Elternpunkte vorhanden.</div>
            ) : (
              <div className={styles.parentList}>
                {parentGroups.map((parent: ShiftActivity) => {
                  const latest = latestEventByShiftActivityId.get(parent.id) ?? null;
                  const isActive = selectedParentId === parent.id;

                  return (
                    <button
                      key={parent.id}
                      type="button"
                      className={`${styles.parentItem} ${
                        isActive ? styles.parentItemActive : ""
                      }`}
                      onClick={() => setSelectedParentId(parent.id)}
                    >
                      <span className={styles.parentItemTitle}>
                        {parent.nameSnapshot}
                      </span>
                      <span className={styles.parentItemMeta}>
                        {latest ? "Mit Rückmeldung" : "Noch keine Rückmeldung"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <div className={styles.notesWrap}>
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

        <section className={styles.workspace}>
          <div className={styles.workspaceHead}>
            <div>
              <div className={styles.eyebrow}>Aufgabenbereich</div>
              <h2 className={styles.workspaceTitle}>
                {selectedParent?.nameSnapshot ?? "Top Parent"}
              </h2>
              <p className={styles.sectionText}>
                Bearbeite Aufgaben direkt im Board und prüfe bei Bedarf den Verlauf.
              </p>
            </div>

            <div className={styles.workspaceBadge}>{visibleTasks.length} Aufgaben</div>
          </div>

          {!selectedParent ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>Kein Bereich gewählt</h3>
              <p className={styles.emptyText}>
                Wähle links einen Bereich aus, um Aufgaben anzuzeigen.
              </p>
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className={styles.emptyState}>
              <h3 className={styles.emptyTitle}>Keine Aufgaben vorhanden</h3>
              <p className={styles.emptyText}>
                Für diesen Bereich sind aktuell keine Aufgaben sichtbar.
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
                  isCompact
                  onSaveStatus={(status: TaskStatus) => saveStatus(task, status)}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
