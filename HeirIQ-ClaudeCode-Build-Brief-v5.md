# HeirIQ — Claude Code Build Brief v5.0
**Translating the design spec into architecture, data model, calculation logic, and build sequence.**
*v5 supersedes v4 — adds foreign-currency entry with BSP-rate conversion for Financial Accounts (LB-10). Legal Basis Appendix is now at v3.0 — see `HeirIQ-Legal-Basis-Appendix-v1.md` (filename retained, content updated).*

---

## 1. Architecture Decisions — unchanged from v2, one addition

See v2 for the full table. **New for v5:** the "no data transmission before Touchpoint 2" architecture principle now has one narrow, disclosed exception — a currency-conversion rate lookup (Frankfurter API, §3.2b), which carries no personal data. Everything else in the original architecture table (framework, hosting, backend, access control, email sender, PDF generation, state persistence, analytics) is unchanged.

See v2 for full table (framework, hosting, backend, access control, email sender, PDF generation, state persistence, analytics). No changes this revision.

---

## 2. Data Model — Heirs and Assets Sections Updated

### 2a. Heirs (updated for v4 — adds `adoptedChildren`)

```js
heirs: {
  legitimateChildren: [{ id, label, birthOrder }],    // max 10
  adoptedChildren: [{ id, label, birthOrder }],       // NEW, max 10 — LB-9, joins legitimateChildren's unit pool, see §3.6
  illegitimateChildren: [{ id, label, birthOrder, biologicalParent: "self" | "spouse" | "both" }],  // LB-5
  livingParents: bool,
  hasPredeceasedChildWithDescendants: bool,
  hasDisputedFiliationClaim: bool
}
```

### 2b. Assets — unchanged from v3, see below

```js
assets: [
  {
    id,
    category: "real_property" | "financial" | "business_shares" | "vehicle" | "personal",
    description,
    value: {value, confidence},           // confidence: "exact" | "estimated" | "default"
    acquisitionTiming: "before_marriage" | "during_marriage_gift_inheritance" | "during_marriage_effort_income",

    // real_property only:
    isFamilyHome: bool,
    natureOfUse: "primary_residence" | "rental_investment" | "commercial" | "agricultural_vacant" | "other" | null,
    ownershipStructure: "direct" | "via_business_entity" | null,
    // if ownershipStructure == "via_business_entity", this asset is EXCLUDED from the
    // real-estate total at calculation time — its value is already captured under the
    // corresponding business_shares entry. See §3.2a.

    // business_shares only:
    businessValuationMethod: "book_value" | "last_transaction" | "par_value" | "not_sure" | null,

    // financial only (new for v5, LB-10):
    currency: "PHP" | "USD" | "EUR" | "JPY" | "SGD" | "AUD" | "GBP",  // default "PHP"
    originalAmount: number,        // amount as entered, in `currency`
    fxRate: number | null,         // rate used, if currency != "PHP"
    fxRateDate: string | null,     // date of the rate fetched, for transparency
    fxRateSource: "BSP" | "manual_entry" | null   // "manual_entry" if fetch failed and client typed the PHP equivalent directly
    // value.value is always the computed/entered PHP equivalent — everything downstream
    // (gross estate, deductions, legitime) operates on this PHP figure only.
  }
]
```

**Finalized dropdown value bands** (UI-layer reference data — see Design Spec §3 for full explainer copy):

```js
const VALUE_BANDS = {
  real_property: ["Under 2M", "2M-5M", "5M-10M", "10M-20M", "20M-50M", "50M-100M", "100M+"],
  vehicle:       ["Under 1M", "1M-2M", "2M-4M", "4M-8M", "8M+"],
  financial:     ["1M-5M", "5M-10M", "10M-15M", "15M+"],      // no sub-1M band — HNW positioning
  business_shares: ["Under 2M", "2M-5M", "5M-10M", "10M-20M", "20M-50M", "50M+"],
  personal:      ["Under 100K", "100K-500K", "500K-1M", "1M-3M", "3M-5M", "5M+"]
};
// Every band pairs with a free-text exact-entry field; dropdown selection tags
// confidence = "estimated", typed entry tags confidence = "exact".
// Every category also includes a "Not sure / Skip" option.
```

---

## 3. Calculation Engine — One New Rule Added

### 3.2a Double-Counting Prevention (new)

Runs immediately after asset entry, before §3.2 (Asset Ownership Split):

```
for each asset where category == "real_property" AND ownershipStructure == "via_business_entity":
    exclude this asset from the real-property total used in gross estate (§3.3)
    // its value is already represented via the corresponding business_shares asset entry
    // do NOT surface this as a warning or error to the user — it's a silent, correct exclusion
```

### 3.2b Foreign Currency Conversion (new for v5, LB-10)

Runs at the point of entry for any `financial` asset where `currency != "PHP"`:

```
on asset entry, if currency != "PHP":
    try:
        rate = fetch(`https://api.frankfurter.dev/v1/latest?from=${currency}&to=PHP`)
        // Frankfurter is a free, no-API-key currency API; for PHP it sources BSP's
        // published reference rates. This call transmits NO personal data — only the
        // currency pair, identical for every user. See Design Spec §4 for the privacy
        // note this requires in the consent copy.
        asset.value.value = asset.originalAmount * rate
        asset.fxRate = rate
        asset.fxRateDate = today's date
        asset.fxRateSource = "BSP"
        asset.value.confidence = "estimated"   // a converted figure is inherently an estimate
    except (fetch fails — offline, API down):
        prompt the client to type the PHP equivalent manually instead
        asset.fxRateSource = "manual_entry"
        asset.value.confidence = "estimated"
        // never block the flow on a failed fetch
