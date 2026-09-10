// Build Brief §3.2b — Foreign Currency Conversion (new for v5, LB-10).
//
// Frankfurter is a free, no-API-key currency API; for PHP it sources BSP's published
// reference rates. This call transmits NO personal data — only the currency pair,
// identical for every user (Design Spec §4 privacy note).
//
// `fetchImpl` is injectable so this stays unit-testable without a live network call;
// it defaults to the global `fetch`.

const FRANKFURTER_URL = (currency) => `https://api.frankfurter.dev/v1/latest?from=${currency}&to=PHP`;

/**
 * Converts a single financial asset's foreign-currency entry to its PHP equivalent.
 * Never throws and never blocks the flow — a failed fetch falls back to prompting
 * the client for manual entry, per the Design Spec's explicit "never blocks" rule.
 */
export async function convertForeignCurrencyAsset(asset, { fetchImpl = fetch } = {}) {
  if (!asset.currency || asset.currency === "PHP") {
    return asset;
  }

  try {
    const response = await fetchImpl(FRANKFURTER_URL(asset.currency));
    if (!response.ok) throw new Error(`rate fetch failed with status ${response.status}`);

    const data = await response.json();
    const rate = data?.rates?.PHP;
    if (typeof rate !== "number") throw new Error("rate fetch returned no PHP rate");

    return {
      ...asset,
      fxRate: rate,
      fxRateDate: data.date,
      fxRateSource: "BSP",
      value: { value: asset.originalAmount * rate, confidence: "estimated" },
    };
  } catch {
    // Offline / API down: never block the flow — ask the client to type the PHP
    // equivalent manually instead. If they already have (asset.value.value set),
    // preserve it; otherwise flag that manual entry is still needed.
    return {
      ...asset,
      fxRate: null,
      fxRateDate: null,
      fxRateSource: "manual_entry",
      value: {
        value: asset.value?.value ?? null,
        confidence: "estimated",
      },
      needsManualConversion: asset.value?.value == null,
    };
  }
}
