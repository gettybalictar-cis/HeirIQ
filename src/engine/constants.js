// HeirIQ calculation engine — shared constants.
// See HeirIQ-Legal-Basis-Appendix-v1.md (content is v3.0) for the citation behind each value.

// NIRC §86(A)(1), as amended by TRAIN (RA 10963) — flat standard deduction.
export const STANDARD_DEDUCTION = 5_000_000;

// Build Brief §3.4 — family home deduction is capped regardless of the home's actual value.
export const FAMILY_HOME_DEDUCTION_CAP = 10_000_000;

// NIRC §84, as amended by TRAIN (RA 10963) — flat estate tax rate.
export const ESTATE_TAX_RATE = 0.06;

// NIRC §90(A) — a CPA-certified statement is required once gross estate exceeds this
// threshold, independent of whether any tax is actually due (Test Scenario 1).
export const CPA_CERTIFICATION_THRESHOLD = 5_000_000;

// LB-5 / Build Brief §3.6 — intestate "unit method" weights.
export const UNITS = {
  legitimateChild: 2,
  adoptedChild: 2, // LB-9 — joins the legitimate-child pool, no distinction.
  illegitimateChild: 1,
  spouse: 2,
};

// LB-1 — Family Code effectivity date; the threshold for the ACP/CPG default regime split.
export const ACP_EFFECTIVE_DATE = "1988-08-03";

// Marital regimes that carry an automatic 50/50 community-property split at death.
export const COMMUNITY_REGIMES = new Set(["ACP", "CPG"]);
