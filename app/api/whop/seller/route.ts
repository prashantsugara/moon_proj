import { paymentAdmin } from '@/lib/paymentAdmin';
import { whopRequest, whopSandbox } from '@/lib/whop';

export async function POST(request: Request) {
  if (process.env.MARKETPLACE_ENABLED !== 'true') {
    return Response.json({ error: 'Marketplace is unavailable.' }, { status: 503 });
  }
  try {
    const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) return Response.json({ error: 'Sign in to continue.' }, { status: 401 });
    const { data: { user } } = await paymentAdmin().auth.getUser(token);
    if (!user?.email || !user.email_confirmed_at) {
      return Response.json({ error: 'Verify your email before setting up seller payouts.' }, { status: 403 });
    }

    const externalId = 'moonlandbuy-seller:' + user.id;
    const existing = await whopRequest('accounts?external_id=' + encodeURIComponent(externalId));
    const account = existing.data?.find((item: { external_id?: string }) => item.external_id === externalId)
      ?? await whopRequest('accounts', {
        method: 'POST',
        body: JSON.stringify({ external_id: externalId, email: user.email, title: 'MoonLandBuy seller' }),
      });
    if (!/^biz_[a-zA-Z0-9]+$/.test(account.id ?? '') || account.id === process.env.WHOP_ACCOUNT_ID) {
      throw new Error('Whop did not return a seller subaccount');
    }

    const { error } = await paymentAdmin().from('lunar_whop_sellers')
      .upsert({ user_id: user.id, whop_account_id: account.id }, { onConflict: 'user_id', ignoreDuplicates: true });
    if (error) throw error;

    const returnUrl = new URL('/?seller=whop', request.url).href;
    const link = await whopRequest('account_links', {
      method: 'POST',
      body: JSON.stringify({
        company_id: account.id,
        use_case: 'account_onboarding',
        refresh_url: returnUrl,
        return_url: returnUrl,
      }),
    });
    const redirect = new URL(link.url);
    const checkoutHost = whopSandbox() ? 'sandbox.whop.com' : 'whop.com';
    if (redirect.origin !== 'https://' + checkoutHost) throw new Error('Unexpected Whop onboarding host');
    return Response.json({ url: redirect.href });
  } catch (error) {
    console.error('Whop seller onboarding failed', error);
    return Response.json({ error: 'Whop seller setup could not be started.' }, { status: 502 });
  }
}
