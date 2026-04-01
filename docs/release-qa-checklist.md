# Release QA Checklist

Use this before the first MVP release and before every update.

## Environment

- Production Firebase project is selected.
- Firestore rules are published.
- Storage rules are published.
- `localhost` is not the only authorized domain in the live project.
- Support email and contact links are ready.

## Onboarding

- Create household works with only household name, member name, and pay day.
- Create household works with no primary store.
- Create household works with no budget.
- Join household works with a live invite code.
- Restore account works with linked email and password.

## Household sync

- Second browser or device receives list changes in real time.
- Invite refresh works.
- Sign out on one device does not break the other household members.

## List flow

- Add item works.
- Edit item works.
- Remove item works.
- Mark bought and undo works.
- Custom category works, for example Gardening.

## Purchases flow

- Purchase can be recorded from pre-bought basket items.
- Purchase can be recorded with no pre-bought basket items.
- Purchase can be recorded without a primary store.
- Receipt attachment uploads successfully.
- Purchase history updates on another device.
- "Add back" from purchase history works.

## Budget and payday cycle

- Household can run with budget turned off.
- Owner can set a cycle budget later.
- Owner can turn the budget off again.
- Pay day can be changed by owner.
- Spend cards update correctly after a recorded purchase.

## Reminders

- Reminder can be created.
- Reminder can be added back into the basket.
- Reminder cadence updates after adding to the basket.
- Reminder can be removed.

## Account security

- Link email and password works.
- Verification email can be sent.
- Password reset can be sent.
- Restore account works on a second browser or device.

## UI and product polish

- Branding looks correct on the onboarding screen.
- Navigation labels are correct.
- No developer-facing badges remain in everyday screens unless intentionally kept.
- Empty states read clearly.
- App is usable on mobile-width web layout.

## Release sign-off

- Product sign-off: [ ]
- Firebase sign-off: [ ]
- QA sign-off: [ ]
- Legal copy placeholders replaced: [ ]
- Support channel ready: [ ]
