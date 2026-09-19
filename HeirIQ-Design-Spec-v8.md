# HeirIQ — Design Specification v8.0
**A self-paced Philippine estate planning discovery & gap assessment tool.**
Owner: Getty Balictar. Standalone product, separate from SparkZight. Built for Claude Code implementation.
*v8 supersedes v7 — adds a "void marriage" branch to Section A (LB-12, distinct from annulment) and a legitimation impediment question to Section B's illegitimate-children flow (LB-11). Both surfaced during a design review of edge cases the discovery flow hadn't accounted for. Legal Basis Appendix is now at v4.0.*

---

## 1. Brand & Identity (Full Rebaseline)

- **Name:** HeirIQ
- **Positioning:** Premium, warm, heirloom-feeling — closer to "a private banker's dossier" or "a family's notarized ledger" than a generic fintech dashboard. Not clinical, not gamified, not cold. HNW/UHNW-oriented.
- **Heritage nod:** the logo mark is built from 家 (Mandarin *jiā*, Hokkien romanized historically as "Chia" — home/family), chosen deliberately to reflect Getty's Chinese-Filipino heritage and to reinforce the "family, home, generational wealth" themes at the core of the product, not as decoration.

### Color palette (rebaselined — replaces the v1–v6 navy/gold table entirely)

| Role | Hex | Usage |
|---|---|---|
| Deep narra | `#5A3A22` | Headers, primary text, the "ink" of the brand — replaces navy as the structural anchor |
| Aged gold | `#B8892E` | CTAs, progress indicators, and the single guiding accent — used sparingly, never as a body-text color |
| Capiz ivory | `#F6F1E7` | Page background |
| Soft narra | `#8A6A52` | Secondary text, labels |
| Hairline | `#E3D7C4` | Dividers, card edges |
| Confirmed tag | `#2E7D6B` | Deep teal — unchanged, still reads as distinct against the warm base |
| Estimated tag | `#7A8B99` | Shifted to a cool slate-blue — deliberately the one cool note in an otherwise all-warm palette, so "needs verification" doesn't visually blend into the gold/brown accents |
| Needs consultation | `#B5651D` | Burnt terracotta — unchanged, never true red |

**Why this replaced the original navy/gold direction:** the earlier palette (navy + gold + warm cream) was flagged during a design review as sitting close to a common generic "AI-premium" default pattern. The narra/gold direction is grounded specifically in this brand — narra wood is the traditional material of Filipino ancestral homes and heirloom furniture, giving the "generational wealth" theme a literal, culturally specific anchor rather than an imported "old money" trope.

### Typography (new — never actually finalized before this revision)

| Role | Typeface | Rationale |
|---|---|---|
| Headers | **Fraunces** (Google Fonts, variable) | A warm editorial serif with soft, rounded terminals — set with the "SOFT" optical axis dialed toward warmth. Chosen deliberately over a literal calligraphy-style or brush-script font: the 家 mark alone carries the Chinese-heritage visual reference, so the typeface's job is to feel warm and considered without attempting to *also* look "Asian" — stacking both risks tipping into cliché. This keeps each element doing one job well. |
| Body / UI / forms | **Source Sans 3** (Google Fonts) | Chosen over the more ubiquitous Inter specifically to avoid the generic-SaaS-default feel — clean and highly legible (important given the audience skews older and this is a long form), with slightly more warmth than a pure geometric/technical sans. |

**Implementation note:** both are free, CDN-loadable via Google Fonts — no licensing cost, no build step required, consistent with the single-file `index.html` architecture already decided in the Build Brief.

### Logo / Icon

- **Mark:** an abstracted, asymmetric calligraphic rendering of 家, in deep narra brown with one gold guiding stroke — final version approved after multiple refinement rounds (roof-stroke asymmetry corrected to match how 宀 is actually brush-written; verified legible at favicon/app-icon scale)
- **Files:** to be exported via a favicon generator (producing the full standard size set — favicon.ico, apple-touch-icon, PWA icon sizes) and added to the repo as a complete package, not a single master image Claude Code is expected to resize itself
- **Usage:** the full lockup (icon + "HeirIQ" wordmark + "Estate Intelligence & Legacy Planning" descriptor + tagline "Your family. A lasting tomorrow.") for marketing/landing contexts; the icon alone for favicon/app-icon/small-space use

- **Attribution:** "by Getty Balictar, Certified Wealth Planner."

---

## 2. Consent Copy — unchanged from v2

See v2 for full Touchpoint 1 and Touchpoint 2 copy; no changes this revision.

---

## 3. Screen-by-Screen Specification

Screens 0, 1, D, E, Results, and Confirmation are unchanged from v2 — see that document for full detail. **Section A (Marital History), Section B (Family Structure), and Section C (Asset Inventory) are updated below.**

### Section A — Marital History & Property Regime (Updated for v8 — adds the void-marriage branch)

