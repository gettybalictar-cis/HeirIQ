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
