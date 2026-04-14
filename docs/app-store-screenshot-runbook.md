# App Store Screenshot Runbook

This is the practical iPhone screenshot guide for Home Basket's first App Store submission.

Use this together with:

- [Store listing copy](./store-listing-copy.md)
- [Release QA checklist](./release-qa-checklist.md)
- [Privacy policy draft](./privacy-policy.md)

## Goal

Capture a polished iPhone screenshot set from the real app UI that matches the current product and tells a clean MVP story.

## Capture format

Recommended approach:

- capture on a real iPhone if possible
- keep portrait orientation
- export PNG files
- if the same UI is used across iPhone sizes, capture the highest-resolution iPhone screenshots you need and let App Store Connect scale them down

## Visual rules

- Use one sample household across the whole set.
- Keep the same member names throughout.
- Keep one intentional currency across the full set.
- Avoid debug or technical badges.
- Avoid empty-state screenshots unless the empty state is the actual story.
- Do not use a real personal receipt unless sensitive fields are hidden.
- Keep the capture order and story aligned with Android so both stores feel like the same product.

## Sample household data

Use this as the launch demo household:

- Household name: `Nkuna Home`
- Owner: `Gabriel`
- Member 2: `Lerato`
- Member 3: `Pulane`
- Pay day: `25`
- Monthly budget: `5200`
- Currency: `ZAR`
- Primary store: optional, or use `Checkers` only where helpful

## Suggested sample list items

- Milk - `2`
- Bread - `2`
- Rice - `5 kg`
- Tomatoes - `6`
- Dishwashing liquid - `1`
- Toothpaste - `2`
- Dog food - `1 bag`
- Garden gloves - `1`

## Suggested purchase example

Use a clean purchase story:

- Seller: `Checkers Sixty60` or `Takealot`
- Total: `R 842,50`
- Receipt attached
- Purchased items include:
  - Tomatoes
  - Bread
  - Dishwashing liquid
  - Toothpaste

## Screenshot order

### Screenshot 1

Filename:

- `branding/app-store/iphone-01-onboarding.png`

Headline:

- `Shared shopping list for the whole household`

Show:

- onboarding screen
- `Create household`, `Join household`, and `Restore account`
- strong Home Basket branding

Goal:

- establish the app instantly

### Screenshot 2

Filename:

- `branding/app-store/iphone-02-list.png`

Headline:

- `Add items fast and keep everyone aligned`

Show:

- List screen
- member selector
- active basket near the top
- category structure visible

Goal:

- show the shared household list clearly

### Screenshot 3

Filename:

- `branding/app-store/iphone-03-add-item.png`

Headline:

- `Add a new item in seconds`

Show:

- List screen with the add item card
- category pills and quick quantity entry
- the floating add action visible

Goal:

- show how fast a household can add a needed item

### Screenshot 4

Filename:

- `branding/app-store/iphone-04-purchases.png`

Headline:

- `Record purchases with receipt proof`

Show:

- Purchases screen
- receipt attached
- total recorded
- purchased items visible

Goal:

- show proof, history, and flexibility for in-store or delivery shopping

### Screenshot 5

Filename:

- `branding/app-store/iphone-05-household.png`

Headline:

- `Manage the household in one place`

Show:

- Household screen
- invite sharing
- acting member controls
- household settings

Goal:

- show that Home Basket handles more than just the list

### Screenshot 6

Filename:

- `branding/app-store/iphone-06-budget.png`

Headline:

- `Track the monthly budget when ready`

Show:

- monthly budget controls
- pay-day cycle settings
- current household currency

Goal:

- show optional spend tracking without making setup heavy

## Suggested export folders

- `branding/app-store/`
- `branding/play-store/`

Keep the Android and iPhone sets as twins:

- same household
- same names
- same currency
- same order
- same headline style

## Capture workflow

1. Install the latest iPhone preview build.
2. Seed one polished household with the example data.
3. Capture all six screenshots from the real app, not mock UI.
4. Pick the cleanest version of each shot.
5. Add a short marketing headline overlay in Canva or Figma.
6. Export the final images into `branding/app-store/`.

## Overlay guidance

- Use one short headline only.
- Keep the top area readable.
- Do not cover the most useful UI.
- Use the Home Basket green/gold palette.
- Avoid overcrowding the image.

## Final check before upload

- screenshots match the current shipped UI
- no private data is exposed
- brand treatment matches Android
- first three screenshots tell the story quickly
- the app looks like a real household tool, not a prototype
