// Build Brief §3.3 — Gross Estate. LB-10: worldwide inclusion, no situs filtering —
// a converted foreign-currency asset's PHP value counts in full, same as any other.
import { decedentShareOfAsset } from "./assets.js";

export function calculateGrossEstate(assets, maritalRegime) {
  return assets.reduce((sum, asset) => sum + decedentShareOfAsset(asset, maritalRegime), 0);
}
