import { paymentAdmin } from '@/lib/paymentAdmin';
import { whopSandbox } from '@/lib/whop';

export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  if (whopSandbox()) return Response.json({ confirmed: false }, { headers });
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return Response.json({}, { status: 401, headers });
  try {
    const admin = paymentAdmin();
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return Response.json({}, { status: 401, headers });
    const body = await request.json();
    if (typeof body.paymentId !== 'string' || !/^pay_[a-zA-Z0-9]+$/.test(body.paymentId)) {
      return Response.json({}, { status: 400, headers });
    }
    const { data, error } = await admin.from('lunar_registration_orders')
      .select('payment_id,claim_id,amount_cents').eq('account_id', user.id)
      .eq('payment_id', body.paymentId).maybeSingle();
    if (error) throw error;
    if (!data?.claim_id) return Response.json({ confirmed: false }, { headers });
    return Response.json({ confirmed: true, eventId: data.payment_id,
      value: data.amount_cents / 100, currency: 'USD' }, { headers });
  } catch {
    return Response.json({}, { status: 503, headers });
  }
}
