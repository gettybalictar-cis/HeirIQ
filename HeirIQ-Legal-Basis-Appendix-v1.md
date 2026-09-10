# HeirIQ — Legal Basis Appendix v3.0
**Purpose:** the full citation chain and interpretation behind every branch rule in HeirIQ's calculation engine. The Design Spec and Build Brief reference these entries by their short code (e.g., **LB-4**) rather than re-explaining the law inline. If a rule in the app ever needs to be questioned, defended, or updated, this is the document to check first.

*Grounded in the Civil Code of the Philippines, the Family Code (Executive Order No. 209, as amended), and, where noted, actual Supreme Court decisions — not secondary summaries alone. Verified against primary/official-source text as of this document's writing (Aug 2026).*

*v2 added LB-9 (adopted children's succession rights). v3 adds LB-10 (worldwide estate inclusion for citizens/resident aliens, the basis for capturing foreign-currency assets). Donor's-tax citizenship/situs complexity was explicitly discussed and excluded from scope this round — the estate owner is assumed to be a PH citizen or resident alien throughout; a non-resident-alien estate owner remains out of scope per existing Known Limitations.*

---

## LB-1 — Marital Property Regime Defaults

**Rule:** Absent a valid prenuptial agreement, marriages celebrated on or after August 3, 1988 default to the **Absolute Community of Property (ACP)** regime; marriages before that date default to the **Conjugal Partnership of Gains (CPG)**.

**Basis:** Family Code, Art. 75 (default regime when no marriage settlement exists), read together with the Code's effectivity date.

**Interpretation:** This is the threshold question for every other computation — until the regime is known, it's impossible to say what fraction of any asset belongs to the decedent at all.

**Used in:** Build Brief §3.1 (Property Regime Resolution).

---

## LB-2 — Forced Separation on Remarriage After Death, Without Liquidation

**Rule:** If a surviving spouse remarries **without first liquidating** the community/conjugal property from the terminated first marriage, the **subsequent marriage is automatically governed by a mandatory regime of complete separation of property** — regardless of what the couple might have otherwise agreed or intended.

**Basis:** Family Code, Art. 103 (last paragraph), mirrored for the conjugal partnership regime in Art. 130.

**Interpretation:** This is a real, self-executing legal penalty for a very common real-world failure (many widowed people remarry without ever formally settling the first marriage's property). It's fully computable from a single yes/no/not-sure question, with no valuation data required.

**Used in:** Design Spec, Section A branch question; Build Brief §3.1 (`regime_override = "forced_separation"`).

---

## LB-3 — Annulment in Bad Faith: Forfeiture & Disqualification

**Rule:** When a voidable marriage is annulled, if either spouse contracted the marriage in bad faith, that spouse's share of the **net profits** of the community/conjugal property is forfeited to the common children (or, if none, the innocent spouse). Separately, the bad-faith spouse is **disqualified from inheriting from the innocent spouse**, by both testate and intestate succession.

**Basis:** Family Code, Art. 43(5), extended to Art. 45 annulments via Art. 50.

**Interpretation:** Two distinct mechanics, same as legal separation (see LB-4) — a lifetime property-liquidation event, and a separate, one-directional succession disqualification. The disqualification only bars the bad-faith party from inheriting from the innocent one — never the reverse.

**Used in:** Design Spec, Section A branch question; Build Brief §3.7 (succession-level flag).

---

## LB-4 — Legal Separation: Two Mechanics, Not One

**Rule, Mechanic A (property liquidation):** On a decree of legal separation, the offending spouse forfeits their claim to the **"net profits"** of the community/conjugal property — legally defined as the *increase in the property's value between the time the marriage was celebrated and the time of dissolution* (i.e., the appreciation only, not the entire pool).

**Rule, Mechanic B (succession disqualification):** The offending spouse is disqualified from inheriting from the **innocent** spouse by intestate succession, and any will provision favoring them is revoked by operation of law. This bar runs **one direction only** — it does not stop the innocent spouse from inheriting from the offending one.

**Basis:** Family Code, Art. 63(2) and 63(4); the "net profits" definition is set out in Art. 102(4) (for ACP) and cross-applied to CPG via Art. 129. The appreciation-based definition of "net profits" was directly applied by the Supreme Court in ***Quiao v. Quiao***, G.R. No. 176556 (2013).

**Interpretation:** Mechanic A requires the community property's value **at the time of the marriage** — often decades-old, rarely available to a self-service tool — so it should be treated as a **descriptive flag**, not a computed figure. Mechanic B needs no historical valuation and is **fully computable** from a single question about which party was found offending.

**Used in:** Design Spec, Section A branch question; Build Brief §3.7 (Mechanic B computable; Mechanic A descriptive-only).

---

## LB-5 — Legitime: Intestate "Unit Method" vs. Testate "Floor + Free Portion"

**These are two different frameworks and must not be blended.**

**Intestate (no will) — the default case for most HeirIQ users:** the entire estate is divided using a proportional **unit method**: each legitimate child = 2 units, each illegitimate child = 1 unit, the surviving spouse (when concurring with legitimate children) = 2 units. Total estate ÷ total units = value per unit. This guarantees, by construction, that **all legitimate children of the decedent receive exactly equal shares to one another** — no room for a will-like favoritism to exist without a will.

**Testate (a will exists):** legitimate children collectively receive a fixed **legitime floor of 1/2 the estate**, split equally among them; the spouse and illegitimate children draw their shares from the remaining **free portion**, in that priority order; anything left in the free portion may be assigned by the testator however they choose, as long as no heir falls below their individual legitime floor.

**Basis:** Civil Code Arts. 887, 888 (legitimate children's 1/2 pool), 892 & 996 (spousal share equal to a legitimate child's), 895 (illegitimate child = half a legitimate child's share), 999 (concurrence rules); confirmed against current practitioner computations and the 1965 Supreme Court case *Santillon v. Miranda* (on the Art. 996 vs. Art. 892 distinction).

**Interpretation:** Since HeirIQ's target users are, by definition, people who haven't done formal estate planning yet, **intestate (unit method) should be the default computation mode.** Testate mode should only ever compute the **guaranteed minimum floor** per heir — the tool cannot verify an actual will's terms, since it doesn't capture the will's content as an input.

**Used in:** Build Brief §3.6 (full rewrite — replaces the earlier free-portion-only formula).

---

## LB-6 — Collation, Including the Catch-Up Mechanic

**Rule:** Lifetime donations to a compulsory heir are treated as **advances on that heir's inheritance**, added back (fictitiously, not physically) into the estate's value for legitime purposes. Valuation is frozen at the **time of the donation**, not current market value. Each heir's full lifetime entitlement (gift + eventual inheritance) is computed as equal to what they'd have received without the gift; whatever they already received via gift is then subtracted from their remaining share at death.

**Basis:** Civil Code Arts. 1061, 1071; the frozen-valuation rule confirmed in *Vizconde v. CA*, G.R. No. 118449 (1998).

**Interpretation, the catch-up mechanic:** an unequal lifetime gift between two children (e.g., ₱10M to one, ₱8M to another) is **not automatically a legitime violation** — the child who received less should receive correspondingly more from what remains at death, to reach parity. The real violation only surfaces if the remaining estate is **too small to complete that catch-up** — that's the actual condition to flag, not the raw gift-value gap.

**Used in:** Build Brief §3.6 (per-heir remaining-entitlement calculation); Results screen (stacked bar: gift-received + remaining-inheritance, per heir).

---

## LB-7 — Estate Partition to Avoid Forced Co-Ownership

**Rule:** A person may partition their own estate — by an act during their lifetime, or by will — assigning specific assets to specific heirs, **as long as no heir's legitime is impaired in value.** The law does not require every heir to receive a literal physical share of every asset; it requires their legitime's *value* to be respected.

**Basis:** Civil Code Art. 1080.

**Interpretation:** This is the actual legal remedy for a common, uncomfortable scenario: preventing an heir the family wants to keep at arm's length (e.g., an unacknowledged or estranged heir) from becoming a literal co-owner of a specific asset like the family home. It only works if the estate has **enough other value** to fully satisfy that heir's legitime elsewhere — otherwise, a physical co-ownership share, or a negotiated post-death buyout, remains necessary.

**Used in:** Results screen, "directional fix" category for any flag involving an heir the family may wish to keep separate from a specific asset (e.g., an illegitimate or estranged heir concurring with the family home).

---

## LB-8 — No Pre-Death Waivers of Future Inheritance

**Rule:** Contracts over a **future inheritance** are void. A compulsory heir cannot validly waive or sell their legitime while the person they'd inherit from is still alive. A valid renunciation can only happen **after** death, once succession has actually opened, and must be gratuitous (not bargained for) to avoid being treated as a disguised sale.

**Basis:** Civil Code Art. 1347 (contracts on future inheritance are void, except as expressly authorized — e.g., Art. 1080 partitions); Art. 1049 (renunciation only valid post-death).

**Interpretation:** This closes off a tempting but unavailable shortcut — a family cannot simply get a difficult or unwelcome heir to sign away their claim in advance. Any resolution has to either restructure the estate before death (LB-7) or negotiate a settlement after death.

**Used in:** Results screen, ruling out "get them to waive it now" as a suggested category of resolution — this should never appear as a directional fix.

---

## LB-9 — Adopted Children's Succession Rights

**Rule:** An adopted child has full reciprocal succession rights with the adopter, "without distinction from legitimate filiation" — meaning an adopted child's legitime is legally identical to a biological legitimate child's, in both testate and intestate succession. Adoption also generally severs the child's inheritance rights from their biological parents, subject to a narrow exception.

**Basis:** Republic Act No. 8552 (Domestic Adoption Act, 1998), §18; Republic Act No. 11642 (Domestic Administrative Adoption and Alternative Child Care Act, 2022), §43; Civil Code Art. 979; confirmed in *In re: Lim (Adoption)*, G.R. Nos. 168992-93 (2009).

**Interpretation:** For HeirIQ's purposes — which only ever computes the *estate owner's own* estate, never a third party's — the severance-from-biological-parents nuance doesn't require a separate data field. An adopted child simply joins the same unit pool as legitimate children in the intestate unit method (2 units each, no distinction), and shares the same 1/2 legitime pool in testate mode.

**Used in:** Build Brief §2 (Data Model — `adoptedChildren` array), §3.6 (unit method — adopted children join the legitimate-child pool at 2 units each).

---

## LB-10 — Worldwide Estate Inclusion for Citizens and Resident Aliens

**Rule:** For a decedent who is a **Philippine citizen** (resident or non-resident — including OFWs and dual citizens who retain PH citizenship) or a **resident alien** (a foreign national actually domiciled in the Philippines), the gross estate includes **all property, real or personal, tangible or intangible, wherever situated** — worldwide, regardless of where a specific asset is physically or financially kept. This differs only for a **non-resident alien** decedent (a foreign national not domiciled in the PH), whose gross estate is limited to Philippine-situs property, subject to a reciprocity exception for certain intangibles.

**Basis:** NIRC §85, as amended by TRAIN (RA 10963).

**Interpretation:** This is the citation that justifies why HeirIQ captures foreign-currency accounts and offshore investments at all, and why it doesn't need to ask about asset location once nationality/residency is established — for the assumed PH citizen/resident-alien estate owner, "kept offshore" has no bearing on inclusion. The tool assumes this classification throughout; a non-resident-alien estate owner (a foreign national not domiciled in the PH) remains out of scope, consistent with the existing exclusion of foreign-situs/dual-citizenship complexity in Known Limitations. Donor's-tax situs rules for the estate owner's own lifetime gifts (a related but distinct question under NIRC §98/§104) were discussed and explicitly excluded from this round's scope.

**Used in:** Design Spec Section C3 (foreign-currency entry and conversion); Build Brief §2 (currency field on Financial Accounts), §3.3 (Gross Estate — no situs filtering applied, full converted value counted).

---

## Quick Reference Table

| Code | Topic | Computable in v1? |
|---|---|---|
| LB-1 | Marital regime default | Yes — fully computable |
| LB-2 | Forced separation on remarriage after death | Yes — fully computable |
| LB-3 | Annulment bad faith — forfeiture & disqualification | Disqualification: yes. Forfeiture: descriptive flag only |
| LB-4 | Legal separation — two mechanics | Disqualification: yes. Net-profit forfeiture: descriptive flag only |
| LB-5 | Legitime — intestate vs. testate | Intestate: yes, primary mode. Testate: floor only, not full verification |
| LB-6 | Collation & catch-up | Yes — fully computable given gift value + date |
| LB-7 | Partition to avoid co-ownership | Not computed — surfaced as a directional-fix category only |
| LB-8 | No pre-death waivers | Not computed — used to exclude an invalid "fix" from ever being suggested |
| LB-9 | Adopted children's succession rights | Yes — fully computable, joins the legitimate-child unit pool |
| LB-10 | Worldwide estate inclusion for citizens/resident aliens | Yes — no situs filtering needed; foreign currency converted and counted in full |
