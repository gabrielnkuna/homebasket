# Mobile Deployment Scripts

Home Basket now includes simple bash helpers and matching `npm` commands for the main EAS mobile deployment steps.

## Quick use

### Preflight

```bash
bash ./scripts/mobile-preflight.sh
```

or

```bash
npm run mobile:preflight
```

### Android preview build

```bash
bash ./scripts/mobile-android-preview.sh
```

or

```bash
npm run mobile:android:preview
```

### Android production build

```bash
bash ./scripts/mobile-android-production.sh
```

or

```bash
npm run mobile:android:production
```

### Submit Android production build

```bash
bash ./scripts/mobile-android-submit-production.sh
```

or

```bash
npm run mobile:android:submit:production
```

### Register an iPhone for preview builds

```bash
bash ./scripts/mobile-ios-device.sh
```

or

```bash
npm run mobile:ios:device
```

### iPhone preview build

```bash
bash ./scripts/mobile-ios-preview.sh
```

or

```bash
npm run mobile:ios:preview
```

### iPhone production build

```bash
bash ./scripts/mobile-ios-production.sh
```

or

```bash
npm run mobile:ios:production
```

## Recommended order

1. `mobile-preflight`
2. `mobile-android-preview` or `mobile-ios-preview`
3. test on real devices
4. `mobile-android-production` or `mobile-ios-production`
5. `mobile-android-submit:production` when Play assets and policy details are ready

## Notes

- The bash scripts are best run in `Git Bash`, `WSL`, or another bash-compatible shell.
- The `npm` commands work well from PowerShell.
- iPhone preview builds still require device registration through Apple Developer / EAS.
- Android production builds use the `production` EAS profile and create an app bundle.
- iPhone submission is usually best handled after the App Store Connect app record is fully ready.
