# Firebase Hosting Deploy Guide

This guide is tailored to the current Home Basket repo and Firebase project.

## Current hosting target

Default Firebase project:

- `household-manager-apps`

Configured in:

- `.firebaserc`

## What is already prepared

- Expo web output is already set to `static`
- Firebase Hosting now points to `dist`
- `npm run build:web` exports the site and prepares `404.html`
- `npm run deploy:web` builds and deploys hosting

## Important note about your future domain

Buying `homebasketapp.com` later is fine.

You do **not** need the custom domain before deploying the site.

Recommended rollout:

1. Deploy first to Firebase's default hosting URL
2. Verify the app works live
3. Buy `homebasketapp.com`
4. Connect the domain in Firebase Hosting

## Step 1. Push the code to GitHub

Your local repo currently does not show a configured remote.

After creating your GitHub repository, use:

```bash
git remote add origin https://github.com/<your-user>/<your-repo>.git
git branch -M main
git add .
git commit -m "Prepare Home Basket for Firebase Hosting"
git push -u origin main
```

## Step 2. Install Firebase CLI if needed

```bash
npm install -g firebase-tools
```

If you prefer not to install globally, use:

```bash
npx firebase-tools --version
```

## Step 3. Log in to Firebase

```bash
firebase login
```

## Step 4. Build the static web site

```bash
npm run build:web
```

This does two things:

- runs `expo export --platform web`
- prepares `dist/404.html` for Firebase Hosting

## Step 5. Deploy to Firebase Hosting

```bash
npm run deploy:web
```

Or manually:

```bash
firebase deploy --only hosting
```

## Step 6. Test the live Firebase Hosting URL

Firebase will give you a default live URL such as:

- `https://household-manager-apps.web.app`
- or `https://household-manager-apps.firebaseapp.com`

Test these routes:

- `/`
- `/purchases`
- `/household`

Also test:

- create household
- join household
- record purchase
- refresh the browser on a deep route like `/purchases`

## Step 7. Connect the custom domain later

Once you buy `homebasketapp.com`:

1. Go to Firebase Console
2. Open `Hosting`
3. Click `Add custom domain`
4. Enter `homebasketapp.com`
5. Add `www.homebasketapp.com` too if you want both
6. Follow Firebase's DNS instructions exactly

Recommended domain setup:

- primary: `homebasketapp.com`
- redirect: `www.homebasketapp.com`

## Future GitHub automation

After the first manual deploy works, the next upgrade is:

- GitHub Actions or Firebase Hosting GitHub integration
- auto-preview on pull requests
- deploy on push to `main`

That is best done **after** one successful manual live deploy.

## Release checklist before first live web deploy

- `.env` points to the correct Firebase project
- Firestore rules are published
- Storage rules are published
- privacy policy is ready to publish
- purchase flow works in production mode
- restore account works in production mode
