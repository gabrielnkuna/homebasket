# Store Compliance Answers

This is a practical draft for the Home Basket store submission work.

It is not legal advice and it should be reviewed against the exact state of the shipped build before final submission, especially if analytics, real ads, payments, or new integrations are added.

## Public URLs to use

- Website: `https://homebasketapp.com`
- Privacy Policy URL: `https://homebasketapp.com/privacy`
- Terms URL: `https://homebasketapp.com/terms`
- Support URL: `https://homebasketapp.com/support`
- Account deletion URL: `https://homebasketapp.com/delete-account`

## Google Play draft answers

### Account deletion

Home Basket supports account creation inside the app through linked email/password accounts.

Use these answers as the working baseline:

- `Does your app allow users to create an account?`
  Yes
- `Does your app provide an in-app account deletion option?`
  Yes
- `Web URL where users can request deletion`
  `https://homebasketapp.com/delete-account`

Notes:

- The in-app entry point already exists under `Household -> Account security -> Delete account options`.
- The public deletion page exists so users can request deletion without reinstalling the app.

### Data safety draft

Treat this as the starting point for the Play Console Data safety form.

Likely data collected by the current app:

- Personal info
  - Email address, only when the user links an account
- Photos and videos
  - Receipt images, only when the user chooses to attach them
- App activity / in-app content
  - Shopping items, reminders, purchase notes, purchase history, household names, member names
- App info and performance
  - If mobile ads are enabled, Google Mobile Ads SDK may collect diagnostics and ad-related technical data
- Device or other identifiers
  - Firebase/Auth identifiers, and ad-related identifiers when mobile ads are enabled

Notification and badge behavior:

- Home Basket may request badge permission on iPhone so the app icon can show the number of items still to be bought.
- Home Basket does not use this badge feature for marketing push notifications.

Likely data sharing to disclose when ads are enabled:

- Ad-related SDK data sharing for advertising, fraud prevention, and measurement through Google Mobile Ads SDK

Likely safety answers:

- Data is encrypted in transit
  Yes
- Can users request deletion of their data?
  Yes

Important:

- Review Google's latest Mobile Ads SDK disclosure guide before locking the final Data safety answers.
- If you disable ads in the release build, the disclosure surface becomes simpler.

## Apple App Store Connect draft answers

### App information

Use these URLs:

- Privacy Policy URL
  `https://homebasketapp.com/privacy`
- Support URL
  `https://homebasketapp.com/support`
- User Privacy Choices URL
  `https://homebasketapp.com/delete-account`

### Account deletion expectation

Apple requires apps that support account creation to let users initiate deletion in the app.

Home Basket should be submitted with:

- in-app deletion path visible from account/security settings
- public deletion page live at `https://homebasketapp.com/delete-account`

### App privacy draft

Review these likely disclosures against the final release build:

- Contact Info
  - Email Address
  Why: linked account restore and password reset
- User Content
  - Photos or Videos
  Why: optional receipt image uploads
- User Content
  - Other User Content
  Why: shopping list items, reminders, notes, purchase history
- Identifiers
  - User ID
  Why: Firebase account/session identifiers

If mobile ads are enabled in the submitted iOS build, expect additional review for:

- Device ID
- Product Interaction
- Diagnostics
- Advertising Data

These ad-related declarations should be checked against Google's current Apple App Store disclosure guide for Google Mobile Ads SDK.

## Asset reminders

### Google Play

- Feature graphic
  `1024 x 500`, JPEG or 24-bit PNG, no alpha
- Minimum screenshots to publish
  2
- Stronger recommendation for visibility
  at least 4 portrait screenshots at `1080 x 1920` or higher

### Apple App Store

- Minimum screenshots
  1
- Maximum screenshots
  10
- Current iPhone screenshot set already prepared in this repo/runbook
  `1290 x 2796`

## Final pre-submit check

Before pressing submit in either store, confirm all of the following are true:

- Privacy page is live
- Support page is live
- Deletion page is live
- In-app deletion path is still visible
- Screenshot set matches the current shipped UI
- Ad disclosures match the actual build configuration
- Store copy says `Purchases`, not `Trips`

## Official references

- Google Play account deletion requirements:
  https://support.google.com/googleplay/android-developer/answer/13327111
- Google Play User Data policy:
  https://support.google.com/googleplay/android-developer/answer/10144311
- Google Play preview assets:
  https://support.google.com/googleplay/android-developer/answer/9866151
- Apple account deletion guidance:
  https://developer.apple.com/support/offering-account-deletion-in-your-app
- Apple App Privacy reference:
  https://developer.apple.com/help/app-store-connect/reference/app-privacy
- Apple screenshot upload/spec guidance:
  https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots/
  https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications
- Google Mobile Ads SDK Play data disclosure:
  https://developers.google.com/admob/android/privacy/play-data-disclosure
- Google Mobile Ads SDK Apple disclosure:
  https://developers.google.com/admob/ios/privacy/data-disclosure
