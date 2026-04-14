# Play Console Submission Runbook

Use this once the Google Play developer account verification is complete.

This is a practical checklist for Home Basket's first Android internal-testing submission.

## 1. Create the app

Recommended values:

- App name: `Home Basket`
- Default language: `English`
- App or game: `App`
- Free or paid: `Free`

Confirm the declarations Google shows in-console.

## 2. Store settings

Recommended values:

- App category: `Shopping`
- Tags: use shopping, household, list, grocery, productivity-style tags if Play suggests them
- Contact email: `gabriel@transcripe.com`
- Developer website: `https://homebasketapp.com`
- Privacy policy: `https://homebasketapp.com/privacy`

The developer website matters for AdMob because it lets AdMob discover:

```text
https://homebasketapp.com/app-ads.txt
```

## 3. Main store listing

Use [store-listing-copy.md](./store-listing-copy.md).

Recommended fields:

- App name: `Home Basket`
- Short description: `Shared shopping list, purchases, reminders, and monthly budgets.`
- Full description: use the full text block from [store-listing-copy.md](./store-listing-copy.md)

Upload assets:

- App icon: `assets/brand/homebasket_appicon.png`
- Feature graphic: `branding/play-store/feature_graphic.jpg`
- Phone screenshots:
  1. `branding/play-store/screenshot-01-onboarding.png`
  2. `branding/play-store/screenshot-02-list.png`
  3. `branding/play-store/screenshot-03-add-item.png`
  4. `branding/play-store/screenshot-04-purchases.png`
  5. `branding/play-store/screenshot-05-household.png`
  6. `branding/play-store/screenshot-06-budget.png`

## 4. App access

Recommended answer:

- `All or some functionality is restricted?`
  Choose the option meaning `No special access is required`.

Reviewer note:

```text
Reviewers can create a new household from the first screen without special credentials. Tap Create household, enter a household name and member name, then continue. Invite, list, purchase, reminder, and household settings flows are available from the app after setup.
```

If Google later asks for credentials, create a temporary reviewer household/account and put the details here.

## 5. Ads declaration

Recommended answer:

- `Does your app contain ads?`
  `Yes`

Notes:

- Mobile builds use Google AdMob.
- Ads are delayed on first launch so the initial setup experience is not crowded.
- Web currently stays ad-free.

## 6. Content rating

Use the in-console questionnaire honestly.

Recommended Home Basket positioning:

- Category: utility, shopping, productivity, or similar if prompted
- Violence: `No`
- Sexual content: `No`
- Profanity: `No`
- Controlled substances: `No`
- Gambling: `No`
- Public user-generated content: `No`

Nuance:

- Home Basket lets invited household members create private shopping items, notes, receipt attachments, and purchase records.
- It is not a public social network and does not publish content to strangers.

## 7. Target audience

Recommended first-release answer:

- Target age: `18+`
- Designed for children: `No`

Why:

- Home Basket is for adult household coordination and budgeting.
- The release build contains ads.
- The UI and listing should not be positioned as child-directed.

## 8. Data safety draft

Use [store-compliance-answers.md](./store-compliance-answers.md) as the detailed source.

Likely collected data types for the current build:

- Personal info:
  - Name
  - Email address, only when an account is linked
- Financial info:
  - Purchase history, because users record purchase totals and household purchase history
- Photos and videos:
  - Photos, only when users attach receipt images
- App activity:
  - App interactions or other user-generated content, because users create shopping items, reminders, notes, and purchases
- Device or other IDs:
  - Firebase/Auth identifiers and advertising-related identifiers when ads are enabled
- App info and performance:
  - Diagnostics or crash/performance-style data from SDKs, if shown by Google's SDK disclosure form

Likely data purposes:

- App functionality
- Account management
- Analytics or diagnostics, if the form reflects SDK diagnostics
- Advertising or marketing, for Google Mobile Ads data
- Fraud prevention and security

Likely sharing:

- Ad-related data may be shared with Google Mobile Ads for advertising, measurement, fraud prevention, and compliance.
- Firebase/Google services process app data as service providers for sync, auth, storage, and hosting.

Likely security answers:

- Data encrypted in transit: `Yes`
- Users can request data deletion: `Yes`
- Deletion URL: `https://homebasketapp.com/delete-account`

## 9. Account deletion

Recommended answers:

- App allows account creation: `Yes`
- In-app deletion path exists: `Yes`
- Deletion request URL: `https://homebasketapp.com/delete-account`

In-app path:

```text
Household -> Account security -> Delete account options
```

## 10. Internal testing release

After Google unlocks Play Console API access:

1. Create or upload the Play service account JSON.
2. Do not commit the JSON file.
3. Run:

```bash
npx eas-cli submit --platform android --profile internal
```

If prompted for the JSON key, paste the full local path to the downloaded file.

## 11. Internal testing release notes

Use:

```text
Initial Home Basket internal test release with shared household lists, purchases, receipt attachments, reminders, invite codes, monthly budget tracking, and mobile ads.
```

## 12. Final checks before review

- `https://homebasketapp.com/privacy` opens
- `https://homebasketapp.com/support` opens
- `https://homebasketapp.com/delete-account` opens
- `https://homebasketapp.com/app-ads.txt` opens
- Store copy says `Purchases`, not `Trips`
- Store listing says the app contains ads
- Screenshots do not show private receipts or personal data
- Production Android build uses `com.transcripe.homebasket`
- Production build uses real AdMob IDs, not sample IDs

## Official references

- Google Play Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- Google Play account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Google Play preview assets: https://support.google.com/googleplay/android-developer/answer/9866151
- Google Play app signing and releases: https://support.google.com/googleplay/android-developer/answer/9842756
- AdMob app-ads.txt setup: https://support.google.com/admob/answer/9363762
