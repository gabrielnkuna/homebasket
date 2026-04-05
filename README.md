# Home Basket

Home Basket is a cross-platform household grocery app built for Android first, while still supporting iOS and web from the same Expo + React Native codebase.

## Product direction

- Shared household shopping list
- Fast add and toggle flow for groceries, toiletries, and cleaning items
- Purchase logging with total-spend tracking
- Bought items clear only when a purchase is recorded
- Simple household roster so one device can act as different family members or shoppers

## Why Firestore

The app is structured around Cloud Firestore as the target database because it matches the product requirements well:

- real-time shared list updates for multiple household members
- offline-friendly sync for mobile and web clients
- one backend model for Android, iOS, and web
- simple subcollection structure for households, members, items, and trips
- Firebase Auth can sit next to Firestore cleanly so each device keeps a stable household identity

The current implementation boots with an in-memory demo repository so the app works immediately. If Firebase environment variables are present, the repository layer can switch to Firestore.
In Firestore mode, Home Basket also signs the device in anonymously and binds household membership to that authenticated user, which makes household restore more reliable than a local-only session.

## Solution structure

```text
src/
  app/                       Expo Router entry screens
  components/                Navigation shell
  constants/                 Theme tokens
  features/home-basket/
    application/             Pure use cases and selectors
    domain/                  Entities and repository contracts
    infrastructure/          In-memory + Firestore adapters
    presentation/            Zustand store and screen components
  hooks/                     Color-scheme and theme helpers
  shared/
    format/                  Currency and date helpers
    ui/                      Reusable layout and card components
```

## Commands

```bash
npm install
npm run web
npm run android
npm run test
npm run typecheck
```

## MVP launch docs

- [Firebase Hosting deploy guide](./docs/firebase-hosting-deploy.md)
- [Android release guide](./docs/android-release-guide.md)
- [App config review](./docs/app-config-review.md)
- [Play Store assets checklist](./docs/play-store-assets-checklist.md)
- [Play Store creative brief](./docs/play-store-creative-brief.md)
- [Play Store screenshot runbook](./docs/play-store-screenshot-runbook.md)
- [Mobile deployment scripts](./docs/mobile-deployment-scripts.md)
- [MVP launch pack](./docs/mvp-launch-pack.md)
- [Privacy policy draft](./docs/privacy-policy.md)
- [Store listing copy](./docs/store-listing-copy.md)
- [Privacy policy starter](./docs/privacy-policy-starter.md)
- [Terms and disclaimer starter](./docs/terms-and-disclaimer-starter.md)
- [Release QA checklist](./docs/release-qa-checklist.md)

## Firebase setup

Create a `.env` from `.env.example` when you are ready to use Firestore:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

Without those variables, Home Basket runs in demo mode with seeded household data.
