import { describe, it, expect } from "vitest";
import { calculateEstate } from "../../src/engine/index.js";
import { scenario6ImpedimentYesInput, scenario6ImpedimentNoInput } from "../fixtures/scenario6.js";

describe("Test Scenario 6 — Legitimation Impediment (LB-11) and Void Marriage Property (LB-12)", () => {
  describe("legitimationImpediment: yes (child stays illegitimate)", () => {
    const result = calculateEstate(scenario6ImpedimentYesInput);

    it("never runs ACP/CPG — the void-union asset gets the user's estimate, not a 50% default", () => {
      // 2,000,000 * 0.5 (client's own estimate) = 1,000,000 — NOT community-split via ACP/CPG.
      expect(result.grossEstate).toBe(9_000_000); // 1,000,000 (void-union share) + 8,000,000 (exclusive)
    });

    it("flags the void-union asset for consultation, not a computed forfeiture", () => {
      expect(result.flags.find((f) => f.type === "void_union_art148_needs_review")).toBeTruthy();
      expect(result.flags.find((f) => f.type === "void_union_bad_faith_not_computed")).toBeFalsy();
    });

    it("computes net hereditary estate as ₱9,000,000", () => {
      expect(result.netHereditaryEstate).toBe(9_000_000);
    });

    it("keeps the child illegitimate (1 unit) — total units = 3", () => {
      expect(result.legitime.units.illegitimateSelfCount).toBe(1);
      expect(result.legitime.units.legitimatedCount).toBe(0);
      expect(result.legitime.units.totalUnits).toBe(3); // 1 (illegitimate) + 2 (spouse)
    });

    it("gives the child ₱3,000,000 and the spouse ₱6,000,000", () => {
      expect(result.legitime.valuePerUnit).toBe(3_000_000);
      const child = result.legitime.entitlements.find((e) => e.heirId === "child-1");
      const spouse = result.legitime.entitlements.find((e) => e.heirId === "spouse");
      expect(child.heirType).toBe("illegitimateChild");
      expect(child.grossEntitlement).toBe(3_000_000);
      expect(spouse.grossEntitlement).toBe(6_000_000);
    });
  });

  describe("legitimationImpediment: no (child is legitimated) — contrast check", () => {
    const result = calculateEstate(scenario6ImpedimentNoInput);

    it("reclassifies the child into the legitimate pool — total units = 4", () => {
      expect(result.legitime.units.legitimatedCount).toBe(1);
      expect(result.legitime.units.illegitimateSelfCount).toBe(0);
      expect(result.legitime.units.totalUnits).toBe(4); // 2 (legitimated) + 2 (spouse)
    });

    it("produces a materially different entitlement: ₱4,500,000 each, not ₱3,000,000/₱6,000,000", () => {
      expect(result.legitime.valuePerUnit).toBe(2_250_000);
      const child = result.legitime.entitlements.find((e) => e.heirId === "child-1");
      const spouse = result.legitime.entitlements.find((e) => e.heirId === "spouse");
      expect(child.heirType).toBe("legitimatedChild");
      expect(child.grossEntitlement).toBe(4_500_000);
      expect(spouse.grossEntitlement).toBe(4_500_000);
    });

    it("does not change the void-union property treatment — same ₱9,000,000 net hereditary estate", () => {
      expect(result.netHereditaryEstate).toBe(9_000_000);
    });
  });
});
