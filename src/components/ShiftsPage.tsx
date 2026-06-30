import React, { useMemo, useState } from "react";
import type { DB, Line, Shift, ShiftActivity, ShiftType } from "../types";
import { NavBar } from "./NavBar";
import styles from "./ShiftsPage.module.css";

const SHIFT_LABEL: Record<ShiftType, string> = {
  Frueh: "Frühschicht",
  Spaet: "Spätschicht",
  Nacht: "Nachtschicht",
};

const LINE_OPTIONS: Line[] = ["SVP03", "SVP05", "SVP06", "SVP09"];

function formatDate(iso: string): string {
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

function inferShiftTypeFromTime(date = new Date()): ShiftType {
  const hour = date.getHours();
  if (hour >= 6 && hour < 14) return "Frueh";
  if (hour >= 14 && hour < 22) return "Spaet";
  return "Nacht";
}

export interface ShiftsPageProps {
  db: DB;
  setDB: (db: DB) => void;
  onOpenShiftBoard: (shiftId: number) => void;
}

function BayerLogo() {
  return (
    <div className={styles.brandMark} aria-label="Bayer">
      <svg
        viewBox="0 0 120 120"
        className={styles.brandMarkSvg}
        role="img"
        aria-label="Bayer Logo"
      >
        <defs>
          <linearGradient id="bayerRingLeft" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#89D329" />
            <stop offset="100%" stopColor="#89D329" />
          </linearGradient>
          <linearGradient id="bayerRingRight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00BCFF" />
            <stop offset="100%" stopColor="#00BCFF" />
          </linearGradient>
        </defs>

        <path
          d="M60 10a50 50 0 0 0 0 100"
          fill="none"
          stroke="url(#bayerRingLeft)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M60 10a50 50 0 0 1 0 100"
          fill="none"
          stroke="url(#bayerRingRight)"
          strokeWidth="7"
          strokeLinecap="round"
        />

        <line
          x1="60"
          y1="22"
          x2="60"
          y2="98"
          stroke="#10384F"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <line
          x1="22"
          y1="60"
          x2="98"
          y2="60"
          stroke="#10384F"
          strokeWidth="6"
          strokeLinecap="round"
        />

        <text x="60" y="30" textAnchor="middle" className={styles.brandMarkText}>
          B
        </text>
        <text x="60" y="48" textAnchor="middle" className={styles.brandMarkText}>
          A
        </text>
        <text x="60" y="92" textAnchor="middle" className={styles.brandMarkText}>
          E
        </text>
        <text x="60" y="110" textAnchor="middle" className={styles.brandMarkText}>
          R
        </text>

        <text x="33" y="67" textAnchor="middle" className={styles.brandMarkTextWide}>
          B
        </text>
        <text x="48" y="67" textAnchor="middle" className={styles.brandMarkTextWide}>
          A
        </text>
        <text x="60" y="67" textAnchor="middle" className={styles.brandMarkTextWide}>
          Y
        </text>
        <text x="74" y="67" textAnchor="middle" className={styles.brandMarkTextWide}>
          E
        </text>
        <text x="90" y="67" textAnchor="middle" className={styles.brandMarkTextWide}>
          R
        </text>
      </svg>
    </div>
  );
}

export function ShiftsPage({
  db,
  setDB,
  onOpenShiftBoard,
}: ShiftsPageProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [shiftType, setShiftType] = useState<ShiftType>(() =>
    inferShiftTypeFromTime()
  );
  const [line, setLine] = useState<Line>("SVP03");
  const [operator, setOperator] = useState("");
  const [formError, setFormError] = useState("");

  const sortedShifts = useMemo(
    () => [...db.shifts].sort((a, b) => b.createdAt - a.createdAt),
    [db.shifts]
  );

  const totalShifts = db.shifts.length;
  const uniqueLines = new Set(db.shifts.map((s) => s.line)).size;
  const todayCount = db.shifts.filter((s) => s.date === today).length;

  const startShift = (e: React.FormEvent) => {
    e.preventDefault();

    const op = operator.trim();
    if (!op) {
      setFormError("Bitte die CWID eingeben.");
      return;
    }

    setFormError("");

    const sortedActivities = db.activities
      .filter((activity) => !activity.archived)
      .slice()
      .sort((a, b) => {
        if (a.parentId === b.parentId) return a.sortOrder - b.sortOrder;
        if (a.parentId === null) return -1;
        if (b.parentId === null) return 1;
        return a.sortOrder - b.sortOrder;
      });

    let nextIdValue = db.nextId;

    const takeId = () => {
      const id = nextIdValue;
      nextIdValue += 1;
      return id;
    };

    const activityIdToShiftActivityId = new Map<number, number>();

    const shiftActivities: ShiftActivity[] = sortedActivities.map((activity) => {
      const shiftActivityId = takeId();
      activityIdToShiftActivityId.set(activity.id, shiftActivityId);

      return {
        id: shiftActivityId,
        activityId: activity.id,
        nameSnapshot: activity.name,
        colorSnapshot: activity.color,
        parentIdSnapshot: null,
        sortOrderSnapshot: activity.sortOrder,
      };
    });

    for (const shiftActivity of shiftActivities) {
      const sourceActivity = sortedActivities.find(
        (activity) => activity.id === shiftActivity.activityId
      );

      if (!sourceActivity) continue;

      shiftActivity.parentIdSnapshot =
        sourceActivity.parentId === null
          ? null
          : activityIdToShiftActivityId.get(sourceActivity.parentId) ?? null;
    }

    const shiftId = takeId();

    const shift: Shift = {
      id: shiftId,
      date,
      shiftType,
      line,
      operator: op,
      createdAt: Date.now(),
      shiftActivities,
      taskEvents: [],
      notes: [],
    };

    const next: DB = {
      ...db,
      nextId: nextIdValue,
      shifts: [shift, ...db.shifts],
    };

    setDB(next);
    setOperator("");
    onOpenShiftBoard(shiftId);
  };

  const deleteShift = (id: number) => {
    if (!window.confirm("Diese Schicht wirklich löschen?")) return;

    setDB({
      ...db,
      shifts: db.shifts.filter((s) => s.id !== id),
    });
  };

  return (
    <div className={`${styles.shiftPageTheme} ${styles[`theme${shiftType}`]}`}>
      <NavBar active="shifts" onDashboardClick={() => onOpenShiftBoard(-1)} />

      <main className={`main ${styles.page}`}>
        <section className={styles.heroHeader}>
          <div className={styles.heroHeaderLeft}>
            <BayerLogo />

            <div className={styles.heroText}>
              <div className={styles.heroEyebrow}>Bayer Produktionssteuerung</div>
              <h1 className={styles.heroTitle}>Schichten</h1>
              <p className={styles.heroSubtitle}>
                Neue Schichten anlegen, laufende Schichten prüfen und direkt ins
                Ausführungsboard wechseln.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.kpiGrid}>
          <article className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Schichten gesamt</div>
            <div className={styles.kpiValue}>{totalShifts}</div>
          </article>

          <article className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Aktive Linien</div>
            <div className={styles.kpiValue}>{uniqueLines}</div>
          </article>

          <article className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Heute</div>
            <div className={styles.kpiValue}>{todayCount}</div>
          </article>
        </section>

        <section className={styles.dashboardGrid}>
          <article
            className={`${styles.card} ${styles.shiftComposer} ${styles[`shiftTheme${shiftType}`]}`}
          >
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>Neue Schicht starten</h2>
                <p className={styles.cardSubtitle}>
                  Erstelle eine neue Schicht und öffne direkt das Ausführungsboard.
                </p>
              </div>
            </div>

            <form className={styles.newShiftForm} onSubmit={startShift}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="shift-date">
                  Datum
                </label>
                <input
                  id="shift-date"
                  className={styles.input}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="shift-type">
                  Schicht
                </label>
                <select
                  id="shift-type"
                  className={styles.select}
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value as ShiftType)}
                >
                  <option value="Frueh">Frühschicht</option>
                  <option value="Spaet">Spätschicht</option>
                  <option value="Nacht">Nachtschicht</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="shift-line">
                  Linie
                </label>
                <select
                  id="shift-line"
                  className={styles.select}
                  value={line}
                  onChange={(e) => setLine(e.target.value as Line)}
                >
                  {LINE_OPTIONS.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="shift-operator">
                  CWID
                </label>
                <input
                  id="shift-operator"
                  className={styles.input}
                  type="text"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  placeholder="z. B. AB1234"
                />
              </div>

              {formError ? (
                <div className={styles.errorBox}>{formError}</div>
              ) : null}

              <div className={styles.newShiftActions}>
                <button type="submit" className={styles.btnPrimary}>
                  Schicht starten
                </button>
              </div>
            </form>
          </article>

          <article className={`${styles.card} ${styles.shiftHistoryCard}`}>
            <div className={styles.row}>
              <div>
                <h2 className={styles.cardTitle}>Letzte Schichten</h2>
                <p className={styles.cardSubtitle}>{sortedShifts.length} Einträge</p>
              </div>
            </div>

            {sortedShifts.length === 0 ? (
              <div className={styles.emptyState}>
                Noch keine Schichten. Starte links deine erste Schicht.
              </div>
            ) : (
              <div className={styles.shiftList}>
                {sortedShifts.map((s) => (
                  <article
                    key={s.id}
                    className={`${styles.shiftCard} ${styles[`shiftCard${s.shiftType}`]}`}
                  >
                    <button
                      type="button"
                      className={styles.shiftCardMain}
                      onClick={() => onOpenShiftBoard(s.id)}
                    >
                      <div className={styles.shiftMeta}>
                        <div className={styles.shiftDate}>{formatDate(s.date)}</div>
                        <div className={styles.shiftSub}>
                          {s.operator} · {s.line} · {SHIFT_LABEL[s.shiftType]}
                        </div>
                      </div>
                    </button>

                    <div className={styles.shiftCardFooter}>
                      <button
                        type="button"
                        className={styles.btnDanger}
                        onClick={() => deleteShift(s.id)}
                      >
                        Löschen
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
