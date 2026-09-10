// Test Scenario 1 — Baseline Intestate, No Complications.
export const scenario1Input = {
  maritalRegime: "ACP", // 1995, no prenup
  hasWill: false,
  disqualification: null,
  heirs: {
    legitimateChildren: [
      { id: "child-1", label: "Child 1", birthOrder: 1 },
      { id: "child-2", label: "Child 2", birthOrder: 2 },
    ],
    adoptedChildren: [],
    illegitimateChildren: [],
    spouseAlive: true,
  },
  assets: [
    {
      id: "asset-family-home",
      category: "real_property",
      value: { value: 15_000_000, confidence: "exact" },
      acquisitionTiming: "during_marriage_effort_income",
      isFamilyHome: true,
      natureOfUse: "primary_residence",
      ownershipStructure: "direct",
    },
    {
      id: "asset-portfolio",
      category: "financial",
      value: { value: 6_000_000, confidence: "exact" },
      acquisitionTiming: "during_marriage_effort_income",
    },
    {
      id: "asset-car",
      category: "vehicle",
      value: { value: 1_500_000, confidence: "exact" },
      acquisitionTiming: "before_marriage",
    },
  ],
  liabilities: [],
  priorGifts: [],
};
