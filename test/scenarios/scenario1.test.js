import { describe, it, expect } from "vitest";
import { calculateEstate } from "../../src/engine/index.js";
import { scenario1Input } from "../fixtures/scenario1.js";

describe("Test Scenario 1 — Baseline Intestate, No Complications", () => {
  const result = calculateEstate(scenario1Input);

  it("computes decedent shares and gross estate", () => {
    expect(result.grossEstate).toBe(12_000_000);
  });

  it("applies standard and family home deductions", () => {
    expect(result.standardDeduction).toBe(5_000_000);
    expect(result.familyHomeDeduction).toBe(7_500_000); // min(7.5M actual, 10M cap)
  });

  it("nets taxable estate to zero and estate tax to zero", () => {
    expect(result.netTaxableEstate).toBe(0);
    expect(result.estateTax).toBe(0);
  });

  it("still requires CPA certification off gross estate, despite zero tax due", () => {
    expect(result.cpaCertificationRequired).toBe(true);
  });

  it("is EJS eligible (no will, no liabilities, no minors)", () => {
    expect(result.ejsEligible).toBe(true);
  });

  it("computes intestate unit method legitime", () => {
    expect(result.legitime.mode).toBe("intestate");
    expect(result.legitime.units.totalUnits).toBe(6); // 2 children * 2 + spouse * 2
    expect(result.legitime.valuePerUnit).toBe(2_000_000);

    const childEntitlements = result.legitime.entitlements.filter((e) => e.heirType === "legitimateChild");
    const spouseEntitlement = result.legitime.entitlements.find((e) => e.heirType === "spouse");

    expect(childEntitlements).toHaveLength(2);
    for (const child of childEntitlements) {
      expect(child.grossEntitlement).toBe(4_000_000);
    }
    expect(spouseEntitlement.grossEntitlement).toBe(4_000_000);
  });
});
