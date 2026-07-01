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
    boardTheme,
    boardSubtitle,
    submitNote,
    addChildTask,
    updateTaskStatus,
    removeAutoDoneFromParent,
  } = useExecutionBoard({
    db,
    setDB,
    shiftId,
  });

  if (!shift) {
    return null;
  }

  const activeParentGroup =
    parentGroups.find((group) => group.parent.id === selectedParentId) ?? null;

  return (
    <main className={`main ${styles.page}`} style={boardTheme}>
      <BoardHeader
        title="Ausführungsboard"
        subtitle={boardSubtitle}
        onBack={onBackToShifts}
        mode="primary"
        shiftType={shift.shiftType}
        operator={shift.operator}
        line={shift.line}
        shiftLabel={SHIFT_LABEL[shift.shiftType]}
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

        <aside className={styles.parentSnapshot}>
          <div className={styles.parentSnapshotTop}>
            <div>
              <div className={styles.eyebrow}>Aktiver Bereich</div>
              <h2 className={styles.snapshotTitle}>
                {selectedParent?.nameSnapshot ?? "Kein Bereich gewählt"}
              </h2>
            </div>

            <div className={styles.snapshotPercent}>{shiftProgressPercent}%</div>
          </div>

          <div className={styles.snapshotGrid}>
            <article className={styles.snapshotMetric}>
              <div className={styles.snapshotLabel}>Erledigt</div>
              <div className={styles.snapshotValue}>{doneCount}</div>
            </article>

            <article className={styles.snapshotMetric}>
              <div className={styles.snapshotLabel}>Offen</div>
              <div className={styles.snapshotValue}>{openCount}</div>
            </article>

            <article className={styles.snapshotMetric}>
              <div className={styles.snapshotLabel}>Blockiert</div>
              <div className={styles.snapshotValue}>{blockedCount}</div>
            </article>

            <article className={styles.snapshotMetric}>
              <div className={styles.snapshotLabel}>Übersprungen</div>
              <div className={styles.snapshotValue}>{skippedCount}</div>
            </article>

            <article className={styles.snapshotMetric}>
              <div className={styles.snapshotLabel}>Gesamt</div>
              <div className={styles.snapshotValue}>{totalLeafTasks}</div>
            </article>
          </div>
        </aside>
      </section>

      <section className={styles.workboard}>
        <aside className={styles.sidebar}>
          <section className={styles.sidebarCard}>
            <div className={styles.sidebarHead}>
              <div>
                <div className={styles.eyebrow}>Board-Modus</div>
                <h2 className={styles.sectionTitle}>Primär / Sekundär</h2>
                <p className={styles.sectionText}>
                  Wähle den Modus und springe danach direkt in den passenden Bereich.
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
              <button
                type="button"
                className={`${styles.modeTab} ${
                  selectedMode === "Primary" ? styles.modeTabActive : ""
                }`}
                onClick={() => setSelectedMode("Primary")}
              >
                Primär
              </button>

              <button
                type="button"
                className={`${styles.modeTab} ${
                  selectedMode === "Secondary" ? styles.modeTabActive : ""
                }`}
                onClick={() => setSelectedMode("Secondary")}
              >
                Sekundär
              </button>
            </div>
          </section>

          <section className={styles.sidebarCard}>
            <div className={styles.sidebarHead}>
              <div>
                <div className={styles.eyebrow}>Bereiche</div>
                <h2 className={styles.sectionTitle}>Top Parent</h2>
                <p className={styles.sectionText}>
                  Wähle den gewünschten Bereich, um die Aufgaben rechts zu filtern.
                </p>
              </div>
            </div>

            {parentGroups.length === 0 ? (
              <div className={styles.emptyMini}>
                Keine Bereiche für diesen Modus vorhanden.
              </div>
            ) : (
              <div className={styles.parentList}>
                {parentGroups.map((group) => {
                  const isActive = group.parent.id === selectedParentId;

                  return (
                    <button
                      key={group.parent.id}
                      type="button"
                      className={`${styles.parentItem} ${
                        isActive ? styles.parentItemActive : ""
                      }`}
                      onClick={() => setSelectedParentId(group.parent.id)}
                    >
                      <span className={styles.parentItemTitle}>
                        {group.parent.nameSnapshot}
                      </span>
                      <span className={styles.parentItemMeta}>
                        {group.children.length} Aufgaben
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <div className={styles.notesCard}>
            <ShiftNotesPanel
              notes={shift.notes}
              noteText={noteText}
              noteKind={noteKind}
              onNoteTextChange={setNoteText}
              onNoteKindChange={setNoteKind}
              onSubmit={submitNote}
            />
          </div>
        </aside>

        <section className={styles.workspace}>
          <div className={styles.workspaceHeader}>
            <div>
              <div className={styles.eyebrow}>Aufgabenbereich</div>
              <h2 className={styles.workspaceTitle}>
                {selectedParent?.nameSnapshot ?? "Top Parent"}
              </h2>
              <p className={styles.sectionText}>
                Bearbeite die Aufgaben direkt im Board und öffne bei Bedarf den Verlauf.
              </p>
            </div>

            <div className={styles.workspaceBadge}>
              {visibleTasks.length} Aufgaben
            </div>
          </div>

          {!selectedParent ? (
            <div className={styles.emptyWorkspace}>
              <h3 className={styles.emptyTitle}>Kein Bereich gewählt</h3>
              <p className={styles.emptyText}>
                Wähle links einen Bereich aus, um die passenden Aufgaben anzuzeigen.
              </p>
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className={styles.emptyWorkspace}>
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
                  latestEvent={latestEventByShiftActivityId[task.id] ?? null}
                  onStatusChange={(status) => updateTaskStatus(task.id, status)}
                  onAddChildTask={(label) => addChildTask(task, label)}
                  onRemoveAutoDone={() => removeAutoDoneFromParent(task.id)}
                />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
