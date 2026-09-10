// Build Brief §3.1 — Property Regime Resolution. LB-1, LB-2.
import { ACP_EFFECTIVE_DATE, COMMUNITY_REGIMES } from "./constants.js";

/**
 * LB-1: absent a valid prenup, marriages from Aug 3 1988 onward default to ACP;
 * earlier marriages default to CPG.
 * LB-2: a surviving spouse who remarries without first liquidating the prior
 * marriage's community/conjugal property is automatically forced into complete
 * separation of property for the new marriage, overriding everything else.
 */
export function resolveMaritalRegime({ marriageDate, hasPrenup = false, remarriedWithoutLiquidation = false }) {
  if (remarriedWithoutLiquidation) return "forced_separation";
  if (hasPrenup) return "per_prenup";
  const acpStart = new Date(ACP_EFFECTIVE_DATE);
  return new Date(marriageDate) >= acpStart ? "ACP" : "CPG";
}

/**
 * The decedent's automatic share of a community/conjugal asset at death.
 * ACP and CPG both split 50/50 at dissolution. Regimes with no community pool
 * (forced/complete separation, or an unresolved prenup) aren't exercised by the
 * v1 test scenarios — the tool doesn't yet capture per-spouse title, so such
 * assets are treated as fully the decedent's captured share pending a future
 * ownership-attribution field.
 */
export function communityShareFraction(maritalRegime) {
  return COMMUNITY_REGIMES.has(maritalRegime) ? 0.5 : 1.0;
}
