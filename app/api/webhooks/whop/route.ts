import { createHmac, timingSafeEqual } from 'node:crypto';
import { paymentAdmin } from '@/lib/paymentAdmin';
import { whopRequest, whopSandbox } from '@/lib/whop';
import { reportRegistrationPurchase } from '@/lib/openaiAds';
import { sendDeedEmail } from '@/lib/deedEmail';

export async function POST(request: Request) {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  const account = process.env.WHOP_ACCOUNT_ID;
  const plans = [
    process.env.WHOP_PLAN_ID,
    process.env.WHOP_PLAN_ID_100,
    process.env.WHOP_PLAN_ID_1000,
    process.env.WHOP_PLAN_ID_43560,
  ].filter(Boolean);
  if (!secret || !account || plans.length === 0) return Response.json({}, { status: 503 });

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
    const decimalAmount = String(subtotal?.amount);
    const amount = /^\d+(?:\.\d{1,2}0*)?$/.test(decimalAmount) ? Math.round(Number(decimalAmount) * 100) : NaN;
    const isTransfer = /^biz_[a-zA-Z0-9]+$/.test(payment.account_id ?? '') && payment.account_id !== account;
    if ((!isTransfer && (payment.account_id !== account || !plans.includes(payment.variant_id))) ||
        payment.status !== 'paid' || subtotal?.currency !== 'usd' ||
        !Number.isSafeInteger(amount) || amount <= 0 ||
        typeof payment.checkout_configuration_id !== 'string' ||
        !/^ch_[a-zA-Z0-9]+$/.test(payment.checkout_configuration_id)) {
      return Response.json({ received: true });
    }
    const admin = paymentAdmin();
    const { data, error } = await admin.rpc(isTransfer ? 'lunar_finalize_whop_sale' : 'lunar_finalize_registration', {
      p_order: payment.checkout_configuration_id, p_payment: paymentId, p_amount: amount, p_currency: 'USD', ...(isTransfer ? { p_seller: payment.account_id } : {}),
    });
    if (error) throw error;
    if (data === 'unknown_order') return Response.json({ received: true });
    if (data !== 'completed' && !(isTransfer && data === 'disputed')) {
      console.error('Whop registration needs reconciliation', paymentId, data);
      return Response.json({}, { status: 409 });
    }
    if (!isTransfer && !whopSandbox()) {
      await reportRegistrationPurchase(paymentId, amount, payment.metadata?.oppref);
    }
    if (!isTransfer) await sendDeedEmail(admin, paymentId);
    return Response.json({ received: true });
  } catch (error) {
    console.error('Whop webhook processing failed', error);
    return Response.json({}, { status: 500 });
  }
}
