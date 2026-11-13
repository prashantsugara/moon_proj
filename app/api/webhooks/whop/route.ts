import { createHmac, timingSafeEqual } from 'node:crypto';
import { paymentAdmin } from '@/lib/paymentAdmin';
import { whopRequest } from '@/lib/whop';

export async function POST(request: Request) {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  const account = process.env.WHOP_ACCOUNT_ID;
  const plan = process.env.WHOP_PLAN_ID;
  if (!secret || !account || !plan) return Response.json({}, { status: 503 });

  const body = await request.text();
  const id = request.headers.get('webhook-id') ?? '';
  const timestamp = request.headers.get('webhook-timestamp') ?? '';
  const signatures = request.headers.get('webhook-signature') ?? '';
  if (!id || !/^\d+$/.test(timestamp) || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
    return Response.json({}, { status: 401 });
  }
  const digest = createHmac('sha256', secret)
    .update(id + '.' + timestamp + '.' + body).digest();
  const verified = signatures.split(/\s+/).some((signature) => {
    if (!signature.startsWith('v1,')) return false;
    const bytes = Buffer.from(signature.slice(3), 'base64');
    return bytes.length === digest.length && timingSafeEqual(bytes, digest);
  });
  if (!verified) return Response.json({}, { status: 401 });

  try {
    const event = JSON.parse(body);
    if (event.type !== 'payment.succeeded') return Response.json({ received: true });
    const paymentId = event.data?.id;
    if (typeof paymentId !== 'string' || !/^pay_[a-zA-Z0-9]+$/.test(paymentId)) {
      return Response.json({}, { status: 400 });
    }
    const payment = await whopRequest('payments/' + paymentId);
    const subtotal = payment.subtotal;
    if (payment.account_id !== account || payment.variant_id !== plan ||
        payment.status !== 'paid' || subtotal?.currency !== 'usd' ||
        !/^5(?:\.0+)?$/.test(String(subtotal.amount)) ||
        typeof payment.checkout_configuration_id !== 'string' ||
        !/^ch_[a-zA-Z0-9]+$/.test(payment.checkout_configuration_id)) {
      return Response.json({ received: true });
    }
    const { data, error } = await paymentAdmin().rpc('lunar_finalize_registration', {
      p_order: payment.checkout_configuration_id, p_payment: paymentId, p_amount: 500, p_currency: 'USD',
    });
    if (error) throw error;
    if (data !== 'completed') {
      console.error('Whop registration needs reconciliation', paymentId, data);
      return Response.json({}, { status: 409 });
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error('Whop webhook processing failed', error);
    return Response.json({}, { status: 500 });
  }
}
