# Store Reviewer Notes

Use these notes when Google Play or App Store Connect asks how reviewers should test Home Basket.

## Review access

Home Basket does not require a pre-created reviewer account for the core flow.

Reviewers can create a fresh household from the first screen:

1. Open Home Basket.
2. Choose `Create household`.
3. Enter a household name, for example `Review Household`.
4. Enter a member name, for example `Reviewer`.
5. Leave `Monthly budget` and `Primary store` blank, or add sample values if desired.
6. Continue into the app.

After setup, reviewers can test the main tabs:

- `List`: add shopping items, choose or type custom categories, mark items as bought, and edit/remove active items.
- `Purchases`: record bought items into purchase history, attach an optional receipt, and add purchase-history items back to the active basket.
- `Household`: view invite details, reminders, account/security options, support links, and account deletion options.

## Account deletion path

In-app path:

```text
Household -> Account security -> Delete account options
```

Public deletion URL:

```text
https://homebasketapp.com/delete-account
```

## Privacy and support URLs

Use these in store review forms:

- Privacy Policy: `https://homebasketapp.com/privacy`
- Support: `https://homebasketapp.com/support`
- Terms: `https://homebasketapp.com/terms`
- Website: `https://homebasketapp.com`

## Ads behavior

Home Basket contains Google AdMob ads on mobile builds.

Ads are intentionally delayed so the first-run setup experience is not crowded:

- Preview builds: ads may appear after 3 app opens.
- Production builds: ads may appear after 10 app opens.

Web currently stays ad-free.

## Receipt testing

Receipt attachment is optional. Reviewers can record a purchase without attaching a receipt by entering:

- `Store or seller`: `Review Store`
- `Total spend`: `100`

If a receipt is attached, Home Basket stores it as proof and may attempt OCR/receipt reading when supported.
