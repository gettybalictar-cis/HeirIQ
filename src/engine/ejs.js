// Extrajudicial settlement eligibility (Rules of Court, Rule 74 §1): no will, no debts,
// and no minor heirs (a minor heir's interest requires court approval/guardianship).
//
// Build Brief §3.5 (v6): this is now computed from the heir data directly via the
// `isMinor` field (§2a) — the earlier version took `hasMinorHeirs` as an unexplained
// external input with no corresponding data-model field, a gap the build itself surfaced.
import { hasAnyMinorHeir } from "./heirs.js";

export function isEJSEligible({ hasWill, liabilities = [], heirs }) {
  return !hasWill && liabilities.length === 0 && !hasAnyMinorHeir(heirs);
}
