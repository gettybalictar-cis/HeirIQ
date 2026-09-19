// Build Brief §3.5 (testate floor) and §3.6 (intestate unit method + collation catch-up).
// LB-5: intestate and testate are two different frameworks and must not be blended.
import { UNITS } from "./constants.js";
import { countDecedentsIllegitimateChildren, classifyIllegitimateChild, classifyIllegitimateChildren } from "./heirs.js";

// ---------------------------------------------------------------------------
// §3.6 Step 2 — Intestate Unit Method. UPDATED for v7 (LB-11 legitimation).
// ---------------------------------------------------------------------------

export function calculateIntestateUnits({ heirs, spouseEligible }) {
  const legitimateCount = heirs.legitimateChildren.length;
  const adoptedCount = heirs.adoptedChildren.length; // LB-9 — same weight as legitimate.
  const { legitimatedCount, illegitimateSelfCount, unclearChildIds } = classifyIllegitimateChildren(heirs.illegitimateChildren);

  // LB-11: a legitimated child (both.yours, no impediment at conception) joins
  // the legitimate/adopted pool at the calculation level — it is not moved out
  // of the illegitimateChildren array in the data model.
  const effectiveLegitimateCount = legitimateCount + adoptedCount + legitimatedCount;

  const totalUnits =
    UNITS.legitimateChild * effectiveLegitimateCount +
    UNITS.illegitimateChild * illegitimateSelfCount +
    (spouseEligible ? UNITS.spouse : 0);

  return {
    legitimateCount,
    adoptedCount,
    legitimatedCount,
    illegitimateSelfCount,
    unclearChildIds,
    effectiveLegitimateCount,
    spouseEligible,
    totalUnits,
  };
}

/**
 * @param {number} collatedBase - netHereditaryEstate + sum of prior gifts' value-at-time-of-gift
 *   to compulsory heirs (LB-6). Callers doing a full pipeline run pass in
 *   collatedBase = netHereditaryEstate + priorGiftsTotal; §3.6 Step 3 handles
 *   subtracting each heir's already-received gifts back out again.
 */
export function calculateIntestateLegitime({ collatedBase, heirs, spouseEligible }) {
  const units = calculateIntestateUnits({ heirs, spouseEligible });
  const valuePerUnit = units.totalUnits === 0 ? 0 : collatedBase / units.totalUnits;

  const entitlements = [];
  for (const child of heirs.legitimateChildren) {
    entitlements.push({ heirId: child.id, heirType: "legitimateChild", grossEntitlement: UNITS.legitimateChild * valuePerUnit });
  }
  for (const child of heirs.adoptedChildren) {
    entitlements.push({ heirId: child.id, heirType: "adoptedChild", grossEntitlement: UNITS.adoptedChild * valuePerUnit });
  }
  for (const child of heirs.illegitimateChildren) {
    const classification = classifyIllegitimateChild(child);
    if (classification === "legitimated") {
      // LB-11: legitimated by the subsequent marriage — same 2-unit weight as a legitimate child.
      entitlements.push({ heirId: child.id, heirType: "legitimatedChild", grossEntitlement: UNITS.legitimateChild * valuePerUnit });
    } else if (classification === "illegitimate") {
      entitlements.push({ heirId: child.id, heirType: "illegitimateChild", grossEntitlement: UNITS.illegitimateChild * valuePerUnit });
    }
    // "unclear" (legitimation status not yet confirmed) and "none" (spouse-only,
    // not this decedent's biological child) get no entitlement row.
  }
  if (spouseEligible) {
    entitlements.push({ heirId: "spouse", heirType: "spouse", grossEntitlement: UNITS.spouse * valuePerUnit });
  }

  return { units, valuePerUnit, entitlements };
}

/**
 * Sanity check called out explicitly in the Build Brief: all legitimate AND adopted
 * children's gross entitlements must be equal to one another (same 2-unit weighting).
 * Throws — a mismatch here means a bug in the engine, not a legitimate case to handle.
 */
export function assertEqualChildEntitlements(entitlements) {
  const childAmounts = entitlements
    .filter((e) => e.heirType === "legitimateChild" || e.heirType === "adoptedChild" || e.heirType === "legitimatedChild")
    .map((e) => e.grossEntitlement);
  const distinct = new Set(childAmounts.map((v) => Math.round(v * 100)));
  if (distinct.size > 1) {
    throw new Error("Engine bug: legitimate/adopted children's gross entitlements are not equal.");
  }
}

