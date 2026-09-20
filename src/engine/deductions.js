// Build Brief §3.4 — Family Home Deduction, plus the flat standard deduction (NIRC §86(A)(1)).
import { STANDARD_DEDUCTION, FAMILY_HOME_DEDUCTION_CAP } from "./constants.js";
import { decedentShareOfAsset } from "./assets.js";

/**
 * natureOfUse === "primary_residence" is a required gate — a rental or commercial
 * property can never qualify, regardless of how isFamilyHome is (mis)tagged.
 * Deduction is capped at FAMILY_HOME_DEDUCTION_CAP regardless of the home's actual value.
 */
export function calculateFamilyHomeDeduction(assets, maritalRegime) {
  const decedentShareOfFamilyHome = assets
    .filter((a) => a.category === "real_property" && a.isFamilyHome === true && a.natureOfUse === "primary_residence")
    .reduce((sum, a) => sum + decedentShareOfAsset(a, maritalRegime), 0);

  return Math.min(decedentShareOfFamilyHome, FAMILY_HOME_DEDUCTION_CAP);
}

/**
 * Liabilities (claims against the estate, NIRC §86(A)(6)) reduce the taxable base
 * alongside the standard and family-home deductions. None of the v1 test scenarios
 * carry liabilities, so this defaults to 0 and doesn't affect their expected output.
 */
export function calculateNetTaxableEstate(grossEstate, familyHomeDeduction, liabilitiesTotal = 0) {
  return Math.max(0, grossEstate - STANDARD_DEDUCTION - familyHomeDeduction - liabilitiesTotal);
}