```

### 3.4 Family Home Deduction — clarified dependency

```
familyHomeDeduction = min(familyHomeAsset.value * decedentShare, 10,000,000)
    if any asset.isFamilyHome == true AND asset.natureOfUse == "primary_residence"
    else 0
// natureOfUse is now a required gate — a rental or commercial property can never
// qualify for this deduction regardless of how isFamilyHome is (mis)tagged.
```

### 3.8 Co-Ownership Risk Flag — clarified dependency

```
if (illegitimate child exists AND biologicalParent includes "self")
   AND (an asset is tagged isFamilyHome == true AND natureOfUse == "primary_residence")
   AND (mode == "intestate" OR (mode == "testate" AND no Art. 1080-style partition indicated)):
    emit flag("family_home_co_ownership_risk")
// unchanged in substance from v2 — natureOfUse now makes the "family home" condition
// explicit and reliable rather than relying on isFamilyHome alone.
```

### 3.6, Step 2 — Intestate Unit Method — UPDATED for v4 (adds adopted children, LB-9)

```
netHereditaryEstate = decedent's exclusive assets + decedent's community share
collatedBase = netHereditaryEstate + sum(priorGifts.valueAtTimeOfGift where recipient is a compulsory heir)

units.legitimateChild = 2   // each
units.adoptedChild = 2      // each — NEW, LB-9: joins the legitimate-child pool, no distinction
units.illegitimateChild = 1 // each, only if biologicalParent includes "self"
units.spouse = 2            // only if spouse survives AND is not disqualified (LB-3, LB-4)

totalUnits = (2 * count(legitimateChildren)) + (2 * count(adoptedChildren))
           + (1 * count(illegitimateChildren where biologicalParent includes "self"))
           + (spouse eligible ? 2 : 0)
valuePerUnit = collatedBase / totalUnits

each legitimate OR adopted child's gross entitlement = 2 * valuePerUnit
each illegitimate child's gross entitlement = 1 * valuePerUnit
spouse's gross entitlement (if eligible) = 2 * valuePerUnit

// sanity check: all legitimate AND adopted children's gross entitlements MUST be equal
// to one another (same 2-unit weighting) — if not, this is a bug, flag for review.
```

### 3.6, Step 3 — Collation Catch-Up (LB-6) — CORRECTED, supersedes v2

A bug was found while hand-working Test Scenario 3 (see `HeirIQ-Test-Scenarios-v1.md`): the v2 formula summed `remainingEntitlement` across all heirs without flooring negative values at zero first. Algebraically, that sum always equals the actual remaining estate exactly — meaning the shortfall flag below could **never fire**, regardless of how depleted the estate was by an earlier overpayment to one heir.

```
for each compulsory heir:
    alreadyReceived = sum(their priorGifts.valueAtTimeOfGift)
    remainingEntitlement = heir.grossEntitlement - alreadyReceived
    if remainingEntitlement < 0:
        flag("gift_exceeds_entitlement", heir)  // informational — heir already received more than their share
        cappedRemainingEntitlement = 0          // CANNOT be clawed back; must not offset other heirs' shortfalls
    else:
        cappedRemainingEntitlement = remainingEntitlement
    display: { alreadyReceived, remainingEntitlement, grossEntitlement }  // show the TRUE (possibly negative) value for transparency

// Sum the CAPPED values, not raw remainingEntitlement — this is the correction.
totalNeededFromRemainingEstate = sum(cappedRemainingEntitlement across all heirs)
if totalNeededFromRemainingEstate > (estate value remaining at time of death, after prior gifts already given):
    flag("insufficient_estate_to_equalize")  // the real legitime-violation risk —
    // not the raw difference between gift amounts
```

All other calculation engine sections (§3.1, 3.3, 3.5, 3.7, 3.9) are unchanged from v2 — see that document for the testate floor calculation and advisory-only flags.

---

## 4. Screen/Component Inventory — unchanged from v2

`AccessGate` → `Landing` → `ConsentNotice` → `SectionA_MaritalRegime` → `SectionB_Family` → `SectionC_Assets` (now with five sub-components, one per asset category) → `SectionD_PriorGifts` → `SectionE_InsuranceDocs` → `ConsentFinal` → `Results` → `Confirmation`

---

## 5. Build Sequence — one addition to Step 3's test scenarios

1. Skeleton & navigation
2. Data capture forms
3. **Calculation engine** — test against hand-worked scenarios, now including a **fourth scenario**: a family-owned property held via a corporation, confirming it correctly excludes from the real-estate total and appears only once, under business shares (§3.2a)
4. Results screen
5. PDF + email integration
6. Content polish pass
7. Cross-device/responsive pass

---

## 6. Explicit Non-Goals for v1 — unchanged from v2

See v2 for full list. No changes this revision.

---

## 7. Open Items for Getty Before Build Starts

1. Confirm Google account for Apps Script deployment
2. Confirm hosting domain
3. Confirm whether a hidden test-mode shortcut is wanted for review cycles
4. Final read-through of the four hand-worked test scenarios (§5, step 3) before they're used as acceptance criteria
5. Periodic review of the value bands in §2 against actual market movement — these are calibrated to current data and will drift over time
