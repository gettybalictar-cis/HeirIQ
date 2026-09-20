import { describe, it, expect } from "vitest";
import { calculateEstate } from "../../src/engine/index.js";
import { scenario2Input } from "../fixtures/scenario2.js";

describe("Test Scenario 2 — Illegitimate Child, Correctly Scoped Co-Ownership Flag", () => {
  const result = calculateEstate(scenario2Input);

  it("computes gross estate", () => {
    expect(result.grossEstate).toBe(10_500_000);
  });

  it("computes net taxable estate and estate tax", () => {
    expect(result.netTaxableEstate).toBe(500_000);
    expect(result.estateTax).toBe(30_000);
  });

  it("computes intestate unit method legitime with mixed heir classes", () => {
    expect(result.legitime.units.totalUnits).toBe(7); // 2*2 + 1*1 + 2
    expect(result.legitime.valuePerUnit).toBe(1_500_000);

    const childEntitlements = result.legitime.entitlements.filter((e) => e.heirType === "legitimateChild");
    const illegitimateEntitlement = result.legitime.entitlements.find((e) => e.heirType === "illegitimateChild");
    const spouseEntitlement = result.legitime.entitlements.find((e) => e.heirType === "spouse");

    for (const child of childEntitlements) {
      expect(child.grossEntitlement).toBe(3_000_000);
    }
    expect(illegitimateEntitlement.grossEntitlement).toBe(1_500_000);
    expect(spouseEntitlement.grossEntitlement).toBe(3_000_000);
  });

  it("fires the co-ownership risk flag only for the family home, not the rental condo", () => {
    const coOwnershipFlags = result.flags.filter((f) => f.type === "family_home_co_ownership_risk");
    expect(coOwnershipFlags).toHaveLength(1);
    expect(coOwnershipFlags[0].assetId).toBe("asset-family-home");
  });
});