- Marital status options: single / married / widowed / annulled / **void** (new) / legally separated — multi-select-capable for a history of more than one state
- Plain-language explainer (unchanged): *"A quick refresher: property you owned before marriage is usually still just yours. Property acquired during marriage is usually considered jointly owned by both spouses — unless you signed a prenuptial agreement saying otherwise."*
- If ever married: marriage date(s), prenuptial agreement (Y/N), regime specified if any — default per **LB-1** if none
- **Branch — void marriage (new, LB-12):** shown only if "void" is selected as a marital history entry, distinct from "annulled." A short explainer precedes the questions: *"A void marriage is different from an annulled one — it means the marriage was never legally valid in the first place, as opposed to one that was valid until a court ended it. This affects both property and how any children are classified."*
  - *"Was this marriage declared void specifically because of psychological incapacity, or for another reason (such as a missing marriage license, a prior existing marriage, or a relationship the law prohibits)?"* → `voidGround: "psychological_incapacity" | "other"` — determines whether children get the Art. 54 automatic-legitimate treatment
  - *"At the time of this marriage, was either of you already validly married to someone else, or otherwise legally barred from marrying the other?"* (Yes / No / Not sure) → `voidImpediment` — determines Art. 147 (no impediment, equal-share default) vs. Art. 148 (impediment existed, user-estimated share flagged for consultation)
- **Branch — remarriage after death of spouse:** unchanged from v2 — *"Was your prior marriage's property formally settled/liquidated before you remarried?"* → **LB-2**
- **Branch — remarriage after annulment:** unchanged from v2 — *"Did the annulment decree find either party in bad faith?"* → **LB-3**
- **Branch — legal separation:** unchanged from v2 — *"Was there a legal separation decree, and did it identify an offending spouse?"* → **LB-4**

### Section B — Family Structure (Updated for v4)

- Legitimate children: label, birth order, **"Is this child currently under 18?"** (Y/N — new for v6, needed for EJS eligibility, see Build Brief §3.5) (up to 10)
- **Adopted children (new):** same fields as legitimate children (label, birth order, under-18 status, up to 10) — a separate array in the data model, but treated identically to legitimate children in the legitime calculation (LB-9). Copy: *"Include any children you've legally adopted — under Philippine law, they have the same inheritance rights as your biological legitimate children."*
- Illegitimate children: label, birth order, under-18 status. Opening question is neutral about whose child it is: *"Do you or your spouse have a child from a previous relationship, or from before this marriage?"* — avoids presuming it's the estate owner's own child. If yes, per child: *"Is this child biologically yours, your spouse's, or both of yours, from before we married?"* — relevance test, LB-5. **If "both of yours, from before we married" is selected (new, LB-11):** a follow-up appears — *"At the time this child was conceived, was either of you already married to someone else?"* (Yes / No / Not sure). **No** → the child was legitimated by the marriage, joins the legitimate/adopted pool. **Yes** → remains illegitimate. **Not sure** → deferred to consultation, same treatment as other uncertain trip-wires. **Note:** if the marriage itself was declared void specifically for psychological incapacity (Section A, LB-12), children conceived/born before that nullity judgment are automatically legitimate regardless of this flow — they should be captured directly as legitimate children, not routed through this section at all.
- Aliases/nicknames supported for privacy (unchanged from v2)
- Trip-wires: predeceased child with descendants (representation), disputed/unrecognized filiation — both deferred, flow continues (unchanged from v2)
- Living legitimate parents (Y/N) — unchanged from v2
- **Trip-wire (new, per Decision #32):** if no legitimate/adopted/illegitimate children, no living spouse, AND no living parents are indicated, show: *"Your situation may involve other relatives as heirs under Philippine law — this needs a direct conversation with Getty rather than an automated estimate."* No computation attempted for this class.

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
| 25 | Per-child minor-status question added to Section B | EJS eligibility depended on this since v1 but the field never actually existed — surfaced by the Claude Code build session itself |
| 26 | Testate floor formula corrected to include adopted children in the divisor | LB-9 was wired into intestate mode only; testate mode was silently excluding adopted children until caught by Test Scenario 5 |
| 27 | Full palette replaced: navy/gold → narra brown/aged gold | Original palette flagged as sitting close to a generic "AI-premium" design default; narra ties specifically to Filipino heirloom material culture |
| 28 | Logo mark built from 家, refined through several rounds to correct roof-stroke asymmetry and verify small-size legibility | Deliberate nod to Getty's Chinese-Filipino heritage; reinforces family/home/generational themes rather than serving as decoration |
| 29 | Typography finalized: Fraunces (headers) + Source Sans 3 (body), never previously locked | Avoids stacking a "looks Asian" typography choice on top of the already-heritage-coded logo mark; avoids the generic Inter/SaaS-default feel for body text |
| 30 | "Void marriage" added as its own marital status, distinct from "annulled" | A void marriage never had ACP/CPG apply at all; folding it into annulment would run the wrong property computation entirely (LB-12) |
| 31 | Legitimation impediment question added to the illegitimate-children flow | "Both of yours, from before we married" is not automatically illegitimate — depends on whether an impediment existed at conception (LB-11) |
| 32 | Collateral-relative succession (siblings/nephews/nieces) and the estate owner's own filiation status excluded, trip-wired instead | Real but low-frequency for the HNW/UHNW target audience; full computation not worth the complexity versus a "needs consultation" flag |

---

## 6. Known, Accepted Limitations for v1

Unchanged from v2 — see that document. Value bands are calibrated to Metro Manila, Baguio, and general PH market data as of this document's writing; they are not location-specific and will need periodic review as markets move. **New this revision:** collateral-relative succession (siblings, nephews, nieces) and the estate owner's own filiation status are flagged via trip-wire only, not computed (Decision #32); simultaneous death/survivorship presumptions and posthumous (en ventre sa mere) children are excluded entirely, not deferred, as settlement-time rather than planning-time concerns.

---

*This spec, together with the Build Brief and Legal Basis Appendix, forms the complete v8 baseline for Claude Code implementation.*
