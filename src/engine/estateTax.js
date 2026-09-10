// NIRC §84 (TRAIN, RA 10963) flat estate tax; NIRC §90(A) CPA certification threshold.
import { ESTATE_TAX_RATE, CPA_CERTIFICATION_THRESHOLD } from "./constants.js";

export function calculateEstateTax(netTaxableEstate) {
  return netTaxableEstate * ESTATE_TAX_RATE;
}

/**
 * Triggers off GROSS estate, independent of whether net tax due is zero
 * (Test Scenario 1 — the deliberate gotcha).
 */
export function requiresCPACertification(grossEstate) {
  return grossEstate > CPA_CERTIFICATION_THRESHOLD;
}
