export function whopSandbox() {
  return process.env.WHOP_ENVIRONMENT === 'sandbox';
}

export async function whopRequest(path: string, options: RequestInit = {}) {
  const key = process.env.WHOP_API_KEY;
  if (!key) throw new Error('Whop API key is missing');
  const host = whopSandbox() ? 'sandbox-api.whop.com' : 'api.whop.com';
  const response = await fetch('https://' + host + '/api/v1/' + path, {
    ...options,
    cache: 'no-store',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) throw new Error('Whop API returned ' + response.status);
  return response.json();
}

export async function createWhopCheckout(registrationId: string, requestUrl: string, sqft: number) {
  const plan = sqft === 1 ? process.env.WHOP_PLAN_ID : process.env['WHOP_PLAN_ID_' + sqft];
  if (!plan || !process.env.WHOP_WEBHOOK_SECRET || !process.env.WHOP_ACCOUNT_ID) {
    throw new Error('Whop registration is not configured');
  }
  return createCheckout({ variant_id: plan }, { registration_id: registrationId }, new URL('/?registration=whop', requestUrl));
}

export function createWhopTransferCheckout(auctionId: string, account: string, price: number, fee: number, requestUrl: string) {
  return createCheckout({
    account_id: account,
    variant: { currency: 'usd', billing_type: 'one_time', initial_price: price / 100, application_fee_amount: fee / 100 },
  }, { auction_id: auctionId }, new URL('/?transfer=whop', requestUrl), 'auction:' + auctionId);
}

export function whopCheckoutUrl(id: string) {
  if (!/^ch_[a-zA-Z0-9]+$/.test(id)) throw new Error('Invalid Whop checkout ID');
  return 'https://' + (whopSandbox() ? 'sandbox.whop.com' : 'whop.com') + '/checkout/' + id + '/';
}

async function createCheckout(pricing: object, metadata: object, redirect: URL, idempotencyKey?: string) {
  const checkout = await whopRequest('checkout_configurations', {
    method: 'POST',
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
    body: JSON.stringify({
      mode: 'payment',
      ...pricing,
      redirect_url: redirect.href,
      metadata,
    }),
  });
  if (typeof checkout.id !== 'string' || !/^ch_[a-zA-Z0-9]+$/.test(checkout.id)) {
    throw new Error('Whop did not return a checkout ID');
  }
  return checkout;
}
