# HeirIQ — Test Scenarios v2.0
**Five hand-worked scenarios to validate the calculation engine.** v2 adds Scenario 5 (testate mode), which exposed a real gap — the testate floor formula hadn't been updated to include adopted children (LB-9) after that rule was added. Fixed in Build Brief v6, §3.5.

---

## Scenario 1 — Baseline Intestate, No Complications

**Purpose:** validate the core engine end-to-end, and a real gotcha: CPA certification triggers off *gross* estate, even when net tax due is zero.

**Inputs:**
- Marriage: 1995, no prenup → ACP (LB-1)
- No prior marriage, no legal separation/annulment, no will
- Heirs: 2 legitimate children, spouse alive, no illegitimate children
- Assets:
  - Family home, ₱15,000,000, acquired during marriage via effort/income, `natureOfUse: primary_residence`
  - Investment portfolio, ₱6,000,000, acquired during marriage via effort/income
  - Car, ₱1,500,000, acquired before marriage
- No liabilities, no prior gifts, no insurance

**Expected output:**
| Step | Value |
|---|---|
| Family home decedent share (50% community) | ₱7,500,000 |
| Portfolio decedent share (50% community) | ₱3,000,000 |
| Car decedent share (100% exclusive, pre-marital) | ₱1,500,000 |
| **Gross estate** | **₱12,000,000** |
| Standard deduction | ₱5,000,000 |
| Family home deduction | ₱7,500,000 (min of 7.5M actual vs. 10M cap) |
| **Net taxable estate** | **₱0** (deductions exceed gross) |
| **Estate tax** | **₱0** |
| **CPA certification required?** | **YES** — gross estate (₱12M) exceeds ₱5M, regardless of zero tax due |
| EJS eligible? | Yes (no will, no liabilities, no minors) |
| Legitime (intestate, unit method): total units | 2 children × 2 + spouse × 2 = 6 |
| Value per unit | ₱12,000,000 ÷ 6 = ₱2,000,000 |
| **Each legitimate child** | **₱4,000,000** |
| **Spouse** | **₱4,000,000** |
| Sanity check | Both children's entitlements equal ✓ (4M = 4M) |

---

## Scenario 2 — Illegitimate Child, Correctly Scoped Co-Ownership Flag

**Purpose:** validate the unit method with a mixed heir class, and confirm the co-ownership risk flag (LB-7) fires only for the actual family home — not other real estate the same illegitimate child could theoretically claim against.

**Inputs:**
- Marriage: 1990, no prenup → ACP
- Heirs: 2 legitimate children, 1 illegitimate child (`biologicalParent: self`), spouse alive
- Assets:
  - Rental condo, ₱8,000,000, during marriage, `natureOfUse: rental_investment`
  - Family home, ₱10,000,000, during marriage, `natureOfUse: primary_residence`
  - Bank accounts, ₱3,000,000, during marriage
- No liabilities, no prior gifts, no will

**Expected output:**
| Step | Value |
|---|---|
| Rental condo decedent share (50%) | ₱4,000,000 |
| Family home decedent share (50%) | ₱5,000,000 |
| Bank decedent share (50%) | ₱1,500,000 |
| **Gross estate** | **₱10,500,000** |
| Net taxable estate | ₱500,000 (10.5M − 5M standard − 5M family home) |
| **Estate tax** | **₱30,000** |
| Legitime total units | 2 children × 2 + 1 illegitimate × 1 + spouse × 2 = 7 |
| Value per unit | ₱10,500,000 ÷ 7 = ₱1,500,000 |
| **Each legitimate child** | **₱3,000,000** |
| **Illegitimate child** | **₱1,500,000** |
| **Spouse** | **₱3,000,000** |
| Sanity check | Both legitimate children equal ✓ (3M = 3M) — illegitimate child dilutes the pool but never creates inequality *between* the legitimate children themselves |
| **Co-ownership risk flag** | **FIRES** for the family home (illegitimate child + primary residence + intestate) |
| Co-ownership flag on rental condo? | **Does NOT fire** — same illegitimate child, but `natureOfUse` is `rental_investment`, not `primary_residence`. This confirms the flag is correctly scoped, not blanket-applied to all real estate. |

---

## Scenario 3 — Collation Catch-Up, the Corrected Shortfall Case

**Purpose:** this is the scenario that exposed the formula bug. Validates that an unequal lifetime gift between two children is *not* automatically flagged as a violation — and that the real shortfall can surface somewhere else entirely (here, the spouse) once one heir's overpayment can't be clawed back.

**Inputs:**
- Straightforward ACP marriage, no complications
- Heirs: 2 legitimate children, spouse alive, no illegitimate children
- Prior gifts: Child A received ₱10,000,000 (8 years ago); Child B received ₱8,000,000 (5 years ago)
- Remaining net hereditary estate at death: ₱6,000,000
- No will

