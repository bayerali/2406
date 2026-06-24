export type BoardMode = "Primary" | "Secondary";

export type ActivityColor =
  | "green"
  | "blue"
  | "orange"
  | "red"
  | "purple"
  | "teal";

export type CompletionStatus = "done" | "blocked" | "skipped";
export type TaskEventStatus = "open" | CompletionStatus;
export type ShiftNoteKind = "handover" | "warning" | "info";
export type NoteKind = ShiftNoteKind;
export type ShiftType = "Frueh" | "Spaet" | "Nacht";
export type Line = "SVP03" | "SVP05" | "SVP06" | "SVP09";

export type Activity = {
  id: number;
  name: string;
  color: ActivityColor;
  sortOrder: number;
  parentId: number | null;
  archived?: boolean;
};

export type ShiftNote = {
  id: number;
  kind: ShiftNoteKind;
  text: string;
  createdAt: number;
};

export type TaskEvent = {
  id: number;
  shiftActivityId: number;
  status: CompletionStatus;
  note: string;
  timestamp: number;
  imageData: string | null;
};

export type TaskStatus = TaskEvent["status"];

export type ShiftActivity = {
  id: number;
  activityId: number;
  nameSnapshot: string;
  colorSnapshot: ActivityColor;
  parentIdSnapshot: number | null;
  sortOrderSnapshot: number;
};

export type Shift = {
  id: number;
  date: string;
  operator: string;
  line: Line;
  shiftType: ShiftType;
  createdAt: number;
  shiftActivities: ShiftActivity[];
  taskEvents: TaskEvent[];
  notes: ShiftNote[];
};

export type DB = {
  version: 3;
  nextId: number;
  activities: Activity[];
  shifts: Shift[];
};
