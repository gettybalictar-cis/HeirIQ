// Build Brief §3.2 (Asset Ownership Split) and §3.2a (Double-Counting Prevention).
import { communityShareFraction } from "./propertyRegime.js";

/**
 * §3.2a: a real-property asset held "via_business_entity" is excluded from the
 * real-estate total — its value is already represented under the corresponding
 * business_shares entry. Silent, correct exclusion; never surfaced as a warning.
 */
export function isDoubleCountedRealProperty(asset) {
  return asset.category === "real_property" && asset.ownershipStructure === "via_business_entity";
}

/**
 * §3.2: the decedent's own share of a single asset's value.
 * - Excluded (double-counted) real property contributes 0.
 * - Pre-union assets, and gifts/inheritance received during any union, are
 *   exclusive property regardless of regime — Art. 147/148 and ACP/CPG alike
 *   only ever reach property acquired THROUGH the couple's own work/industry
 *   during the union, so this exclusivity check is deliberately checked first,
 *   ahead of any regime branch. This also lets one estate mix assets from a
 *   void union with assets unrelated to it without a per-asset regime field
 *   (Test Scenario 6: an exclusive ₱8M asset sits alongside a void-union bank
 *   account and must count in full, not fall through to the void-union branch).
 * - "during_marriage_effort_income" assets are community property:
 *   - under a void marriage (LB-12), Art. 147 presumes an equal 50/50 share
 *     (no default under Art. 148 — only a user-provided estimate is used);
 *   - otherwise, split per the marital regime (typically 50/50 under ACP/CPG).
 */
export function decedentShareOfAsset(asset, maritalRegime) {
  if (isDoubleCountedRealProperty(asset)) return 0;

  const isExclusiveByTiming = asset.acquisitionTiming !== "during_marriage_effort_income";
  if (isExclusiveByTiming) return asset.value.value;

  if (maritalRegime === "void_union_147") {
    return asset.value.value * 0.5; // Art. 147 presumption of equal co-ownership
  }
  if (maritalRegime === "void_union_148") {
    // Art. 148: proportional-contribution split is fact-intensive and NOT
    // computed — only the client's own estimate is used, with no default.
    const fraction = asset.voidUnionEstimatedShareFraction;
    return typeof fraction === "number" ? asset.value.value * fraction : 0;
  }

  return asset.value.value * communityShareFraction(maritalRegime);
}
