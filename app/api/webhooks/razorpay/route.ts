import { createHmac, timingSafeEqual } from 'node:crypto';
import { paymentAdmin } from '@/lib/paymentAdmin';

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return Response.json({}, { status: 503 });
  const signature = request.headers.get('x-razorpay-signature') ?? '';
  const body = await request.text();
  const expected = createHmac('sha256', secret).update(body).digest();
  if (!/^[a-f0-9]{64}$/i.test(signature) || !timingSafeEqual(expected, Buffer.from(signature, 'hex'))) {
    return Response.json({}, { status: 401 });
  }
  try {
    const event = JSON.parse(body);
    if (event.event !== 'payment.captured') return Response.json({ received: true });
    const payment = event.payload?.payment?.entity;
    if (payment?.status !== 'captured' || typeof payment.order_id !== 'string' ||
        typeof payment.id !== 'string' || !Number.isSafeInteger(payment.amount) || !['INR', 'USD'].includes(payment.currency)) {
      return Response.json({}, { status: 400 });
    }
    const { data, error } = await paymentAdmin().rpc(payment.currency === 'USD' ? 'lunar_finalize_registration' : 'lunar_finalize_fee', {
      p_order: payment.order_id, p_payment: payment.id, p_amount: payment.amount, p_currency: payment.currency,
    });
    if (error) throw error;
    if (data === 'unknown_order' || data === 'invalid_payment' || data === 'invalid_state') {
      console.error('Captured marketplace payment requires reconciliation', payment.id, data);
    }
    return Response.json({ received: true });
  } catch (error) {
    console.error('Marketplace webhook processing failed', error);
    return Response.json({}, { status: 500 });
  }
}
