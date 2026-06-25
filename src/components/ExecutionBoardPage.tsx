import React, { useMemo, useState } from "react";
import type { DB } from "../types";
import { NavBar } from "./NavBar";
import { BoardHeader } from "./execution-board/BoardHeader";
import { BoardModeTabs } from "./execution-board/BoardModeTabs";
import { ParentGroupPicker } from "./execution-board/ParentGroupPicker";
import { ShiftStatusCard } from "./execution-board/ShiftStatusCard";
import { TaskCard } from "./execution-board/TaskCard";
import { ShiftNotesPanel } from "./execution-board/ShiftNotesPanel";
import { useExecutionBoard } from "../hooks/useExecutionBoard";
import { SHIFT_LABEL, formatDate } from "../utils/executionBoard";
import styles from "./ExecutionBoardPage.module.css";

type ExecutionBoardPageProps = {
  db: DB;
  setDB: (db: DB) => void;
  shiftId: number;
  onBackToShifts: () => void;
  onDashboardClick: () => void;
};

export function ExecutionBoardPage({
  db,
  setDB,
  shiftId,
  onBackToShifts,
  onDashboardClick,
}: ExecutionBoardPageProps) {
  const board = useExecutionBoard({
    db,
    setDB,
    shiftId,
  });

  const [isShiftStatusOpen, setIsShiftStatusOpen] = useState(false);

  const taskDescriptions = useMemo<Record<string, string>>(
    () => ({
      abnahme:
        "Durch eine Linienabnahme wird sichergestellt, dass Arbeitsbereiche und Verpackungsanlagen sauber und frei von allen verwendeten Produkten, Materialien und auftragsbezogenen Dokumenten des zuvor produzierten MOs sind.",
    }),
    []
  );

  const getTaskDescription = (taskName: string): string => {
    const normalized = taskName.trim().toLowerCase();
    return taskDescriptions[normalized] ?? "";
  };

  if (!board.shift) {
    return (
      <>
        <NavBar active="board" onDashboardClick={onDashboardClick} />
        <main className={`main ${styles.page}`}>
          <article className={styles.emptyCard}>Schicht nicht gefunden.</article>
        </main>
      </>
    );
  }

  const shiftLabel = SHIFT_LABEL[board.shift.shiftType];
  const subtitle = `${formatDate(board.shift.date)}`;

  const isMoParent =
    board.selectedParent != null &&
    /^MO Start$|^MO Ende$/i.test(board.selectedParent.nameSnapshot);

  const boardModeClass =
    board.selectedMode === "Secondary" ? styles.boardSecondary : styles.boardPrimary;

  const headerModeClass =
    board.selectedMode === "Secondary"
      ? styles.boardHeaderSecondary
      : styles.boardHeaderPrimary;

  return (
    <>
      <NavBar active="board" onDashboardClick={onDashboardClick} />

      <main
        className={`main ${styles.page} ${styles.executionBoard} ${boardModeClass}`}
        style={board.boardThemeStyle}
      >
        <div className={`${styles.boardHeaderShell} ${headerModeClass}`}>
          <BoardHeader
            title="Ausführungsboard"
            subtitle={subtitle}
            onBack={onBackToShifts}
            modeClassName=""
            shiftType={board.shift.shiftType}
            shiftLabel={shiftLabel}
            operator={board.shift.operator}
            line={board.shift.line}
          />
        </div>

        <section className={styles.contextualCard}>
          <button
            type="button"
            className={styles.foldableSectionToggle}
            aria-expanded={isShiftStatusOpen}
            aria-controls="shift-status-panel"
            onClick={() => setIsShiftStatusOpen((value) => !value)}
          >
            <div className={styles.foldableSectionToggleText}>
              <span className={styles.foldableSectionToggleTitle}>Schichtstatus</span>
              <span className={styles.foldableSectionToggleSubtitle}>
                Fortschritt und Verteilung der Aufgaben anzeigen
              </span>
            </div>

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
            <div id="shift-status-panel" className={styles.foldableSectionPanel}>
              <ShiftStatusCard
                totalLeafTasks={board.totalLeafTasks}
                doneCount={board.doneCount}
                blockedCount={board.blockedCount}
                skippedCount={board.skippedCount}
                openCount={board.openCount}
                shiftProgressPercent={board.shiftProgressPercent}
              />
            </div>
          ) : null}
        </section>

        <section className={styles.contextualCard}>
          <h2 className={styles.cardTitle}>Bereiche</h2>

          <div className={styles.modeTabsWrap}>
            <BoardModeTabs
              selectedMode={board.selectedMode}
              availableModes={board.availableModes}
              onSelect={board.setSelectedMode}
            />
          </div>
        </section>

        <section className={styles.dashboardGrid}>
          <article className={styles.contextualCard}>
            <h2 className={styles.cardTitle}>Elternpunkte</h2>
            <p className={styles.cardSubtitle}>
              Wähle MO Start, MO Ende, ZP Handling oder Nächste MO.
            </p>

            <ParentGroupPicker
              parentGroups={board.parentGroups}
              selectedParentId={board.selectedParentId}
              latestEventByShiftActivityId={board.latestEventByShiftActivityId}
              onSelect={board.setSelectedParentId}
            />
          </article>

          <article className={styles.contextualCard}>
            {!board.selectedParent ? (
              <>
                <div className={styles.taskSectionHead}>
                  <div>
                    <h2 className={styles.cardTitle}>Aufgaben</h2>
                    <p className={styles.cardSubtitle}>
                      Wähle links einen Elternpunkt aus.
                    </p>
                  </div>
                </div>

                <div className={styles.emptyCard}>Noch kein Elternpunkt ausgewählt.</div>
              </>
            ) : (
              <>
                <div className={styles.taskSectionHead}>
                  <div>
                    <h2 className={styles.cardTitle}>
                      {board.selectedParent.nameSnapshot}
                    </h2>
                    <p className={styles.cardSubtitle}>
                      Unteraufgaben dieses Elternpunkts.
                    </p>
                  </div>
                </div>

                {board.visibleTasks.length === 0 ? (
                  <div className={styles.emptyCard}>
                    Keine Unteraufgaben für diesen Elternpunkt definiert.
                  </div>
                ) : (
                  <div
                    className={`${styles.taskList} ${
                      isMoParent ? styles.taskListCompact : ""
                    }`}
                  >
                    {board.visibleTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        latest={board.latestEventByShiftActivityId.get(task.id) ?? null}
                        history={board.getHistory(task.id)}
                        description={getTaskDescription(task.nameSnapshot)}
                        isCompact={isMoParent}
                        onSaveStatus={(status) => board.saveStatus(task, status)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </article>
        </section>

        <ShiftNotesPanel
          notes={board.shift.notes}
          noteText={board.noteText}
          noteKind={board.noteKind}
          onNoteTextChange={board.setNoteText}
          onNoteKindChange={board.setNoteKind}
          onSubmit={board.addShiftNote}
        />
      </main>
    </>
  );
}
