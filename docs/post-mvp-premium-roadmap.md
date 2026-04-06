# Post-MVP Premium Roadmap

This roadmap is for after the public MVP is live and stable.

The goal is to keep `main` focused on store-safe shared shopping, while premium work continues in parallel until payments, entitlement checks, and pricing are ready.

## Product principle

Keep the free product useful on its own:

- shared shopping list
- purchases with receipt proof
- payday-based monthly budget
- reminders
- household invite and restore

Reserve premium for real convenience, intelligence, and integrations.

## Recommended branch strategy

Use separate branches so premium work can continue without blocking store release work.

Recommended branch plan:

- `premium/receipt-ai`
- `premium/retail-integrations`
- `premium/subscriptions`
- `premium/bank-and-card-imports`
- `premium/admin-controls`

If you want one umbrella branch first, use:

- `premium-integrations`

Then split into focused branches when features get large.

## Premium phase 1

### Advanced receipt AI

Why it is premium:

- high-value automation
- ongoing model/API cost
- better than simple receipt proof storage

Scope:

- flagship model transcription for difficult slips
- merchant-aware parsing
- line-item cleanup
- better total detection
- category suggestions
- confidence scoring

Recommended branch:

- `premium/receipt-ai`

## Premium phase 2

### Retail integrations

South Africa first, then international expansion where it is technically and commercially realistic.

South Africa targets to explore:

- OneCart
- Checkers Sixty60
- Pick n Pay asap
- Woolworths Dash
- other retailer or delivery partners where public APIs, partner APIs, or stable automation paths are available

International targets to evaluate later:

- Instacart-adjacent workflows
- Walmart or Target style integrations where partner access exists
- Tesco, Carrefour, or similar grocery ecosystems depending on market/API availability

Important:

- Many retailers do not offer public ordering APIs
- some may require partnerships, affiliate agreements, or browser-based handoff instead of deep integrations
- this work should stay off `main` until legal, privacy, and partner constraints are understood

Recommended branch:

- `premium/retail-integrations`

## Premium phase 3

### Payments and subscriptions

Use this phase to unlock premium cleanly instead of blending monetization into MVP too early.

Likely scope:

- Stripe-backed web subscription management
- Play Billing
- App Store subscriptions
- entitlement sync across Android, iPhone, and web
- trial periods
- premium feature gating

Recommended branch:

- `premium/subscriptions`

## Premium phase 4

### Bank and card-linked spend imports

This is valuable but should only start after the core household flow is trusted.

Potential direction:

- consent-based bank feed integrations
- card transaction matching to purchases
- automatic spend reconciliation
- faster monthly budget tracking

Possible South Africa direction:

- explore local open-banking or aggregator options when commercially viable

Recommended branch:

- `premium/bank-and-card-imports`

## Premium phase 5

### Admin and discipline tools

These can be free or premium depending on the product strategy, but they are strong candidates for a higher tier once the household base grows.

Scope:

- audit log
- protected actions
- edit/delete reason tracking
- shopper permissions
- abuse alerts
- household owner controls

Recommended branch:

- `premium/admin-controls`

## Suggested release order

The safest premium build order is:

1. `premium/receipt-ai`
2. `premium/retail-integrations`
3. `premium/subscriptions`
4. `premium/admin-controls`
5. `premium/bank-and-card-imports`

That order keeps user value ahead of billing complexity, while still respecting how expensive integrations can become.

## Merge policy

Do not merge premium work into `main` until all of these are true:

- pricing and packaging are defined
- privacy policy and terms are updated
- support workflows are ready
- store disclosures are updated
- payment and entitlement flows are tested
- analytics and crash reporting are in place

## MVP plus premium split

### Keep in MVP

- optional monthly budget
- shared purchases
- receipt proof
- reminders
- household restore
- cross-device live sync

### Move to premium later

- retailer handoff or checkout integrations
- advanced receipt transcription
- smart category mapping at scale
- automated spend import
- advanced admin controls
- deeper reporting/export

## Working note for tomorrow

When store submission is underway, keep all premium commits off `main` and continue them in a premium branch so release momentum is never blocked by Stripe, retailer access, or legal reviews.
