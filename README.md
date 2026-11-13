# MoonLandBuy

MoonLandBuy is a free commemorative lunar registry with a 3D globe, account-based registrations, and shareable certificates. Registrations confer no legal rights to lunar land.

## Setup

1. Provision Supabase. On a fresh database, run `supabase_setup.sql` followed by `registry_launch.sql`. On an existing installation of the base schema, apply only `registry_launch.sql`.
2. Copy `.env.example` to `.env.local` and enter the Supabase project URL and publishable or anon key. Set the same public values in the deployment environment before building.
3. Configure Supabase Auth email confirmation, email delivery, site URL, and allowed redirect URLs for the deployment origin.
4. Run `npm ci`, then `npm run build` and `npm start`.

## Release verification

- In a staging project, confirm sign-up and sign-in, then register a claim. Refresh and check My Land.
- Open the shared certificate link in a signed-out browser. Sign in with a second account and verify it can view the public claim without seeing it in My Land.
- Attempt to register the same location concurrently and confirm exactly one claim is created. Verify anonymous users cannot register and signed-in users can register only to their account.
- Check certificate download and QR navigation on desktop and mobile. Confirm order creation returns 503 while checkout is disabled.

The public registry displays the chosen name, title, location, size, flag, and motto. Use a display name you are comfortable publishing.

## Marketplace staging

1. Apply `marketplace.sql` after the registry migration. It ships with new listings and bids disabled at the database level.
2. Configure the environment variables in `.env.example` using a staging database and Razorpay test keys. Configure Razorpay to deliver `payment.captured` events to `/api/webhooks/razorpay`. Set up a scheduler to call `GET /api/cron/expire-transfers` at least every five minutes with the bearer `CRON_SECRET`.
3. In staging, enable new listings and bids with `update public.lunar_marketplace_settings set enabled = true where singleton;`. The public flag exposes the interface and the server flag enables checkout. Rebuild after changing the public flag.
4. Use two separate accounts to test listing, cancellation before the first bid, competing bids, close with and without a winner, private UPI instructions, seller confirmation, checkout, captured payment, and ownership after reload. Verify replayed webhooks do not transfer twice and mismatched amount, currency, or order never transfers a claim. Test abandoned checkout, expired deadlines, and a dispute raised while checkout is open.
5. Review pending disputes and reconcile them against buyer/seller receipts and Razorpay captures or refunds. An authorized operator can call `lunar_resolve_dispute` with `true` to transfer after capture or `false` to release the plot after reconciliation. Neither action moves or refunds money. The SQL migration grants resolution to service role only.

Auction bids and the seller payment are denominated in INR. The seller receives the winning bid directly over UPI. Razorpay collects only the platform transfer fee. Leave production checkout and new listings disabled until the staging checks pass and an operator is assigned to handle disputes and refunds.
