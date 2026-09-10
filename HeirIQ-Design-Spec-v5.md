# HeirIQ — Design Specification v5.0
**A self-paced Philippine estate planning discovery & gap assessment tool.**
Owner: Getty Balictar. Standalone product, separate from SparkZight. Built for Claude Code implementation.
*v5 supersedes v4 — adds foreign-currency entry and automatic peso conversion for Financial Accounts (LB-10). Legal citations referenced by short code (e.g. **LB-4**) point to `HeirIQ-Legal-Basis-Appendix-v1.md`, now at v3.0.*

---

## 1. Brand & Identity

- **Name:** HeirIQ
- **Positioning:** Premium, trustworthy, techy-but-approachable. Not clinical, not gamified. HNW/UHNW-oriented — every design choice, including value bands, should read as knowledgeable about this client tier, not generic.
- **Color palette (finalized):**

| Role | Hex | Usage |
|---|---|---|
| Primary navy | `#1B2A4A` | Headers, primary text, trust anchor |
| Accent gold | `#C08A28` | CTAs and progress indicators only |
| Charcoal text | `#2B2B2B` | Body copy |
| Warm cream | `#FBF8F2` | Page background |
| Slate gray | `#6B7280` | Secondary text, labels |
| Hairline border | `#E2E5EA` | Dividers, card edges |
| Confirmed tag | `#2E7D6B` | Deep teal — confirmed gaps |
| Estimated tag | `#D8A64B` | Amber — needs verifying |
| Needs consultation | `#B5651D` | Burnt terracotta — deferred items (never true red) |

- **Logo:** Deferred.
- **Attribution:** "by Getty Balictar, Certified Wealth Planner."

---

## 2. Consent Copy — unchanged from v2

See v2 for full Touchpoint 1 and Touchpoint 2 copy; no changes this revision.

---

## 3. Screen-by-Screen Specification

Screens 0, 1, A, D, E, Results, and Confirmation are unchanged from v2 — see that document for full detail. **Section B (Family Structure) and Section C (Asset Inventory) are updated below.**

### Section B — Family Structure (Updated for v4)

- Legitimate children: label, birth order (up to 10)
- **Adopted children (new):** same fields as legitimate children (label, birth order, up to 10) — a separate array in the data model, but treated identically to legitimate children in the legitime calculation (LB-9). Copy: *"Include any children you've legally adopted — under Philippine law, they have the same inheritance rights as your biological legitimate children."*
- Illegitimate children: label, birth order, qualifying question ("Is this child biologically yours, your spouse's, or both of yours?" — relevance test, LB-5)
- Aliases/nicknames supported for privacy (unchanged from v2)
- Trip-wires: predeceased child with descendants (representation), disputed/unrecognized filiation — both deferred, flow continues (unchanged from v2)
- Living legitimate parents (Y/N) — unchanged from v2

### Section C — Asset Inventory (Finalized)

**General scope note (unchanged):** *"Please include assets in your name, your spouse's name, or jointly held — we'll sort out ownership classification with the next question."*

Each of the five asset categories below pairs a **dropdown band** (tagged `estimated`) with a **free-text exact-entry field** (tagged `exact`) — the user can always type a precise figure instead of picking a band.

#### C1. Real Estate

**Explainer:** *"Include any land, house, condominium, or commercial property you or your spouse own."*

| Value band |
|---|
| Under ₱2M |
| ₱2M – ₱5M |
| ₱5M – ₱10M |
| ₱10M – ₱20M |
| ₱20M – ₱50M |
| ₱50M – ₱100M |
| ₱100M+ |
| Not sure / Skip |

*(Bands grounded in current Metro Manila and Baguio market data — see build notes for sourcing.)*

**Nature of use** (new — required per property):
- Primary residence
- Rental or investment property
- Commercial property
- Agricultural or vacant land
- Other

This determines Family Home deduction eligibility (Build Brief §3.4) and whether the co-ownership risk flag (LB-7) applies — that flag only makes sense for a primary residence, not a rental unit.

**Ownership structure** (new — required per property): *"Is this property owned directly by you or your spouse, or by a corporation/partnership you hold shares in?"*
- Directly owned
- Owned via a business entity I hold shares in

If "via a business entity," the property is **excluded from the Real Estate total** — its value is already represented under Business/Corporate Shares below. This prevents double-counting the same asset once as real estate and again inside a business valuation.

#### C2. Vehicles

**Explainer:** *"Include cars, motorcycles, or other titled vehicles you or your spouse own personally — not company-titled vehicles, which are typically part of a business's own assets."*

| Value band |
|---|
| Under ₱1M |
| ₱1M – ₱2M |
| ₱2M – ₱4M |
| ₱4M – ₱8M |
| ₱8M+ |
| Not sure / Skip |

*(Grounded in current PH new-vehicle pricing, entry sedans through luxury/exotic tiers.)*

#### C3. Financial Accounts (Bank & Investments)

