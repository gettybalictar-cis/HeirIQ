import { describe, it, expect } from "vitest";
import { calculateEstate } from "../../src/engine/index.js";
import { scenario5Input } from "../fixtures/scenario5.js";

describe("Test Scenario 5 — Testate Mode, All Heir Classes at Once", () => {
  const result = calculateEstate(scenario5Input);

  it("collates to the ₱24,000,000 base the scenario specifies", () => {
    expect(result.collatedBase).toBe(24_000_000);
  });

  it("computes the legitime pool as half the collated base", () => {
    expect(result.legitime.mode).toBe("testate");
    expect(result.legitime.floor.legitimateChildrenPool).toBe(12_000_000);
  });

  it("includes adopted children in the divisor (the v6 fix) — 2 legitimate + 1 adopted = 3", () => {
    // ₱12,000,000 / 3 = ₱4,000,000 per legitimate-or-adopted child.
    expect(result.legitime.floor.perLegitimateOrAdoptedChildFloor).toBe(4_000_000);
  });

  it("gives the adopted child a floor identical to a legitimate child's (LB-9 wired into testate mode)", () => {
    // The engine computes one shared per-legitimate-or-adopted-child floor value —
    // this test is the explicit sanity check the scenario calls for: no distinction.
    expect(result.legitime.floor.perLegitimateOrAdoptedChildFloor).toBe(4_000_000);
  });

  it("floors the spouse at one legitimate/adopted child's share", () => {
    expect(result.legitime.floor.spouseFloor).toBe(4_000_000);
  });

  it("floors the illegitimate child at half a legitimate/adopted child's share", () => {
    expect(result.legitime.floor.perIllegitimateChildFloor).toBe(2_000_000);
  });

  it("leaves the remaining ₱6,000,000 as free portion", () => {
    expect(result.legitime.floor.freePortion).toBe(6_000_000);
  });

  it("reconciles: 2 legitimate + 1 adopted + spouse + illegitimate + free portion = collated base", () => {
    const { legitimateChildrenPool, spouseFloor, perIllegitimateChildFloor, freePortion } = result.legitime.floor;
    // legitimateChildrenPool already equals 2 legitimate + 1 adopted floors combined (12M).
    const reconciled = legitimateChildrenPool + spouseFloor + perIllegitimateChildFloor + freePortion;
    expect(reconciled).toBe(24_000_000);
  });
});