**Expected output:**
| Step | Value |
|---|---|
| Collated base | ₱6,000,000 (remaining) + ₱10,000,000 (Gift A) + ₱8,000,000 (Gift B) = **₱24,000,000** |
| Total units | 2 children × 2 + spouse × 2 = 6 |
| Value per unit | ₱24,000,000 ÷ 6 = ₱4,000,000 |
| Each heir's gross entitlement | Child A: ₱8,000,000. Child B: ₱8,000,000. Spouse: ₱8,000,000. (Sum = 24M ✓) |
| Child A remaining (8M − 10M already received) | **−₱2,000,000** → flag `gift_exceeds_entitlement`; capped to ₱0 for pool purposes |
| Child B remaining (8M − 8M already received) | ₱0 — exactly satisfied, nothing more owed |
| Spouse remaining (8M − 0 received) | ₱8,000,000 needed |
| Total needed from remaining estate (capped) | ₱0 + ₱0 + ₱8,000,000 = **₱8,000,000** |
| Actual remaining estate available | ₱6,000,000 |
| **Result** | **8,000,000 > 6,000,000 → flag `insufficient_estate_to_equalize` fires**, shortfall of ₱2,000,000 |
| **Key lesson validated** | Child B — who received *less* than Child A — is actually fully satisfied and not the source of the problem. The shortfall falls on the **spouse**, because Child A's earlier overpayment can't be recovered. A naive "compare the two gift amounts" check would have missed this entirely. |

---

## Scenario 4 — Legal Separation Disqualification + Double-Counting Prevention

**Purpose:** validate LB-4 Mechanic B (one-directional spousal disqualification) computes correctly while Mechanic A (net-profit forfeiture) stays a descriptive flag only — combined with the §3.2a double-counting prevention rule for a business-held property.

**Inputs:**
- Marriage: 1985, no prenup → CPG (pre-Aug 1988 default, LB-1)
- Legal separation decree exists; **offending party = spouse** (decedent is the innocent party)
- Heirs: 2 legitimate children, spouse alive but disqualified, no illegitimate children
- Assets:
  - Family home, ₱9,000,000, during marriage, `natureOfUse: primary_residence`
  - Office building, ₱20,000,000, `ownershipStructure: via_business_entity` (held through the family corporation)
  - ABC Family Corp shares (decedent's stake, inclusive of the building's value), ₱12,000,000
  - Bank accounts, ₱3,000,000, during marriage
- No liabilities, no prior gifts, no will

**Expected output:**
| Step | Value |
|---|---|
| Family home decedent share (50%) | ₱4,500,000 |
| Office building | **₱0 counted separately** — excluded per §3.2a; value already represented in the ₱12M share valuation |
| Business shares | ₱12,000,000 (counted once, correctly) |
| Bank decedent share (50%) | ₱1,500,000 |
| **Gross estate** | **₱18,000,000** (4.5M + 0 + 12M + 1.5M — NOT 38M, which is what double-counting the building would have produced) |
| Net taxable estate | ₱8,500,000 (18M − 5M standard − 4.5M family home) |
| **Estate tax** | **₱510,000** |
| Spousal disqualification (LB-4, Mechanic B) | Offending party = spouse → **spouse receives 0 units**, fully excluded |
| Total units | 2 children × 2 + spouse × 0 = 4 |
| Value per unit | ₱18,000,000 ÷ 4 = ₱4,500,000 |
| **Each legitimate child** | **₱9,000,000** (spouse's would-be share reallocates entirely to the children) |
| Net-profit forfeiture (LB-4, Mechanic A) | **Descriptive flag only** — no dollar amount computed or subtracted anywhere above. If the engine ever produces a number for this, that's a bug. |

---

## Scenario 5 — Testate Mode, All Heir Classes at Once

**Purpose:** the scenario that was missing — validates the testate floor calculation (LB-5, Build Brief §3.5), and specifically that adopted children are correctly included in the legitimate-child pool divisor, not silently dropped.

**Inputs:**
- Estate owner **has a will** (`existingWill: true`) → testate mode
- Heirs: 2 legitimate children, **1 adopted child**, 1 illegitimate child (`biologicalParent: self`), spouse alive
- Net hereditary estate (collated base): ₱24,000,000 — no prior gifts, kept simple to isolate the floor formula
- No liabilities

**Expected output — these are guaranteed MINIMUMS only, not the actual will's distribution:**
| Step | Value |
|---|---|
| Legitime pool (1/2 of collated base) | ₱12,000,000 |
| Divisor (legitimate + adopted children — LB-5 + LB-9, no distinction) | 2 + 1 = **3** |
| **Each legitimate child's floor** | **₱4,000,000** |
| **Adopted child's floor** | **₱4,000,000** — sanity check: identical to a legitimate child's, confirming LB-9 is correctly wired into testate mode, not just intestate |
| **Spouse's floor** (equal to one legitimate/adopted child's floor) | **₱4,000,000** |
| **Illegitimate child's floor** (half of a legitimate/adopted child's) | **₱2,000,000** |
| Free portion (testator's discretion — tool does not model actual will content) | ₱6,000,000 |
| Reconciliation check | 4M×2 (legit) + 4M (adopted) + 4M (spouse) + 2M (illegitimate) + 6M (free) = ₱24,000,000 ✓ |
| **Tool output note** | *"These are the minimum amounts your will must give each heir. This tool cannot verify your actual will's distribution — have Getty review your will's terms against this floor."* |

---

## How to Use These

Each scenario should become a literal test case in the Claude Code build — hard-code the inputs, run them through the calculation engine, and assert the expected outputs match exactly. If any scenario produces a different number than shown here, stop and check the formula against `HeirIQ-Legal-Basis-Appendix-v1.md` and `HeirIQ-ClaudeCode-Build-Brief-v3.md` before assuming the test fixture is wrong — these were hand-verified against the corrected v3.1 formulas.
