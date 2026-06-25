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
  const [openParentPanels, setOpenParentPanels] = useState<Record<number, boolean>>({});

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

  const toggleParentPanel = (parentId: number): void => {
    setOpenParentPanels((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

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
  const subtitle = `${formatDate(board.shift.date)}`;

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

  const selectedParentIsOpen =
    board.selectedParent != null
      ? (openParentPanels[board.selectedParent.id] ?? true)
      : false;

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
          operator={board.shift.operator}
          line={board.shift.line}
        />

        <section className="card contextual-card">
          <button
            type="button"
            className="foldable-section-toggle"
            aria-expanded={isShiftStatusOpen}
            aria-controls="shift-status-panel"
            onClick={() => setIsShiftStatusOpen((value) => !value)}
          >
            <div className="foldable-section-toggle__text">
              <span className="foldable-section-toggle__title">Schichtstatus</span>
              <span className="foldable-section-toggle__subtitle">
                Fortschritt und Verteilung der Aufgaben anzeigen
              </span>
            </div>

            <span
              className={`foldable-section-toggle__icon ${
                isShiftStatusOpen ? "is-open" : ""
              }`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {isShiftStatusOpen ? (
            <div id="shift-status-panel" className="foldable-section-panel">
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

        <section className="card contextual-card">
          <h2 className="card-title">Bereiche</h2>

          <BoardModeTabs
            selectedMode={board.selectedMode}
            availableModes={board.availableModes}
            onSelect={board.setSelectedMode}
          />
        </section>

        <section className="dashboard-grid">
          <article className="card contextual-card">
            <h2 className="card-title">Elternpunkte</h2>
            <p className="card-subtitle">
              Wähle MO Start, MO Ende, ZP Handling oder Nächste MO.
            </p>

            <ParentGroupPicker
              parentGroups={board.parentGroups}
              selectedParentId={board.selectedParentId}
              latestEventByShiftActivityId={board.latestEventByShiftActivityId}
              onSelect={board.setSelectedParentId}
            />
          </article>

          <article className="card contextual-card">
            <div className="task-section-head">
              <div>
                <h2 className="card-title">
                  {board.selectedParent ? board.selectedParent.nameSnapshot : "Aufgaben"}
                </h2>
                <p className="card-subtitle">
                  {board.selectedParent
                    ? "Unteraufgaben dieses Elternpunkts."
                    : "Wähle links einen Elternpunkt aus."}
                </p>
              </div>

              {board.selectedParent ? (
                <button
                  type="button"
                  className="foldable-inline-toggle"
                  aria-expanded={selectedParentIsOpen}
                  aria-controls={`parent-panel-${board.selectedParent.id}`}
                  onClick={() => toggleParentPanel(board.selectedParent.id)}
                >
                  <span>{selectedParentIsOpen ? "Ausblenden" : "Einblenden"}</span>
                  <span
                    className={`foldable-inline-toggle__icon ${
                      selectedParentIsOpen ? "is-open" : ""
                    }`}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </button>
              ) : null}
            </div>

            {!board.selectedParent ? (
              <div className="card empty">Noch kein Elternpunkt ausgewählt.</div>
            ) : (
              <div
                id={`parent-panel-${board.selectedParent.id}`}
                className={selectedParentIsOpen ? "foldable-section-panel" : "is-hidden"}
              >
                {board.visibleTasks.length === 0 ? (
                  <div className="card empty">
                    Keine Unteraufgaben für diesen Elternpunkt definiert.
                  </div>
                ) : (
                  <div
                    className={`shift-list ${isMoParent ? "shift-list--subtasks" : ""}`}
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
