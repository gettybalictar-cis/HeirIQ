import { describe, it, expect } from "vitest";
import { detectForcedSeparationFlag } from "../src/engine/flags.js";
import { calculateEstate } from "../src/engine/index.js";

describe("detectForcedSeparationFlag — LB-2", () => {
  it("fires when the regime is forced_separation", () => {
    expect(detectForcedSeparationFlag("forced_separation")).toEqual([{ type: "forced_separation_applied" }]);
  });

  it("does not fire for ACP, CPG, or any other regime", () => {
    expect(detectForcedSeparationFlag("ACP")).toEqual([]);
    expect(detectForcedSeparationFlag("CPG")).toEqual([]);
    expect(detectForcedSeparationFlag("void_union_147")).toEqual([]);
  });
});

describe("LB-2 forced separation — end to end through calculateEstate", () => {
  it("surfaces forced_separation_applied, and treats effort/income assets as fully exclusive (no 50/50 split)", () => {
    const result = calculateEstate({
      maritalRegime: "forced_separation",
      hasWill: false,
      disqualification: null,
      heirs: {
        legitimateChildren: [{ id: "c1", label: "Child", birthOrder: 1, isMinor: false }],
        adoptedChildren: [],
        illegitimateChildren: [],
        spouseAlive: true,
      },
      assets: [
        {
          id: "a1",
          category: "financial",
          value: { value: 4_000_000, confidence: "exact" },
          acquisitionTiming: "during_marriage_effort_income",
        },
      ],
      liabilities: [],
      priorGifts: [],
    });

    expect(result.flags.find((f) => f.type === "forced_separation_applied")).toBeTruthy();
    expect(result.grossEstate).toBe(4_000_000); // full value, not halved — no community pool under forced separation
  });
});
