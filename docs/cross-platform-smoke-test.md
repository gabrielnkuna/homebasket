# Cross-Platform Smoke Test

Run this before store submission and after any fresh Android, iOS, or web deployment.

Use the same household data across platforms where possible.

## Web

Target:

```text
https://homebasketapp.com
```

Checks:

- Create a household from the landing page.
- If `Monthly budget` is entered, confirm the currency defaults from device time zone or can be changed manually.
- Add an item with a built-in category, such as `Milk` under `Dairy`.
- Add an item with a custom category, such as `Fruits`; confirm it appears under `Fruits`, not `Produce`.
- Mark an item as bought.
- Open `Purchases`; confirm the bought item appears under `Bought from basket`.
- Tap `Move back to pending`; confirm it returns to the active list.
- Record a purchase without a receipt; confirm no Firestore permission/data error appears.
- Open `Privacy`, `Terms`, `Support`, and `Delete account` from the footer.
- On a phone browser, pull down at the top of the page and confirm browser refresh is not blocked.

## Android

Use a fresh EAS preview or production build after code changes.

Checks:

- Create or restore a household.
- Confirm swipe navigation works between `List`, `Purchases`, and `Household`.
- Add an item with custom category `Fruits`; confirm grouping is correct.
- Mark an item as bought.
- Open `Purchases`; confirm `Bought from basket` is visible.
- Tap `Add back as ...`; confirm the app moves to `List` and shows the success message near the top.
- Record a purchase with no receipt; confirm no `receipt undefined` error appears.
- Attach a receipt photo; confirm the app can save the purchase with receipt proof.
- Confirm mobile ads do not crowd first-run setup.

## iOS

Use a fresh EAS preview or TestFlight build after code changes.

Checks:

- Create or restore a household.
- Confirm swipe navigation works between `List`, `Purchases`, and `Household`.
- Add an item with custom category `Fruits`; confirm grouping is correct.
- Mark an item as bought.
- Open `Purchases`; confirm `Bought from basket` is visible.
- Tap `Add back as ...`; confirm the app moves to `List` and shows the success message near the top.
- Record a purchase with no receipt; confirm no save error appears.
- Attach a receipt photo; confirm iOS permission prompts are understandable.
- Confirm `Household -> Account security -> Delete account options` is visible.

## Final store readiness checks

- App name is `Home Basket`.
- Package/bundle identifier is `com.transcripe.homebasket`.
- Privacy URL opens: `https://homebasketapp.com/privacy`.
- Support URL opens: `https://homebasketapp.com/support`.
- Delete account URL opens: `https://homebasketapp.com/delete-account`.
- AdMob app-ads.txt opens: `https://homebasketapp.com/app-ads.txt`.
- Store screenshots match the current app wording: `Purchases`, not `Trips`.
