import { useEffect, useMemo, useState } from "react";
import type {
  BoardMode,
  DB,
  NoteKind,
  Shift,
  ShiftActivity,
  TaskEvent,
  TaskStatus,
} from "../types";
import {
  addShiftNoteDB,
  addTaskEventDB,
  getLatestTaskEvent,
  getTaskEventsForActivity,
  removeAutoParentDoneEventDB,
} from "../dbHelpers";
import {
  getBoardTheme,
  isAutoParentDone,
  normalizeBoardMode,
  sortActivities,
} from "../utils/executionBoard";

type UseExecutionBoardArgs = {
  db: DB;
  setDB: (db: DB) => void;
  shiftId: number;
};

export type ParentStats = {
  total: number;
  done: number;
  blocked: number;
  skipped: number;
  open: number;
  percent: number;
};

export type UseExecutionBoardResult = {
  shift: Shift | null;
  selectedMode: BoardMode;
  setSelectedMode: React.Dispatch<React.SetStateAction<BoardMode>>;
  selectedParentId: number | null;
  setSelectedParentId: React.Dispatch<React.SetStateAction<number | null>>;
  selectedParent: ShiftActivity | null;
  availableModes: BoardMode[];
  parentGroups: ShiftActivity[];
  visibleTasks: ShiftActivity[];
  latestEventByShiftActivityId: Map<number, TaskEvent | null>;
  taskNoteDrafts: Record<number, string>;
  setTaskNoteDraft: (activityId: number, value: string) => void;
  noteText: string;
  setNoteText: React.Dispatch<React.SetStateAction<string>>;
  noteKind: NoteKind;
  setNoteKind: React.Dispatch<React.SetStateAction<NoteKind>>;
  totalLeafTasks: number;
  doneCount: number;
  blockedCount: number;
  skippedCount: number;
  openCount: number;
  shiftProgressPercent: number;
  selectedParentStats: ParentStats;
  boardThemeStyle: React.CSSProperties;
  saveStatus: (activity: ShiftActivity, status: TaskStatus) => void;
  getHistory: (activityId: number) => TaskEvent[];
  addShiftNote: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function useExecutionBoard({
  db,
  setDB,
  shiftId,
}: UseExecutionBoardArgs): UseExecutionBoardResult {
  const shift = useMemo(
    () => db.shifts.find((entry) => entry.id === shiftId) ?? null,
    [db.shifts, shiftId]
  );

  const [selectedMode, setSelectedMode] = useState<BoardMode>("Primary");
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [taskNoteDrafts, setTaskNoteDrafts] = useState<Record<number, string>>(
    {}
  );
  const [noteText, setNoteText] = useState("");
  const [noteKind, setNoteKind] = useState<NoteKind>("handover");

  const shiftActivities = shift?.shiftActivities ?? [];
  const shiftTaskEvents = shift?.taskEvents ?? [];

  const topLevelParents = useMemo(() => {
    return sortActivities(
      shiftActivities.filter((activity) => activity.parentIdSnapshot === null)
    );
  }, [shiftActivities]);

  const availableModes = useMemo(() => {
    return topLevelParents
      .map((parent) => normalizeBoardMode(parent.nameSnapshot))
      .filter((value): value is BoardMode => value !== null);
  }, [topLevelParents]);

  useEffect(() => {
    if (!availableModes.includes(selectedMode) && availableModes[0]) {
      setSelectedMode(availableModes[0]);
    }
  }, [availableModes, selectedMode]);

  const selectedRoot =
    topLevelParents.find(
      (parent) => normalizeBoardMode(parent.nameSnapshot) === selectedMode
    ) ?? null;

  const parentGroups = useMemo(() => {
    if (!selectedRoot) return [];

    const realChildren = shiftActivities.filter(
      (activity) => activity.parentIdSnapshot === selectedRoot.id
    );

    const syntheticParents: ShiftActivity[] = [
      {
        id: -101,
        activityId: -101,
        nameSnapshot: "ZP Handling",
        colorSnapshot: "blue",
        parentIdSnapshot: selectedRoot.id,
        sortOrderSnapshot: 9001,
      },
      {
        id: -102,
        activityId: -102,
        nameSnapshot: "Nächste MO",
        colorSnapshot: "blue",
        parentIdSnapshot: selectedRoot.id,
        sortOrderSnapshot: 9002,
      },
    ];

    const existingNames = new Set(
      realChildren.map((activity) => activity.nameSnapshot.trim().toLowerCase())
    );

    const missingSyntheticParents = syntheticParents.filter(
      (activity) => !existingNames.has(activity.nameSnapshot.trim().toLowerCase())
    );

    return sortActivities([...realChildren, ...missingSyntheticParents]);
  }, [shiftActivities, selectedRoot]);

  useEffect(() => {
    if (parentGroups.length === 0) {
      setSelectedParentId(null);
      return;
    }

    const exists = parentGroups.some((parent) => parent.id === selectedParentId);
    if (!exists) {
      setSelectedParentId(parentGroups[0].id);
    }
  }, [parentGroups, selectedParentId]);

  const selectedParent =
    parentGroups.find((parent) => parent.id === selectedParentId) ?? null;

  const visibleTasks = useMemo(() => {
    if (!selectedParent) return [];

    return sortActivities(
      shiftActivities.filter(
        (activity) => activity.parentIdSnapshot === selectedParent.id
      )
    );
  }, [shiftActivities, selectedParent]);

  const latestEventByShiftActivityId = useMemo(() => {
    if (!shift) return new Map<number, TaskEvent | null>();

    return new Map(
      shiftActivities.map((activity) => [
        activity.id,
        getLatestTaskEvent(shift, activity.id),
      ])
    );
  }, [shift, shiftActivities]);

  useEffect(() => {
    setTaskNoteDrafts((prev) => {
      const next = { ...prev };

      for (const task of visibleTasks) {
        const latest = latestEventByShiftActivityId.get(task.id);
        next[task.id] =
          prev[task.id] ??
          (latest && !isAutoParentDone(latest.note) ? latest.note : "");
      }

      return next;
    });
  }, [visibleTasks, latestEventByShiftActivityId]);

  useEffect(() => {
    if (!shift || !selectedParent) return;
    if (!/^MO Start$|^MO Ende$/i.test(selectedParent.nameSnapshot)) return;
    if (visibleTasks.length === 0) return;

    const allDone = visibleTasks.every(
      (task) => latestEventByShiftActivityId.get(task.id)?.status === "done"
    );

    const latestParentEvent = getLatestTaskEvent(shift, selectedParent.id);

    if (allDone) {
      const alreadyAutoDone =
        latestParentEvent?.status === "done" &&
        isAutoParentDone(latestParentEvent.note);

      if (!alreadyAutoDone) {
        setDB(
          addTaskEventDB(
            db,
            shift.id,
            selectedParent.id,
            "done",
            "__AUTO_PARENT_DONE__"
          )
        );
      }

      return;
    }

    const hasAutoDone = shiftTaskEvents.some(
      (event) =>
        event.shiftActivityId === selectedParent.id &&
        event.status === "done" &&
        isAutoParentDone(event.note)
    );

    if (hasAutoDone) {
      setDB(removeAutoParentDoneEventDB(db, shift.id, selectedParent.id));
    }
  }, [
    db,
    setDB,
    shift,
    selectedParent,
    visibleTasks,
    latestEventByShiftActivityId,
    shiftTaskEvents,
  ]);

  const parentIds = useMemo(() => {
    return new Set(
      shiftActivities
        .map((activity) => activity.parentIdSnapshot)
        .filter((value): value is number => value !== null)
    );
  }, [shiftActivities]);

  const totalLeafTasks = useMemo(() => {
    return shiftActivities.filter((activity) => !parentIds.has(activity.id))
      .length;
  }, [shiftActivities, parentIds]);

  const latestEvents = useMemo(() => {
    if (!shift) return [];

    return shiftActivities
      .map((activity) => getLatestTaskEvent(shift, activity.id))
      .filter((event): event is TaskEvent => event !== null);
  }, [shift, shiftActivities]);

  const doneCount = latestEvents.filter((event) => event.status === "done").length;
  const blockedCount = latestEvents.filter(
    (event) => event.status === "blocked"
  ).length;
  const skippedCount = latestEvents.filter(
    (event) => event.status === "skipped"
  ).length;
  const openCount = Math.max(
    totalLeafTasks - doneCount - blockedCount - skippedCount,
    0
  );

  const shiftProgressPercent =
    totalLeafTasks > 0 ? Math.round((doneCount / totalLeafTasks) * 100) : 0;

  const selectedParentStats = useMemo<ParentStats>(() => {
    const total = visibleTasks.length;
    const done = visibleTasks.filter(
      (task) => latestEventByShiftActivityId.get(task.id)?.status === "done"
    ).length;
    const blocked = visibleTasks.filter(
      (task) => latestEventByShiftActivityId.get(task.id)?.status === "blocked"
    ).length;
    const skipped = visibleTasks.filter(
      (task) => latestEventByShiftActivityId.get(task.id)?.status === "skipped"
    ).length;
    const open = Math.max(total - done - blocked - skipped, 0);
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, done, blocked, skipped, open, percent };
  }, [visibleTasks, latestEventByShiftActivityId]);

  const boardThemeStyle = useMemo<React.CSSProperties>(() => {
    return getBoardTheme(selectedMode);
  }, [selectedMode]);

  const saveStatus = (activity: ShiftActivity, status: TaskStatus): void => {
    if (!shift) return;
    const note = (taskNoteDrafts[activity.id] ?? "").trim();
    setDB(addTaskEventDB(db, shift.id, activity.id, status, note));
  };

  const setTaskNoteDraft = (activityId: number, value: string): void => {
    setTaskNoteDrafts((prev) => ({
      ...prev,
      [activityId]: value,
    }));
  };

  const getHistory = (activityId: number): TaskEvent[] => {
    if (!shift) return [];
    return getTaskEventsForActivity(shift, activityId);
  };

  const addShiftNote = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!shift) return;

    const next = addShiftNoteDB(db, shift.id, noteText, noteKind);
    if (next !== db) {
      setDB(next);
      setNoteText("");
    }
  };

  return {
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
    taskNoteDrafts,
    setTaskNoteDraft,
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
  };
}
