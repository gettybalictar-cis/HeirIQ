// Helpers shared by the legitime (§3.6) and flag (§3.7/§3.8) modules.

/**
 * LB-5/LB-9: an illegitimate child only carries a unit / triggers heir-scoped flags
 * when they are the decedent's own biological child — "biologicalParent includes 'self'"
 * per the Build Brief pseudocode. "both" (biological child of both spouses) still means
 * the decedent is a biological parent, so it qualifies too; "spouse" alone does not.
 */
export function isDecedentsBiologicalChild(illegitimateChild) {
  return illegitimateChild.biologicalParent === "self" || illegitimateChild.biologicalParent === "both";
}

export function countDecedentsIllegitimateChildren(illegitimateChildren = []) {
  return illegitimateChildren.filter(isDecedentsBiologicalChild).length;
}

/**
 * Build Brief §3.5 (v6): EJS eligibility is computed from the heir data directly —
 * any legitimate, adopted, or illegitimate child entry with `isMinor === true`
 * disqualifies the estate from extrajudicial settlement.
 */
export function hasAnyMinorHeir(heirs) {
  const allChildren = [
    ...(heirs.legitimateChildren || []),
    ...(heirs.adoptedChildren || []),
    ...(heirs.illegitimateChildren || []),
  ];
  return allChildren.some((child) => child.isMinor === true);
}

/**
 * LB-11: a child described as "both of yours, from before we married" is only
 * reclassified by the legitimationImpediment follow-up — "self" and "spouse"
 * children never ask it. Returns:
 * - "legitimated"  — both.yours + no impediment at conception -> joins the legitimate/adopted pool
 * - "illegitimate" — self, OR both.yours + confirmed impediment -> confirmed illegitimate, 1 unit
 * - "unclear"      — both.yours + impediment "not_sure"/unset -> deferred to consultation, no unit
 * - "none"         — "spouse" alone: not the decedent's biological child, no claim on THIS estate (LB-5)
 */
export function classifyIllegitimateChild(child) {
  if (child.biologicalParent === "both") {
    if (child.legitimationImpediment === "no") return "legitimated";
    if (child.legitimationImpediment === "yes") return "illegitimate";
    return "unclear"; // "not_sure" or not yet answered
  }
  if (child.biologicalParent === "self") return "illegitimate";
  return "none";
}

/**
 * Build Brief §3.6 (v7): tallies illegitimate children into the three buckets
 * calculateIntestateUnits needs — legitimated (joins the 2-unit pool), confirmed
 * illegitimate (1 unit), and unclear (excluded from both, flagged for consultation).
 */
export function classifyIllegitimateChildren(illegitimateChildren = []) {
  let legitimatedCount = 0;
  let illegitimateSelfCount = 0;
  const unclearChildIds = [];

  for (const child of illegitimateChildren) {
    const classification = classifyIllegitimateChild(child);
    if (classification === "legitimated") legitimatedCount++;
    else if (classification === "illegitimate") illegitimateSelfCount++;
    else if (classification === "unclear") unclearChildIds.push(child.id);
    // "none" (spouse-only child): not a compulsory heir of this decedent, no unit, no flag.
  }

  return { legitimatedCount, illegitimateSelfCount, unclearChildIds };
}
