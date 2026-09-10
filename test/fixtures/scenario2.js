// Test Scenario 2 — Illegitimate Child, Correctly Scoped Co-Ownership Flag.
export const scenario2Input = {
  maritalRegime: "ACP", // 1990, no prenup
  hasWill: false,
  disqualification: null,
  heirs: {
    legitimateChildren: [
      { id: "child-1", label: "Child 1", birthOrder: 1 },
      { id: "child-2", label: "Child 2", birthOrder: 2 },
    ],
    adoptedChildren: [],
    illegitimateChildren: [{ id: "child-3", label: "Child 3", birthOrder: 1, biologicalParent: "self" }],
    spouseAlive: true,
  },
  assets: [
    {
      id: "asset-rental-condo",
      category: "real_property",
      value: { value: 8_000_000, confidence: "exact" },
      acquisitionTiming: "during_marriage_effort_income",
      isFamilyHome: false,
      natureOfUse: "rental_investment",
      ownershipStructure: "direct",
    },
    {
      id: "asset-family-home",
      category: "real_property",
      value: { value: 10_000_000, confidence: "exact" },
      acquisitionTiming: "during_marriage_effort_income",
      isFamilyHome: true,
      natureOfUse: "primary_residence",
      ownershipStructure: "direct",
    },
    {
      id: "asset-bank",
      category: "financial",
      value: { value: 3_000_000, confidence: "exact" },
      acquisitionTiming: "during_marriage_effort_income",
    },
  ],
  liabilities: [],
  priorGifts: [],
};
