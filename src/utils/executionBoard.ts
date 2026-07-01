import type { CSSProperties } from "react";
import type {
  BoardMode,
  Shift,
  ShiftActivity,
  TaskStatus,
} from "../types";

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

export function statusLabel(status: TaskStatus): string {
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

export function getBoardTheme(
  mode: BoardMode,
  shiftType: Shift["shiftType"]
): CSSProperties {
  const shiftPalette =
    shiftType === "Frueh"
      ? {
          shiftSolid: "#BCE784",
          shiftSurface: "rgba(188, 231, 132, 0.18)",
          shiftSurfaceStrong: "rgba(188, 231, 132, 0.32)",
          shiftBorder: "rgba(188, 231, 132, 0.44)",
          shiftBorderStrong: "rgba(188, 231, 132, 0.58)",
          shiftGlow: "rgba(188, 231, 132, 0.22)",
          shiftText: "#F5FBEA",
        }
      : shiftType === "Spaet"
      ? {
          shiftSolid: "#FFBA08",
          shiftSurface: "rgba(255, 186, 8, 0.18)",
          shiftSurfaceStrong: "rgba(255, 186, 8, 0.34)",
          shiftBorder: "rgba(255, 186, 8, 0.44)",
          shiftBorderStrong: "rgba(255, 186, 8, 0.6)",
          shiftGlow: "rgba(255, 186, 8, 0.24)",
          shiftText: "#FFF4D6",
        }
      : {
          shiftSolid: "#DC2F02",
          shiftSurface: "rgba(220, 47, 2, 0.18)",
          shiftSurfaceStrong: "rgba(220, 47, 2, 0.34)",
          shiftBorder: "rgba(220, 47, 2, 0.44)",
          shiftBorderStrong: "rgba(220, 47, 2, 0.6)",
          shiftGlow: "rgba(220, 47, 2, 0.24)",
          shiftText: "#FFF0EA",
        };

  const modeAccent =
    mode === "Secondary"
      ? {
          accent: "#89D329",
          accentStrong: "#6FC61B",
          accentSoft: "rgba(137, 211, 41, 0.14)",
          accentBorder: "rgba(137, 211, 41, 0.42)",
          accentShadow: "rgba(137, 211, 41, 0.22)",
        }
      : {
          accent: "#00BCFF",
          accentStrong: "#00A7E1",
          accentSoft: "rgba(0, 188, 255, 0.14)",
          accentBorder: "rgba(0, 188, 255, 0.42)",
          accentShadow: "rgba(0, 188, 255, 0.22)",
        };

  return {
    ["--context-accent" as string]: modeAccent.accent,
    ["--context-accent-strong" as string]: modeAccent.accentStrong,
    ["--context-accent-soft" as string]: modeAccent.accentSoft,
    ["--context-accent-border" as string]: modeAccent.accentBorder,
    ["--context-accent-shadow" as string]: modeAccent.accentShadow,

    ["--shift-solid" as string]: shiftPalette.shiftSolid,
    ["--shift-surface" as string]: shiftPalette.shiftSurface,
    ["--shift-surface-strong" as string]: shiftPalette.shiftSurfaceStrong,
    ["--shift-border" as string]: shiftPalette.shiftBorder,
    ["--shift-border-strong" as string]: shiftPalette.shiftBorderStrong,
    ["--shift-glow" as string]: shiftPalette.shiftGlow,
    ["--shift-text" as string]: shiftPalette.shiftText,

    ["--board-shell-bg" as string]:
      "linear-gradient(180deg, rgba(16, 56, 79, 0.96), rgba(6, 32, 48, 0.98))",
    ["--board-shell-top-glow" as string]: shiftPalette.shiftGlow,
    ["--board-panel-bg" as string]:
      "linear-gradient(180deg, rgba(16, 56, 79, 0.95), rgba(6, 32, 48, 0.98))",
    ["--board-panel-bg-strong" as string]:
      "linear-gradient(180deg, rgba(18, 62, 86, 0.96), rgba(7, 34, 50, 0.99))",
    ["--board-panel-border" as string]: shiftPalette.shiftBorder,
    ["--board-panel-border-strong" as string]: shiftPalette.shiftBorderStrong,
    ["--board-panel-highlight" as string]: shiftPalette.shiftSurfaceStrong,
    ["--board-muted-text" as string]: "#b7c7d5",
    ["--board-soft-text" as string]: "#dce7ef",
    ["--board-main-text" as string]: "#f8fafc",

    ["--btn-done-bg" as string]: "linear-gradient(180deg, #89d329, #6fc61b)",
    ["--btn-done-border" as string]: "rgba(137, 211, 41, 0.46)",
    ["--btn-done-shadow" as string]: "rgba(137, 211, 41, 0.24)",

    ["--btn-blocked-bg" as string]: "rgba(255, 186, 8, 0.16)",
    ["--btn-blocked-bg-hover" as string]: "rgba(255, 186, 8, 0.26)",
    ["--btn-blocked-border" as string]: "rgba(255, 186, 8, 0.42)",
    ["--btn-blocked-text" as string]: "#fff3d3",

    ["--btn-skipped-bg" as string]: "rgba(220, 47, 2, 0.14)",
    ["--btn-skipped-bg-hover" as string]: "rgba(220, 47, 2, 0.24)",
    ["--btn-skipped-border" as string]: "rgba(220, 47, 2, 0.4)",
    ["--btn-skipped-text" as string]: "#ffe6de",
  };
}

export function sortActivities(items: ShiftActivity[]): ShiftActivity[] {
  return [...items].sort((a, b) => a.sortOrderSnapshot - b.sortOrderSnapshot);
}

export function isAutoParentDone(note: string): boolean {
  return note === "__AUTO_PARENT_DONE__";
}
