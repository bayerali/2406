import React from "react";
import type { BoardMode, Shift, ShiftActivity, TaskEvent } from "../types";

export const SHIFT_LABEL: Record<Shift["shiftType"], string> = {
  Frueh: "Frühschicht",
  Spaet: "Spätschicht",
  Nacht: "Nachtschicht",
};

export const BOARD_LABEL: Record<BoardMode, string> = {
  Primary: "Primär",
  Secondary: "Sekundär",
};

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatTimestamp(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(timestamp);
  }
}

export function statusLabel(status: TaskEvent["status"]): string {
  switch (status) {
    case "done":
      return "Erledigt";
    case "blocked":
      return "Blockiert";
    case "skipped":
      return "Übersprungen";
    default:
      return "Offen";
  }
}

export function normalizeBoardMode(name: string): BoardMode | null {
  const normalized = name.trim().toLowerCase();

  if (
    normalized === "primary" ||
    normalized === "primär" ||
    normalized === "primaer"
  ) {
    return "Primary";
  }

  if (
    normalized === "secondary" ||
    normalized === "sekundär" ||
    normalized === "sekundaer"
  ) {
    return "Secondary";
  }

  return null;
}

export function getBoardTheme(mode: BoardMode): React.CSSProperties {
  if (mode === "Secondary") {
    return {
      ["--context-accent" as string]: "#89D329",
      ["--context-accent-strong" as string]: "#5FAE1F",
      ["--context-accent-soft" as string]: "rgba(137, 211, 41, 0.14)",
      ["--context-accent-border" as string]: "rgba(137, 211, 41, 0.42)",
      ["--context-accent-shadow" as string]: "rgba(137, 211, 41, 0.22)",
    };
  }

  return {
    ["--context-accent" as string]: "#00BCFF",
    ["--context-accent-strong" as string]: "#007CC2",
    ["--context-accent-soft" as string]: "rgba(0, 188, 255, 0.14)",
    ["--context-accent-border" as string]: "rgba(0, 188, 255, 0.42)",
    ["--context-accent-shadow" as string]: "rgba(0, 188, 255, 0.22)",
  };
}

export function sortActivities(items: ShiftActivity[]): ShiftActivity[] {
  return [...items].sort((a, b) => a.sortOrderSnapshot - b.sortOrderSnapshot);
}

export function isAutoParentDone(note: string): boolean {
  return note === "__AUTO_PARENT_DONE__";
}
