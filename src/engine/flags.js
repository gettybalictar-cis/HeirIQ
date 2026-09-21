// LB-3/LB-4 (annulment/legal-separation disqualification, Mechanic A vs B) and
// LB-7/§3.8 (family home co-ownership risk flag).
import { countDecedentsIllegitimateChildren } from "./heirs.js";

/**
 * LB-3 / LB-4 Mechanic B: the offending spouse is disqualified from inheriting
 * from the innocent one, by testate and intestate succession alike. One-directional —
 * it only bars the offending party, never the reverse.
 */
export function isSpouseDisqualified(disqualification) {
  return disqualification?.offendingParty === "spouse";
}

/**
 * LB-3 / LB-4 Mechanic A (net-profit forfeiture) is a descriptive flag only — it
 * requires the community property's value at the time of the marriage, which the
 * tool doesn't capture. If the engine ever attaches a dollar amount to this flag,
 * that's a bug (Test Scenario 4 asserts this explicitly).
 */
export function netProfitForfeitureFlag(disqualification) {
  const mechanism = disqualification?.mechanism;
  if (mechanism !== "legal_separation" && mechanism !== "annulment_bad_faith") return null;
  return {
    type: "net_profit_forfeiture_descriptive",
    note: "Mechanic A — descriptive only; requires community-property value at time of marriage, not computed.",
  };
}

/**
 * §3.8: fires per qualifying asset, not as one blanket flag — an illegitimate
 * child concurring with real estate only creates a co-ownership risk against the
 * actual family home (isFamilyHome && natureOfUse === "primary_residence"), never
 * against other real property the same heir could theoretically also claim against
 * (Test Scenario 2: fires for the family home, not the rental condo).
 */
export function detectFamilyHomeCoOwnershipRisk({ assets, illegitimateChildren, mode, hasArt1080Partition = false }) {
  const selfIllegitimateExists = countDecedentsIllegitimateChildren(illegitimateChildren) > 0;
  if (!selfIllegitimateExists) return [];
  if (mode === "testate" && hasArt1080Partition) return [];

  return assets
    .filter((a) => a.category === "real_property" && a.isFamilyHome === true && a.natureOfUse === "primary_residence")
    .map((a) => ({ type: "family_home_co_ownership_risk", assetId: a.id }));
}

/**
 * LB-12: both void-union property branches are descriptive-only — Art. 147's
 * bad-faith forfeiture and Art. 148's proportional-contribution split are both
 * fact-intensive determinations the tool doesn't attempt to compute.
 */
export function detectVoidUnionFlags(maritalRegime) {
  if (maritalRegime === "void_union_147") return [{ type: "void_union_bad_faith_not_computed" }];
  if (maritalRegime === "void_union_148") return [{ type: "void_union_art148_needs_review" }];
  return [];
}

/**
 * LB-11: a "both of yours" child whose legitimation status is still "not_sure"
 * carries no unit either way — deferred to consultation rather than guessed.
 */
export function detectUnclearLegitimationFlags(unclearChildIds = []) {
  return unclearChildIds.map((heirId) => ({ type: "legitimation_status_unclear", heirId }));
}

/**
 * §3.7a (Decision #32): no children of any kind, no living spouse, no living
 * parents — Philippine intestate succession would pass to collateral relatives
 * (siblings, nephews, nieces, Civil Code Arts. 1003+), which HeirIQ does not
 * model. Descriptive only; no computation is attempted for this heir class.
 */
export function detectNoEligibleHeirClassFlag(heirs) {
  return heirs.noEligibleHeirClass === true ? [{ type: "no_modeled_heir_class" }] : [];
}

/**
 * LB-2: a surviving spouse who remarries without first liquidating the prior
 * marriage's community/conjugal property is forced into complete separation of
 * property for the new marriage — self-executing, no valuation needed. This was
 * computed correctly (decedentShareOfAsset already treats it as fully exclusive)
 * but never surfaced to the user as a distinct advisory until this flag was added.
 */
export function detectForcedSeparationFlag(maritalRegime) {
  return maritalRegime === "forced_separation" ? [{ type: "forced_separation_applied" }] : [];
}
