# Home Basket MVP Launch Pack

Home Basket is close to an Android-first MVP launch.

This pack gives you the minimum practical material to move from "working product" to "ready to submit and test with real users."

## Included

- [Android release guide](./android-release-guide.md)
- [App config review](./app-config-review.md)
- [Play Store assets checklist](./play-store-assets-checklist.md)
- [Play Store creative brief](./play-store-creative-brief.md)
- [Play Store screenshot runbook](./play-store-screenshot-runbook.md)
- [App Store screenshot runbook](./app-store-screenshot-runbook.md)
- [Privacy policy draft](./privacy-policy.md)
- [Store listing copy](./store-listing-copy.md)
- [Privacy policy starter](./privacy-policy-starter.md)
- [Terms and disclaimer starter](./terms-and-disclaimer-starter.md)
- [Release QA checklist](./release-qa-checklist.md)

## Recommended launch order

1. Finalize product copy and branding.
2. Confirm Firebase production settings and rules.
3. Run the release QA checklist on web and Android.
4. Fill in the privacy policy and terms placeholders.
5. Prepare Play Store listing assets and screenshots.
6. Build the Android release artifact.
7. Soft launch with a small group first.

## MVP release gate

Treat these as the "must be true" conditions before launch:

- A new household can be created without forcing a budget.
- A household can be joined from a second device or browser.
- Live sync works for list items, reminders, and purchases.
- A purchase can be recorded with or without a receipt.
- A purchase can be recorded without a primary store.
- Password restore works for linked accounts.
- Firestore and Storage rules are published in the production Firebase project.
- Privacy policy and terms links are ready.
- Support email is ready.

## Recommended MVP scope

For the first public release, the strongest story is:

- Shared shopping list for a household
- Multiple members on the same household
- Payday-based budget cycle
- Optional budget tracking
- Purchase history with receipt proof
- Recurring reminders

## Suggested post-launch MVP follow-ups

- Offline and retry status only when something is wrong
- Lightweight audit log for edits, deletes, and purchase recording
- Purchase metadata like seller, order reference, and delivery or in-store channel
- CSV export for the current budget cycle
- Crash reporting and analytics
- Role polish for owner-only actions

## Production notes

- Review all Firebase rules in the live project before launch.
- Replace all placeholder contact details and legal text.
- Verify that app screenshots match the latest UI.
- If iOS is not part of the first release, say "Android first" in your internal rollout plan, not in customer-facing store copy unless that is intentional.
