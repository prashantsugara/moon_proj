export function whopEnabled() {
  return process.env.REGISTRATION_PAYMENT_PROVIDER === 'whop';
}

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
  const checkout = await whopRequest('checkout_configurations', {
    method: 'POST',
    body: JSON.stringify({
      mode: 'payment',
      variant_id: plan,
      redirect_url: new URL('/?registration=whop', requestUrl).href,
      metadata: { registration_id: registrationId },
    }),
  });
  if (typeof checkout.id !== 'string' || !/^ch_[a-zA-Z0-9]+$/.test(checkout.id)) {
    throw new Error('Whop did not return a checkout ID');
  }
  return checkout;
}
