// Test Scenario 4 — Legal Separation Disqualification + Double-Counting Prevention.
export const scenario4Input = {
  maritalRegime: "CPG", // 1985, no prenup (pre-Aug 1988 default, LB-1)
  hasWill: false,
  disqualification: { mechanism: "legal_separation", offendingParty: "spouse" },
  heirs: {
    legitimateChildren: [
      { id: "child-1", label: "Child 1", birthOrder: 1 },
      { id: "child-2", label: "Child 2", birthOrder: 2 },
    ],
    adoptedChildren: [],
    illegitimateChildren: [],
    spouseAlive: true, // alive, but disqualified — must contribute 0 units
  },
  assets: [
    {
      id: "asset-family-home",
      category: "real_property",
      value: { value: 9_000_000, confidence: "exact" },
      acquisitionTiming: "during_marriage_effort_income",
      isFamilyHome: true,
      natureOfUse: "primary_residence",
      ownershipStructure: "direct",
    },
    {
      id: "asset-office-building",
      category: "real_property",
      value: { value: 20_000_000, confidence: "exact" },
      acquisitionTiming: "during_marriage_effort_income",
      isFamilyHome: false,
      natureOfUse: "commercial",
      ownershipStructure: "via_business_entity",
    },
    {
      id: "asset-abc-corp-shares",
      category: "business_shares",
      value: { value: 12_000_000, confidence: "estimated" },
      businessValuationMethod: "book_value",
      // Represents the decedent's full stake, inclusive of the office building's value —
      // deliberately no acquisitionTiming set here: business-shares valuations already
      // represent the decedent's own holding and aren't subject to the community split.
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
