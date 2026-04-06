# App Config Review

This is a release-oriented review of the current Expo config.

## Current strengths

- `name`: set to `Home Basket`
- `slug`: set to `home-basket`
- `version`: set to `1.0.0`
- `icon`: branded app icon is configured
- `scheme`: `homebasket`
- `android.adaptiveIcon`: configured with branded colors
- `web.favicon`: configured
- branded splash configuration is present

## Current release gaps

### Android package name

Set to:

- `com.transcripe.homebasket`

### iOS bundle identifier

Set to:

- `com.transcripe.homebasket`

This is a strong release-safe choice because it is unique, machine-safe, and aligned to the known `transcripe.com` identity.

### Version strategy still needs a release habit

You have `1.0.0` in app config and package metadata.

With EAS remote app versioning enabled in `eas.json`, release version management becomes easier, but you should still decide:

- when to bump marketing version
- how to name release candidates
- how to track internal vs production builds

### Store/support metadata is not part of app config

These live outside app config and must still be completed in the store consoles:

- Play Console app details
- privacy policy URL: `https://homebasketapp.com/privacy`
- support URL: `https://homebasketapp.com/support`
- support email: `gabriel@transcripe.com`
- account deletion URL: `https://homebasketapp.com/delete-account`
- app access declarations if needed
- data safety form

## Brand asset review

Current assets detected:

- `assets/brand/homebasket_appicon.png`: `1024x1024`
- `assets/brand/homebasket_reversed.png`: `1680x1200`
- `assets/brand/homebasket_horizontal.png`: `1680x480`

What this means:

- The app icon source is strong enough for launcher/store icon generation.
- The horizontal logo is useful for website or social headers.
- A dedicated Play feature graphic is still recommended.

## Recommendation before first Android submission

1. Keep `com.transcripe.homebasket` stable as the release identifier.
2. Keep `eas.json` as the build baseline.
3. Create a proper Play feature graphic.
4. Capture at least one strong phone screenshot set from the latest UI.
5. Use the live public URLs for privacy, support, and account deletion during store setup.