// ---------------------------------------------------------------------------
// §3.6 Step 3 — Collation Catch-Up (LB-6), corrected formula.
//
// The v2 bug: summing raw remainingEntitlement (without flooring negatives at
// zero) always equals the actual remaining estate exactly, so the shortfall
// flag could never fire. The fix sums the CAPPED values instead.
// ---------------------------------------------------------------------------

export function applyCollationCatchUp({ entitlements, priorGifts, remainingEstateAtDeath }) {
  const flags = [];
  let totalNeededFromRemainingEstate = 0;

  const detail = entitlements.map((entitlement) => {
    const alreadyReceived = priorGifts
      .filter((gift) => gift.heirId === entitlement.heirId)
      .reduce((sum, gift) => sum + gift.valueAtTimeOfGift, 0);

    const remainingEntitlement = entitlement.grossEntitlement - alreadyReceived;
    let cappedRemainingEntitlement;
    if (remainingEntitlement < 0) {
      flags.push({ type: "gift_exceeds_entitlement", heirId: entitlement.heirId });
      cappedRemainingEntitlement = 0; // cannot be clawed back; must not offset other heirs' shortfalls
    } else {
      cappedRemainingEntitlement = remainingEntitlement;
    }

    totalNeededFromRemainingEstate += cappedRemainingEntitlement;

    return { ...entitlement, alreadyReceived, remainingEntitlement, cappedRemainingEntitlement };
  });

  if (totalNeededFromRemainingEstate > remainingEstateAtDeath) {
    flags.push({
      type: "insufficient_estate_to_equalize",
      shortfall: totalNeededFromRemainingEstate - remainingEstateAtDeath,
    });
  }

  return { detail, totalNeededFromRemainingEstate, flags };
}

// ---------------------------------------------------------------------------
// §3.5 — Testate: Legitime Floor + Free Portion (LB-5). CORRECTED for v6.
//
// Per LB-5's interpretation, the tool cannot verify an actual will's terms, so
// testate mode only ever computes the GUARANTEED MINIMUM FLOOR per heir — never
// a full simulated distribution. The divisor for the legitime pool previously
// counted legitimateChildren only, silently dropping adopted children even
// though LB-9 gives them no-distinction standing — caught by Test Scenario 5
// (v2) and fixed here: the divisor is legitimateChildren + adoptedChildren.
// ---------------------------------------------------------------------------

export function calculateTestateLegitimeFloor({ collatedBase, heirs, spouseEligible }) {
  const numLegitimateUnitChildren = heirs.legitimateChildren.length + heirs.adoptedChildren.length; // Art. 979, LB-9
  const illegitimateSelfCount = countDecedentsIllegitimateChildren(heirs.illegitimateChildren);

  // Art. 887/888: legitimate (and adopted, LB-9 — no distinction) children collectively get a 1/2 floor.
  const legitimateChildrenPool = 0.5 * collatedBase;
  const perLegitimateOrAdoptedChildFloor = numLegitimateUnitChildren > 0 ? legitimateChildrenPool / numLegitimateUnitChildren : 0;

  // Art. 892/996: spouse concurring with legitimate/adopted children floors at one child's share.
  // Art. 895: an illegitimate child's floor is half a legitimate/adopted child's share.
  // Both draw FROM the free portion, not on top of it (LB-5) — so they reduce what's left
  // for the testator's own discretion, rather than adding to the legitimate children's pool.
  const spouseFloor = spouseEligible ? perLegitimateOrAdoptedChildFloor : 0;
  const perIllegitimateChildFloor = illegitimateSelfCount > 0 ? perLegitimateOrAdoptedChildFloor / 2 : 0;
  const freePortion = collatedBase - legitimateChildrenPool - spouseFloor - perIllegitimateChildFloor * illegitimateSelfCount;

  return {
    legitimateChildrenPool,
    perLegitimateOrAdoptedChildFloor,
    freePortion,
    spouseFloor,
    perIllegitimateChildFloor,
    note: "These are the minimum amounts your will must give each heir. This tool cannot verify your actual will's distribution — have Getty review your will's terms against this floor.",
  };
}
