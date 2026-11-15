# MoonLandBuy

MoonLandBuy is a paid commemorative lunar registry with a 3D globe, account-based registrations, and shareable certificates. Registrations confer no legal rights to lunar land.

## Setup

1. Provision Supabase. On a fresh database, run `supabase_setup.sql` followed by `registry_launch.sql`. On an existing installation of the base schema, apply `registry_launch.sql` if it is missing. Apply `marketplace.sql` followed by `paid_registration.sql` before deploying the paid app.
2. Copy `.env.example` to `.env.local` and enter the Supabase project URL and publishable or anon key. Set the same public values in the deployment environment before building.
3. Configure Supabase Auth email confirmation, email delivery, site URL, and allowed redirect URLs for the deployment origin.
4. Run `npm ci`, then `npm run build` and `npm start`.

## Release verification

- In a staging project, confirm sign-up and sign-in, then complete a US$5 test payment and confirm the claim appears only after capture. Refresh and check My Land.
- Open the shared certificate link in a signed-out browser. Sign in with a second account and verify it can view the public claim without seeing it in My Land.
- Attempt to register the same location concurrently and confirm exactly one claim is created. Verify anonymous users cannot register and signed-in users can register only to their account.
- Check certificate download and QR navigation on desktop and mobile. Confirm order creation returns 503 while checkout is disabled.

The public registry displays the chosen name, title, location, size, flag, and motto. Use a display name you are comfortable publishing.

## Marketplace staging

1. Apply `marketplace.sql` after the registry migration. It ships with new listings and bids disabled at the database level.
2. Configure the environment variables in `.env.example` using a staging database and Whop sandbox credentials. Configure Whop to deliver `payment.succeeded` events to `/api/webhooks/whop`. Set up a scheduler to call `GET /api/cron/expire-transfers` at least every five minutes with the bearer `CRON_SECRET`.
3. In staging, enable new listings and bids with `update public.lunar_marketplace_settings set enabled = true where singleton;`. The public flag exposes the interface and the server flag enables checkout. Rebuild after changing the public flag.
4. Use two separate accounts to test listing, cancellation before the first bid, competing bids, close with and without a winner, private UPI instructions, seller confirmation, checkout, captured payment, and ownership after reload. Verify replayed webhooks do not transfer twice and mismatched amount, currency, or order never transfers a claim. Test abandoned checkout, expired deadlines, and a dispute raised while checkout is open.
5. Review pending disputes and reconcile them against buyer/seller receipts and Razorpay captures or refunds. An authorized operator can call `lunar_resolve_dispute` with `true` to transfer after capture or `false` to release the plot after reconciliation. Neither action moves or refunds money. The SQL migration grants resolution to service role only.

Auction bids and the seller payment are denominated in INR. The seller receives the winning bid directly over UPI. Razorpay collects only the platform transfer fee. Leave production checkout and new listings disabled until the staging checks pass and an operator is assigned to handle disputes and refunds.

## Paid registration

Set `REGISTRATION_CHECKOUT_ENABLED=true` in staging with Razorpay test credentials and USD checkout available. Registration is US$5. New auctions use a 2% platform fee, rounded to the nearest paise, with an INR 50 minimum opening bid. Existing issued orders keep their quoted fees. Reconcile abandoned registration orders with Razorpay before releasing their reserved coordinates.

## Whop registration checkout

For a preview deployment, set REGISTRATION_CHECKOUT_ENABLED=true and REGISTRATION_PAYMENT_PROVIDER=whop. Set WHOP_ACCOUNT_ID and WHOP_PLAN_ID to the matching Whop business and one-time USD 5 plan. Add WHOP_API_KEY with permission to create checkout configurations and retrieve payments. In Whop, subscribe the preview URL at /api/webhooks/whop to payment.succeeded and set WHOP_WEBHOOK_SECRET to the exact signing secret. Keep these secrets server-side. The existing paid_registration.sql migration supplies the finalization function. Test with matching credentials and webhook settings before enabling production. Previously issued Razorpay orders can still finish through the original checkout.

For a no-money test, use a dedicated Preview Supabase project with the registry migrations applied so test purchases cannot issue production certificates. Set WHOP_ENVIRONMENT=sandbox and supply the sandbox business ID, plan ID, API key, and webhook secret for that branch. Create the US$5 one-time plan and payment.succeeded webhook in the Whop sandbox dashboard. Redeploy Preview after setting the variables. Use Whop's documented sandbox card and verify exactly one certificate appears in My Land.

For Whop auction settlement, apply whop_marketplace.sql after marketplace.sql and paid_registration.sql. Verify seller onboarding, subaccount payment webhooks, and the application fee in Whop Sandbox before enabling the marketplace. New listings use USD. Reconcile any existing INR auctions before enabling the new flow.

### Deed delivery by email

Apply `deed_email.sql` after the registration migrations. Set `RESEND_API_KEY`, `DEED_EMAIL_FROM` to an address on a verified Resend sending domain, and `DEED_EMAIL_SITE_URL` to the public site origin. Set `DEED_EMAIL_ENABLED=true` and redeploy. On Whop Sandbox, set `DEED_EMAIL_TEST_TO` to the inbox that should receive test certificates. Live registrations use the verified email of the MoonLandBuy account that registered the deed.

After a Whop registration is finalized, MoonLandBuy sends the issued certificate as a PDF and PNG. Both files contain a QR code linking to the online deed. Check that a new sandbox registration delivers both files and that replaying its webhook does not send another email. Existing registrations are not automatically backfilled.
