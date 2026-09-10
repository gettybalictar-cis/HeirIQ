import { describe, it, expect } from "vitest";
import { isEJSEligible } from "../src/engine/ejs.js";

describe("§3.5 (v6) — EJS eligibility computed from heir data via isMinor", () => {
  const baseHeirs = {
    legitimateChildren: [{ id: "c1", isMinor: false }],
    adoptedChildren: [{ id: "c2", isMinor: false }],
    illegitimateChildren: [{ id: "c3", isMinor: false, biologicalParent: "self" }],
  };

  it("is eligible with no will, no liabilities, and no minor heirs", () => {
    expect(isEJSEligible({ hasWill: false, liabilities: [], heirs: baseHeirs })).toBe(true);
  });

  it("is ineligible when a legitimate child is a minor", () => {
    const heirs = { ...baseHeirs, legitimateChildren: [{ id: "c1", isMinor: true }] };
    expect(isEJSEligible({ hasWill: false, liabilities: [], heirs })).toBe(false);
  });

  it("is ineligible when an adopted child is a minor", () => {
    const heirs = { ...baseHeirs, adoptedChildren: [{ id: "c2", isMinor: true }] };
    expect(isEJSEligible({ hasWill: false, liabilities: [], heirs })).toBe(false);
  });

  it("is ineligible when an illegitimate child is a minor", () => {
    const heirs = { ...baseHeirs, illegitimateChildren: [{ id: "c3", isMinor: true, biologicalParent: "self" }] };
    expect(isEJSEligible({ hasWill: false, liabilities: [], heirs })).toBe(false);
  });

  it("is still ineligible with a will, even with no minor heirs", () => {
    expect(isEJSEligible({ hasWill: true, liabilities: [], heirs: baseHeirs })).toBe(false);
  });

  it("is still ineligible with outstanding liabilities, even with no minor heirs", () => {
    expect(isEJSEligible({ hasWill: false, liabilities: [{ id: "l1", value: 100_000 }], heirs: baseHeirs })).toBe(false);
  });
});
