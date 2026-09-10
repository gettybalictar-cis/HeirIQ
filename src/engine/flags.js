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
