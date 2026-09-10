// Test Scenario 5 — Testate Mode, All Heir Classes at Once.
// Net hereditary estate (collated base) is given directly, no prior gifts, no
// liabilities — kept simple to isolate the testate floor formula itself.
export const scenario5Input = {
  maritalRegime: "ACP",
  hasWill: true, // testate mode
  disqualification: null,
  heirs: {
    legitimateChildren: [
      { id: "child-1", label: "Child 1", birthOrder: 1, isMinor: false },
      { id: "child-2", label: "Child 2", birthOrder: 2, isMinor: false },
    ],
    adoptedChildren: [{ id: "child-3", label: "Child 3 (adopted)", birthOrder: 1, isMinor: false }],
    illegitimateChildren: [{ id: "child-4", label: "Child 4", birthOrder: 1, isMinor: false, biologicalParent: "self" }],
    spouseAlive: true,
  },
  // A single asset engineered so decedentShareOfAsset() yields exactly the
  // scenario's stated ₱24,000,000 net hereditary estate / collated base:
  // ACP community asset, effort/income during marriage -> 50% decedent share.
  assets: [
    {
      id: "asset-estate-value",
      category: "financial",
      value: { value: 48_000_000, confidence: "exact" },
      acquisitionTiming: "during_marriage_effort_income",
    },
  ],
  liabilities: [],
  priorGifts: [],
};