**Explainer:** *"Include savings and time deposit accounts, stocks and mutual funds, UITFs, bonds, and other investment holdings. If you own shares in your own or your family's privately-held business, that's a separate category below — not here."*

**Foreign currency entry (new for v5):** Each entry offers a currency selector (PHP default, plus USD, EUR, JPY, SGD, AUD, GBP). If a foreign currency is selected, the client enters the amount in that currency directly — the tool fetches the day's reference rate and displays the computed peso equivalent live, so the client never has to do the conversion themselves. Copy: *"You can enter this in the currency you actually hold it in — we'll convert it to pesos for you."* Below the converted figure: *"Converted using the [date] BSP reference rate — the actual value may differ slightly by the time of settlement."* If the rate fetch fails (e.g., no connection), the client can type the peso equivalent manually instead — the flow never blocks on this.

| Value band |
|---|
| ₱1M – ₱5M |
| ₱5M – ₱10M |
| ₱10M – ₱15M |
| ₱15M+ |
| Not sure / Skip |

*(No sub-₱1M band — deliberately, to match HNW/UHNW positioning; a precise smaller figure remains fully capturable via the exact-entry field. Value bands apply to the converted peso amount regardless of original currency.)*

#### C4. Business/Corporate Shares

**Explainer:** *"This is different from publicly-traded stocks (which go under Financial Accounts above). This refers to your ownership stake in a privately-held business — a family corporation, partnership, or sole proprietorship not listed on the stock exchange."*

**Probe-first gate:** *"Do you or your family own shares in a privately-held business (not publicly traded on the stock exchange)?"* Only if yes, show:

| Value band |
|---|
| Under ₱2M |
| ₱2M – ₱5M |
| ₱5M – ₱10M |
| ₱10M – ₱20M |
| ₱20M – ₱50M |
| ₱50M+ |
| Not sure / Skip |

Followed by valuation method (book value / last transaction / par value / not sure), tagged "Estimated — independent appraisal likely required."

#### C5. Personal Property (jewelry, collectibles, valuables)

| Value band |
|---|
| Under ₱100K |
| ₱100K – ₱500K |
| ₱500K – ₱1M |
| ₱1M – ₱3M |
| ₱3M – ₱5M |
| ₱5M+ |
| Not sure / Skip |

#### Liabilities/debts against the estate — unchanged from v2.

---

## 4. Cross-Cutting Rules

Unchanged from v2, plus:

- **Double-counting prevention:** a real property tagged "owned via a business entity" is excluded from the Real Estate total and represented only under Business/Corporate Shares. This check runs automatically at the calculation-engine level (Build Brief §3.2a) — the user never sees a warning, the tool simply doesn't ask them to enter the same value twice.
- **Currency conversion rule tightened (new for v5):** the earlier "no data transmission before Touchpoint 2" rule is now stated precisely: *no personal data* is transmitted before final consent — a currency exchange rate may be fetched from a public rate source, but this call carries no information about the client whatsoever. This distinction is disclosed in the Touchpoint 1 privacy notice.

All other cross-cutting rules (confidence tagging, 10-child cap, local save-and-resume, trip-wire behavior, product-naming exception, gifting-opportunity bias) are unchanged from v2.

---

## 5. Decision Log

Decisions 1–17 unchanged from v2. New this revision:

| # | Decision | Rationale |
|---|---|---|
| 18 | Separate value-band sets per asset category, not one shared generic set | Each category's real market range differs too much for one set to feel credible (e.g. real estate vs. personal property) |
| 19 | Financial Accounts bands start at ₱1M, no sub-₱1M option | HNW/UHNW positioning — a starting band below ₱1M undercuts the tool's target-audience credibility |
| 20 | Real estate requires nature-of-use and ownership-structure sub-questions | Feeds Family Home deduction eligibility, the LB-7 co-ownership flag, and prevents double-counting entity-held property |
| 21 | Adopted children added as a distinct heir category, joining the legitimate-child unit pool | Full reciprocal succession rights confirmed under RA 8552/RA 11642 (LB-9); real gap in the prior data model |
| 22 | Disinheritance-intent flag, joint-account explainer, reserva troncal trip-wire — evaluated, deferred | Retirement benefits dropped entirely (low HNW/UHNW relevance); the other three deprioritized this round, not ruled out permanently |
| 23 | Foreign currency accounts captured in native currency, auto-converted to PHP via BSP reference rate | Matches worldwide estate inclusion (LB-10) for the assumed PH citizen/resident-alien estate owner; easier and more accurate for clients to enter in the currency they actually think in |
| 24 | Donor's-tax citizenship/situs complexity excluded from scope | Real but genuinely separate rule set (NIRC §98/§104); deferred alongside the existing dual-citizenship exclusion |

---

## 6. Known, Accepted Limitations for v1

Unchanged from v2 — see that document. Value bands are calibrated to Metro Manila, Baguio, and general PH market data as of this document's writing; they are not location-specific and will need periodic review as markets move.

---

*This spec, together with the Build Brief and Legal Basis Appendix, forms the complete v3 baseline for Claude Code implementation.*
