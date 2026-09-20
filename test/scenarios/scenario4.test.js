import { describe, it, expect } from "vitest";
import { calculateEstate } from "../../src/engine/index.js";
import { scenario4Input } from "../fixtures/scenario4.js";

describe("Test Scenario 4 — Legal Separation Disqualification + Double-Counting Prevention", () => {
  const result = calculateEstate(scenario4Input);

  it("excludes the business-entity-held office building from gross estate (§3.2a)", () => {
    // 4.5M (family home) + 0 (office building, excluded) + 12M (business shares) + 1.5M (bank) = 18M
    // NOT 38M, which double-counting the building would have produced.
    expect(result.grossEstate).toBe(18_000_000);
  });

  it("computes net taxable estate and estate tax", () => {
    expect(result.netTaxableEstate).toBe(8_500_000); // 18M - 5M - 4.5M
    expect(result.estateTax).toBe(510_000);
  });

  it("disqualifies the offending spouse from all legitime units (LB-4 Mechanic B)", () => {
    expect(result.spouseEligible).toBe(false);
    expect(result.legitime.units.totalUnits).toBe(4); // 2 children * 2, spouse contributes 0
    expect(result.legitime.entitlements.find((e) => e.heirType === "spouse")).toBeUndefined();
  });

  it("reallocates the spouse's would-be share entirely to the legitimate children", () => {
    expect(result.legitime.valuePerUnit).toBe(4_500_000);
    const childEntitlements = result.legitime.entitlements.filter((e) => e.heirType === "legitimateChild");
    expect(childEntitlements).toHaveLength(2);
    for (const child of childEntitlements) {
      expect(child.grossEntitlement).toBe(9_000_000);
    }
  });

  it("surfaces net-profit forfeiture (Mechanic A) as descriptive only, with no computed amount", () => {
    const forfeitureFlag = result.flags.find((f) => f.type === "net_profit_forfeiture_descriptive");
    expect(forfeitureFlag).toBeTruthy();
    expect(forfeitureFlag).not.toHaveProperty("value");
    expect(forfeitureFlag).not.toHaveProperty("amount");
  });
});
