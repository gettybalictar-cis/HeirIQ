// Test Scenario 6 — Legitimation Impediment (LB-11) and Void Marriage Property (LB-12).
// One marriage on record: void, ground "other" (bigamous), impediment "yes" ->
// regime_override = "void_union_148". One child from this union, biologicalParent
// "both", legitimationImpediment "yes" (consistent with the same impediment).
// Decedent later validly remarried; that spouse survives and is eligible.
function buildInput({ legitimationImpediment }) {
  return {
    maritalRegime: "void_union_148", // resolved per §3.1: status "void", voidImpediment "yes"
    hasWill: false,
    disqualification: null,
    heirs: {
      legitimateChildren: [],
      adoptedChildren: [],
      illegitimateChildren: [
        { id: "child-1", label: "Child 1", birthOrder: 1, isMinor: false, biologicalParent: "both", legitimationImpediment },
      ],
      spouseAlive: true,
    },
    assets: [
      {
        id: "asset-void-union-bank",
        category: "financial",
        value: { value: 2_000_000, confidence: "estimated" },
        acquisitionTiming: "during_marriage_effort_income", // acquired during the void union
        voidUnionEstimatedShareFraction: 0.5, // client's own estimate: "I believe 50% is mine"
      },
      {
        id: "asset-exclusive",
        category: "financial",
        value: { value: 8_000_000, confidence: "exact" },
        acquisitionTiming: "before_marriage", // unrelated to the void union — fully exclusive
      },
    ],
    liabilities: [],
    priorGifts: [],
  };
}

export const scenario6ImpedimentYesInput = buildInput({ legitimationImpediment: "yes" });
export const scenario6ImpedimentNoInput = buildInput({ legitimationImpediment: "no" });
