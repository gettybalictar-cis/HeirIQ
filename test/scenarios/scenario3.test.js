import { describe, it, expect } from "vitest";
import { calculateIntestateLegitime, applyCollationCatchUp } from "../../src/engine/index.js";

// Test Scenario 3 — Collation Catch-Up, the Corrected Shortfall Case.
// This scenario targets the legitime/collation subsystem specifically (the bug
// this fixture caught), rather than a full asset-to-gross-estate pipeline — the
// spec supplies "remaining net hereditary estate at death" directly rather than
// itemized assets, so it's exercised at the §3.6 module level.
describe("Test Scenario 3 — Collation Catch-Up, the Corrected Shortfall Case", () => {
  const heirs = {
    legitimateChildren: [
      { id: "child-a", label: "Child A", birthOrder: 1 },
      { id: "child-b", label: "Child B", birthOrder: 2 },
    ],
    adoptedChildren: [],
    illegitimateChildren: [],
    spouseAlive: true,
  };

  const remainingNetHereditaryEstate = 6_000_000;
  const priorGifts = [
    { heirId: "child-a", valueAtTimeOfGift: 10_000_000 },
    { heirId: "child-b", valueAtTimeOfGift: 8_000_000 },
  ];
  const collatedBase = remainingNetHereditaryEstate + 10_000_000 + 8_000_000;

  it("collates the base to 24M and computes 4M per unit across 6 units", () => {
    expect(collatedBase).toBe(24_000_000);
    const { units, valuePerUnit } = calculateIntestateLegitime({ collatedBase, heirs, spouseEligible: true });
    expect(units.totalUnits).toBe(6);
    expect(valuePerUnit).toBe(4_000_000);
  });

  it("gives each heir an 8M gross entitlement, summing back to the collated base", () => {
    const { entitlements } = calculateIntestateLegitime({ collatedBase, heirs, spouseEligible: true });
    for (const e of entitlements) {
      expect(e.grossEntitlement).toBe(8_000_000);
    }
    const sum = entitlements.reduce((s, e) => s + e.grossEntitlement, 0);
    expect(sum).toBe(24_000_000);
  });

  it("flags gift_exceeds_entitlement for Child A but does not claw back, and does not treat Child B as the problem", () => {
    const { entitlements } = calculateIntestateLegitime({ collatedBase, heirs, spouseEligible: true });
    const { detail, flags } = applyCollationCatchUp({
      entitlements,
      priorGifts,
      remainingEstateAtDeath: remainingNetHereditaryEstate,
    });

    const childA = detail.find((d) => d.heirId === "child-a");
    const childB = detail.find((d) => d.heirId === "child-b");
    const spouse = detail.find((d) => d.heirId === "spouse");

    expect(childA.remainingEntitlement).toBe(-2_000_000); // true value shown for transparency
    expect(childA.cappedRemainingEntitlement).toBe(0); // cannot be clawed back
    expect(childB.remainingEntitlement).toBe(0);
    expect(childB.cappedRemainingEntitlement).toBe(0);
    expect(spouse.remainingEntitlement).toBe(8_000_000);
    expect(spouse.cappedRemainingEntitlement).toBe(8_000_000);

    expect(flags.find((f) => f.type === "gift_exceeds_entitlement" && f.heirId === "child-a")).toBeTruthy();
    expect(flags.find((f) => f.type === "gift_exceeds_entitlement" && f.heirId === "child-b")).toBeFalsy();
  });

  it("sums capped values (not raw) to correctly flag insufficient_estate_to_equalize with a 2M shortfall on the spouse's account", () => {
    const { entitlements } = calculateIntestateLegitime({ collatedBase, heirs, spouseEligible: true });
    const { totalNeededFromRemainingEstate, flags } = applyCollationCatchUp({
      entitlements,
      priorGifts,
      remainingEstateAtDeath: remainingNetHereditaryEstate,
    });

    expect(totalNeededFromRemainingEstate).toBe(8_000_000); // 0 + 0 + 8M, not the naive raw sum (which would be 6M)
    const shortfallFlag = flags.find((f) => f.type === "insufficient_estate_to_equalize");
    expect(shortfallFlag).toBeTruthy();
    expect(shortfallFlag.shortfall).toBe(2_000_000);
  });
});
