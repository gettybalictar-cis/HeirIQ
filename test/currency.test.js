import { describe, it, expect, vi } from "vitest";
import { convertForeignCurrencyAsset } from "../src/engine/currency.js";

describe("§3.2b Foreign Currency Conversion", () => {
  it("passes PHP assets through unchanged", async () => {
    const asset = { currency: "PHP", value: { value: 1_000_000, confidence: "exact" } };
    const result = await convertForeignCurrencyAsset(asset);
    expect(result).toBe(asset);
  });

  it("converts using the fetched rate and tags the result as estimated", async () => {
    const asset = { currency: "USD", originalAmount: 10_000, value: { value: null, confidence: null } };
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { PHP: 56.5 }, date: "2026-09-10" }),
    });

    const result = await convertForeignCurrencyAsset(asset, { fetchImpl });

    expect(fetchImpl).toHaveBeenCalledWith("https://api.frankfurter.dev/v1/latest?from=USD&to=PHP");
    expect(result.value.value).toBe(565_000);
    expect(result.value.confidence).toBe("estimated");
    expect(result.fxRate).toBe(56.5);
    expect(result.fxRateDate).toBe("2026-09-10");
    expect(result.fxRateSource).toBe("BSP");
  });

  it("never blocks the flow on a failed fetch — falls back to manual entry", async () => {
    const asset = { currency: "EUR", originalAmount: 5_000, value: { value: null, confidence: null } };
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await convertForeignCurrencyAsset(asset, { fetchImpl });

    expect(result.fxRateSource).toBe("manual_entry");
    expect(result.value.confidence).toBe("estimated");
    expect(result.needsManualConversion).toBe(true);
  });

  it("preserves a manually-typed PHP equivalent when the fetch fails", async () => {
    const asset = { currency: "GBP", originalAmount: 2_000, value: { value: 145_000, confidence: "exact" } };
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await convertForeignCurrencyAsset(asset, { fetchImpl });

    expect(result.value.value).toBe(145_000);
    expect(result.needsManualConversion).toBe(false);
  });
});
