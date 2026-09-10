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
 * - "during_marriage_effort_income" assets are community/conjugal property,
 *   split per the marital regime (typically 50/50).
 * - Everything else (pre-marital, or gift/inheritance during marriage) is
 *   exclusive property — the decedent's share is the full value.
 */
export function decedentShareOfAsset(asset, maritalRegime) {
  if (isDoubleCountedRealProperty(asset)) return 0;

  const isCommunityAsset = asset.acquisitionTiming === "during_marriage_effort_income";
  const fraction = isCommunityAsset ? communityShareFraction(maritalRegime) : 1.0;

  return asset.value.value * fraction;
}
