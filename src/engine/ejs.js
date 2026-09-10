// Extrajudicial settlement eligibility (Rules of Court, Rule 74 §1): no will, no debts,
// and no minor heirs (a minor heir's interest requires court approval/guardianship).
//
// The heir data model excerpted in the Build Brief doesn't yet carry a birthdate/minor
// field, so `hasMinorHeirs` is accepted as an explicit input here rather than derived —
// flagged as a data-model gap for whoever wires up Section B in the UI layer.
export function isEJSEligible({ hasWill, liabilities = [], hasMinorHeirs = false }) {
  return !hasWill && liabilities.length === 0 && !hasMinorHeirs;
}
