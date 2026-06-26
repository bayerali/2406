import React from "react";
import type { ShiftActivity, TaskEvent } from "../../types";
import { statusLabel } from "../../utils/executionBoard";
import styles from "./ParentGroupPicker.module.css";

type ParentGroupPickerProps = {
  parentGroups: ShiftActivity[];
  selectedParentId: number | null;
  latestEventByShiftActivityId: Map<number, TaskEvent>;
  onSelect: (parentId: number) => void;
};

export function ParentGroupPicker({
  parentGroups,
  selectedParentId,
  latestEventByShiftActivityId,
  onSelect,
}: ParentGroupPickerProps) {
  return (
    <div className={styles.grid}>
      {parentGroups.length === 0 ? (
        <div className={styles.emptyState}>Keine Elternpunkte vorhanden.</div>
      ) : (
        parentGroups.map((parent) => {
          const latest = latestEventByShiftActivityId.get(parent.id) ?? null;
          const isActive = selectedParentId === parent.id;

          return (
            <button
              key={parent.id}
              type="button"
              className={`${styles.card} ${
                isActive ? styles.cardActive : ""
              }`}
              onClick={() => onSelect(parent.id)}
            >
              <div className={styles.cardTop}>
                <span
                  className={`${styles.indicator} ${
                    isActive ? styles.indicatorActive : ""
                  }`}
                  aria-hidden="true"
                />
              </div>

              <div className={styles.cardBody}>
                <span className={styles.cardTitle}>{parent.nameSnapshot}</span>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.cardMeta}>
                  {latest ? statusLabel(latest.status) : "Noch keine Rückmeldung"}
                </span>
                <span
                  className={`${styles.statusBadge} ${
                    latest
                      ? styles[`status${latest.status}`]
                      : styles.statusOpen
                  }`}
                >
                  {latest ? statusLabel(latest.status) : "Offen"}
                </span>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
