# Android Production Release Guide

This guide is tailored to the current Home Basket repo.

## What is already ready

Based on the current config in `app.json`:

- App name is set to `Home Basket`
- Version is set to `1.0.0`
- App icon is configured
- Android adaptive icon is configured
- Splash screen branding is configured
- Deep link scheme is configured as `homebasket`
- Receipt image permission copy is configured
- EAS build and submit profiles are now available in `eas.json`

## What still needs a real decision before first store release

### 1. Android package name

This is required before the first Play Store release.

Current repo choice:

- `com.transcripe.homebasket`

Important:

- Pick this carefully because changing it after launch creates a new app identity.
- This repo now uses `com.transcripe.homebasket` in `app.json`.

### 2. iOS bundle identifier

Not required for Android launch, but decide it early if iOS is coming soon.

Current repo choice:

- `com.transcripe.homebasket`

### 3. Play Console support and policy links

Before submission, prepare:

- support email: `gabriel@transcripe.com`
- privacy policy URL: `https://homebasketapp.com/privacy`
- support URL: `https://homebasketapp.com/support`
- account deletion URL: `https://homebasketapp.com/delete-account`
- developer website URL: `https://homebasketapp.com`
- AdMob app-ads.txt URL after web deploy: `https://homebasketapp.com/app-ads.txt`

## Build profiles now available

This repo now has these EAS profiles:

- `development`: internal development client
- `preview`: internal Android APK
- `production`: Android App Bundle for Play Store
- `submit.internal`: submit to internal testing track
- `submit.production`: submit to production track

The `production` build profile auto-increments Android version codes, so each new Play Store AAB can be uploaded without colliding with a previous release.

## Recommended first-release flow

1. Keep the Android package name in `app.json` as `com.transcripe.homebasket`.
2. Log in to Expo and EAS.
3. Build an internal Android preview.
4. Test on real devices.
5. Build a production Android App Bundle.
6. Submit first to internal testing in Play Console.
7. Promote to production after final checks.

## Commands

Install EAS CLI if needed:

```bash
npm install -g eas-cli
```

Log in:

```bash
eas login
```

Configure the project:

```bash
eas build:configure
```

Create an internal Android APK:

```bash
eas build --platform android --profile preview
```

Create a production Android App Bundle:

```bash
eas build --platform android --profile production
```

Submit to internal testing:

```bash
eas submit --platform android --profile internal
```

Submit to production:

```bash
eas submit --platform android --profile production
```

## PowerShell scripts

On Windows, use these repo scripts from PowerShell:

Check the latest Android version stored by EAS:

```powershell
.\scripts\mobile-android-version.ps1
```

Build a new production Android App Bundle:

```powershell
.\scripts\mobile-android-production.ps1
```

Submit the latest Android App Bundle to internal testing:

```powershell
.\scripts\mobile-android-submit-internal.ps1
```

Build and auto-submit to internal testing in one step:

```powershell
.\scripts\mobile-android-release-internal.ps1
```

Recommended for the next internal-testing build:

```powershell
.\scripts\mobile-android-release-internal.ps1
```

## Service account note

For automated Play submission, you will need a Google Play service account key with the correct Play Console permissions.

Do not commit that JSON key into the repo.

## AdMob app-ads.txt note

Home Basket includes `public/app-ads.txt` for AdMob verification.

After the next Firebase Hosting deploy, confirm this URL works:

- `https://homebasketapp.com/app-ads.txt`

Expected content:

```text
google.com, pub-4275448719705182, DIRECT, f08c47fec0942fa0
```

## Privacy policy note

Google Play requires a public privacy policy URL. Home Basket now has live public pages:

- Privacy: `https://homebasketapp.com/privacy`
- Support: `https://homebasketapp.com/support`
- Delete account: `https://homebasketapp.com/delete-account`

Use those exact URLs in Play Console.

## Official references

- Expo Android production build: https://docs.expo.dev/tutorial/eas/android-production-build
- Expo app config reference: https://docs.expo.dev/versions/latest/config/app/
- EAS config reference: https://docs.expo.dev/eas/json/
- Google Play Data safety overview: https://support.google.com/googleplay/android-developer/answer/10787469
