import React from "react";
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

  if (!board.shift) {
    return (
      <>
        <NavBar active="board" onDashboardClick={onDashboardClick} />
        <main className="main dashboard-layout">
          <article className="card empty">Schicht nicht gefunden.</article>
        </main>
      </>
    );
  }

  const shiftLabel = SHIFT_LABEL[board.shift.shiftType];
  const subtitle = `${formatDate(board.shift.date)} · ${board.shift.line}`;

  const isMoParent =
    board.selectedParent != null &&
    /^MO Start$|^MO Ende$/i.test(board.selectedParent.nameSnapshot);

  const boardModeClass =
    board.selectedMode === "Secondary"
      ? "execution-board execution-board--secondary"
      : "execution-board execution-board--primary";

  const headerModeClass =
    board.selectedMode === "Secondary"
      ? "board-header--secondary"
      : "board-header--primary";

  return (
    <>
      <NavBar active="board" onDashboardClick={onDashboardClick} />

      <main
        className={`main dashboard-layout ${boardModeClass}`}
        style={board.boardThemeStyle}
      >
        <BoardHeader
          title="Ausführungsboard"
          subtitle={subtitle}
          onBack={onBackToShifts}
          modeClassName={headerModeClass}
          shiftType={board.shift.shiftType}
          shiftLabel={shiftLabel}
          cwid={board.shift.operator}
        />

        <ShiftStatusCard
          totalLeafTasks={board.totalLeafTasks}
          doneCount={board.doneCount}
          blockedCount={board.blockedCount}
          skippedCount={board.skippedCount}
          openCount={board.openCount}
          shiftProgressPercent={board.shiftProgressPercent}
        />

        <section className="dashboard-grid">
          <article className="card contextual-card">
            <h2 className="card-title">Bereiche</h2>
            <p className="card-subtitle">Wähle Primär oder Sekundär.</p>

            <BoardModeTabs
              selectedMode={board.selectedMode}
              availableModes={board.availableModes}
              onSelect={board.setSelectedMode}
            />

            <div style={{ marginTop: 18 }}>
              <h3 className="card-title" style={{ fontSize: 16 }}>
                Elternpunkte
              </h3>
              <p className="card-subtitle">Wähle MO Start oder MO Ende.</p>

              <ParentGroupPicker
                parentGroups={board.parentGroups}
                selectedParentId={board.selectedParentId}
                latestEventByShiftActivityId={board.latestEventByShiftActivityId}
                onSelect={board.setSelectedParentId}
              />
            </div>
          </article>

          <article className="card contextual-card">
            <h2 className="card-title">
              {board.selectedParent ? board.selectedParent.nameSnapshot : "Aufgaben"}
            </h2>
            <p className="card-subtitle">
              {board.selectedParent
                ? "Unteraufgaben dieses Elternpunkts."
                : "Wähle links einen Elternpunkt aus."}
            </p>

            {!board.selectedParent ? (
              <div className="card empty">Noch kein Elternpunkt ausgewählt.</div>
            ) : board.visibleTasks.length === 0 ? (
              <div className="card empty">
                Keine Unteraufgaben für diesen Elternpunkt definiert.
              </div>
            ) : (
              <div className={`shift-list ${isMoParent ? "shift-list--subtasks" : ""}`}>
                {board.visibleTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    latest={board.latestEventByShiftActivityId.get(task.id) ?? null}
                    history={board.getHistory(task.id)}
                    isCompact={isMoParent}
                    onSaveStatus={(status) => board.saveStatus(task, status)}
                  />
                ))}
              </div>
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
