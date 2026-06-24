export type BoardMode = "Primary" | "Secondary";

export type TaskEventStatus = "open" | "done" | "blocked" | "skipped";
export type NoteKind = "handover" | "warning" | "info";
export type TaskStatus = TaskEvent["status"];

export type ShiftType = "Frueh" | "Spaet" | "Nacht";

export type ShiftNote = {
  id: number;
  kind: NoteKind;
  text: string;
  createdAt: number;
};

export type TaskEvent = {
  id: number;
  shiftActivityId: number;
  status: TaskEventStatus;
  note: string;
  timestamp: number;
};

export type ShiftActivity = {
  id: number;
  activityIdSnapshot: number | null;
  nameSnapshot: string;
  parentIdSnapshot: number | null;
  sortOrderSnapshot: number;
};

export type Shift = {
  id: number;
  date: string;
  operator: string;
  line: string;
  shiftType: ShiftType;
  shiftActivities: ShiftActivity[];
  taskEvents: TaskEvent[];
  notes: ShiftNote[];
};

export type DB = {
  shifts: Shift[];
};
