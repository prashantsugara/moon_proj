import { paymentAdmin } from '@/lib/paymentAdmin';
import { paymentGateway } from '@/lib/razorpay';

export async function POST(request: Request) {
  if (process.env.MARKETPLACE_ENABLED !== 'true') return Response.json({}, { status: 503 });
  try {
    const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) return Response.json({ error: 'Sign in to continue' }, { status: 401 });
    const admin = paymentAdmin();
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return Response.json({ error: 'Sign in to continue' }, { status: 401 });
    const body = await request.json().catch(() => null);
    const id = body?.auctionId;
    if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id)) {
      return Response.json({ error: 'Invalid auction' }, { status: 400 });
    }

    const { data: auction, error } = await admin.from('lunar_auctions')
      .select('id, fee, order_id, status, deadline').eq('id', id).eq('winner_id', user.id).maybeSingle();
    if (error) throw error;
    if (auction?.status !== 'awaiting_fee' || Date.parse(auction.deadline) <= Date.now()) {
      return Response.json({ error: 'Checkout is unavailable for this auction' }, { status: 409 });
    }
    if (auction.order_id) {
      return Response.json({ id: auction.order_id, amount: auction.fee, currency: 'INR' });
    }

    const order = await paymentGateway().orders.create({
      amount: auction.fee, currency: 'INR', receipt: auction.id,
    });
    // A concurrent request can create an unused gateway order. Only the persisted order is shown to buyers.
    const { data: saved, error: saveError } = await admin.from('lunar_auctions')
      .update({ order_id: order.id }).eq('id', id).eq('status', 'awaiting_fee')
      .gt('deadline', new Date().toISOString()).is('order_id', null).select('order_id').maybeSingle();
    if (saveError) throw saveError;
    if (saved) return Response.json({ id: saved.order_id, amount: auction.fee, currency: 'INR' });
    const { data: existing, error: reloadError } = await admin.from('lunar_auctions')
      .select('order_id').eq('id', id).eq('status', 'awaiting_fee')
      .gt('deadline', new Date().toISOString()).maybeSingle();
    if (reloadError) throw reloadError;
    if (!existing?.order_id) return Response.json({ error: 'Checkout is no longer available' }, { status: 409 });
    return Response.json({ id: existing.order_id, amount: auction.fee, currency: 'INR' });
  } catch (error) {
    console.error('Marketplace checkout failed', error);
    return Response.json({ error: 'Checkout could not be started' }, { status: 502 });
  }
}
