// HeirIQ calculation engine — standalone module, no UI dependency.
// Orchestrates the full pipeline described in HeirIQ-ClaudeCode-Build-Brief-v5.md §3.
import { calculateGrossEstate } from "./grossEstate.js";
import { calculateFamilyHomeDeduction, calculateNetTaxableEstate } from "./deductions.js";
import { calculateEstateTax, requiresCPACertification } from "./estateTax.js";
import { isEJSEligible } from "./ejs.js";
import { calculateIntestateLegitime, applyCollationCatchUp, assertEqualChildEntitlements, calculateTestateLegitimeFloor } from "./legitime.js";
import { isSpouseDisqualified, netProfitForfeitureFlag, detectFamilyHomeCoOwnershipRisk } from "./flags.js";
import { STANDARD_DEDUCTION } from "./constants.js";

/**
 * @param {object} input
 * @param {string} input.maritalRegime - "ACP" | "CPG" | "forced_separation" | "per_prenup"
 *   (see propertyRegime.js#resolveMaritalRegime to derive this from marriage date/history)
 * @param {object} input.heirs - { legitimateChildren, adoptedChildren, illegitimateChildren, spouseAlive }
 * @param {Array} input.assets - per Build Brief §2b data model
 * @param {Array} [input.liabilities] - [{ id, value }]
 * @param {Array} [input.priorGifts] - [{ heirId, valueAtTimeOfGift, date }]
 * @param {boolean} [input.hasWill]
 * @param {object|null} [input.disqualification] - { mechanism: "legal_separation"|"annulment_bad_faith", offendingParty: "spouse"|"decedent" }
 * @param {boolean} [input.hasMinorHeirs]
 * @param {boolean} [input.hasArt1080Partition] - testate mode only; suppresses the co-ownership flag when a will already partitions assets to avoid it
 * @param {number} [input.remainingEstateAtDeath] - overrides netHereditaryEstate as the pool available for collation catch-up, for callers who already know this figure independent of itemized assets (see Test Scenario 3)
 */
export function calculateEstate(input) {
  const {
    maritalRegime,
    heirs,
    assets,
    liabilities = [],
    priorGifts = [],
    hasWill = false,
    disqualification = null,
    hasMinorHeirs = false,
    hasArt1080Partition = false,
    remainingEstateAtDeath,
  } = input;

  const liabilitiesTotal = liabilities.reduce((sum, l) => sum + l.value, 0);

  // §3.3 Gross Estate (§3.2a double-counting exclusion applied inside decedentShareOfAsset)
  const grossEstate = calculateGrossEstate(assets, maritalRegime);

  // §3.4 Family Home Deduction
  const familyHomeDeduction = calculateFamilyHomeDeduction(assets, maritalRegime);

  // Estate tax
  const netTaxableEstate = calculateNetTaxableEstate(grossEstate, familyHomeDeduction, liabilitiesTotal);
  const estateTax = calculateEstateTax(netTaxableEstate);
  const cpaCertificationRequired = requiresCPACertification(grossEstate);
  const ejsEligible = isEJSEligible({ hasWill, liabilities, hasMinorHeirs });

  // Legitime pool: net hereditary estate (assets minus debts, LB-6), plus collated gifts.
  const netHereditaryEstate = grossEstate - liabilitiesTotal;
  const priorGiftsTotal = priorGifts.reduce((sum, g) => sum + g.valueAtTimeOfGift, 0);
  const collatedBase = netHereditaryEstate + priorGiftsTotal;

  // LB-4 Mechanic B: spousal disqualification is one-directional and independent of survivorship.
  const spouseEligible = Boolean(heirs.spouseAlive) && !isSpouseDisqualified(disqualification);

  const flags = [];
  let legitime;

  if (!hasWill) {
    // §3.6 — Intestate Unit Method (LB-5 default mode)
    const { units, valuePerUnit, entitlements } = calculateIntestateLegitime({ collatedBase, heirs, spouseEligible });
    assertEqualChildEntitlements(entitlements);

    const { detail, totalNeededFromRemainingEstate, flags: catchUpFlags } = applyCollationCatchUp({
      entitlements,
      priorGifts,
      remainingEstateAtDeath: remainingEstateAtDeath ?? netHereditaryEstate,
    });
    flags.push(...catchUpFlags);

    legitime = { mode: "intestate", units, valuePerUnit, entitlements: detail, totalNeededFromRemainingEstate };
  } else {
    // §3.5 — Testate: floor only, per LB-5 (not a full will simulation).
    legitime = { mode: "testate", floor: calculateTestateLegitimeFloor({ netHereditaryEstate, heirs, spouseEligible }) };
  }

  // §3.8 — Co-ownership risk flag (LB-7)
  flags.push(
    ...detectFamilyHomeCoOwnershipRisk({
      assets,
      illegitimateChildren: heirs.illegitimateChildren,
      mode: hasWill ? "testate" : "intestate",
      hasArt1080Partition,
    })
  );

  // LB-4/LB-3 Mechanic A — descriptive only, never a computed amount.
  const forfeitureFlag = netProfitForfeitureFlag(disqualification);
  if (forfeitureFlag) flags.push(forfeitureFlag);

  return {
    grossEstate,
    standardDeduction: STANDARD_DEDUCTION,
    familyHomeDeduction,
    liabilitiesTotal,
    netTaxableEstate,
    estateTax,
    cpaCertificationRequired,
    ejsEligible,
    netHereditaryEstate,
    priorGiftsTotal,
    collatedBase,
    spouseEligible,
    legitime,
    flags,
  };
}

export * from "./propertyRegime.js";
export * from "./assets.js";
export * from "./grossEstate.js";
export * from "./deductions.js";
export * from "./estateTax.js";
export * from "./ejs.js";
export * from "./legitime.js";
export * from "./flags.js";
export * from "./currency.js";
export * from "./heirs.js";
export * from "./constants.js";
