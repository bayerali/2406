import React from "react";
import type { DB } from "../types";
import { NavBar } from "./NavBar";
import { BoardHeader } from "./execution-board/BoardHeader";
import { BoardModeTabs } from "./execution-board/BoardModeTabs";
import { ParentGroupPicker } from "./execution-board/ParentGroupPicker";
import { TaskProgressCard } from "./execution-board/TaskProgressCard";
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

  const subtitle = `${SHIFT_LABEL[board.shift.shiftType]} · ${formatDate(
    board.shift.date
  )} · CWID ${board.shift.operator} · ${board.shift.line}`;

  const isMoParent =
    board.selectedParent != null &&
    /^MO Start$|^MO Ende$/i.test(board.selectedParent.nameSnapshot);

  return (
    <>
      <NavBar active="board" onDashboardClick={onDashboardClick} />

      <main className="main dashboard-layout" style={board.boardThemeStyle}>
        <BoardHeader
          title="Ausführungsboard"
          subtitle={subtitle}
          onBack={onBackToShifts}
        />

        <section className="grid grid-3">
          <article className="kpi-card contextual-card">
            <div className="kpi-label">Gesamtaufgaben</div>
            <div className="kpi-value">{board.totalLeafTasks}</div>
          </article>

          <article className="kpi-card contextual-card">
            <div className="kpi-label">Erledigt</div>
            <div className="kpi-value">{board.doneCount}</div>
          </article>

          <article className="kpi-card contextual-card">
            <div className="kpi-label">Offen / Blockiert / Übersprungen</div>
            <div className="kpi-value">
              {board.openCount} / {board.blockedCount} / {board.skippedCount}
            </div>
          </article>
        </section>

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

            {board.selectedParent ? (
              <TaskProgressCard {...board.selectedParentStats} />
            ) : null}

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
                    noteDraft={board.taskNoteDrafts[task.id] ?? ""}
                    isCompact={isMoParent}
                    onNoteChange={(value) => board.setTaskNoteDraft(task.id, value)}
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
