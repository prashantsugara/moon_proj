import { REGISTRATION_AMOUNT_CENTS } from '@/lib/registrationPrice';
import { paymentAdmin } from '@/lib/paymentAdmin';
import { createWhopCheckout, whopEnabled, whopSandbox } from '@/lib/whop';
import { paymentGateway } from '@/lib/razorpay';
import { FLAG_TEMPLATES } from '@/data/lunarRegions';

export async function POST(request: Request) {
  if (process.env.REGISTRATION_CHECKOUT_ENABLED !== 'true') {
    return Response.json({ error: 'Registration checkout is unavailable' }, { status: 503 });
  }
  try {
    const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) return Response.json({ error: 'Sign in to continue' }, { status: 401 });
    const admin = paymentAdmin();
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return Response.json({ error: 'Sign in to continue' }, { status: 401 });
    const draft = await request.json().catch(() => null);
    const { lat: rawLat, lng: rawLng } = draft?.coordinates ?? {};
    const owner = typeof draft?.ownerName === 'string' ? draft.ownerName.trim() : '';
    const title = typeof draft?.title === 'string' ? draft.title.trim() : '';
    if (!Number.isFinite(rawLat) || Math.abs(rawLat) > 90 || !Number.isFinite(rawLng) ||
        Math.abs(rawLng) > 180 || !owner || owner.length > 100 || !title || title.length > 120 ||
        ![1,100,1000,43560].includes(draft.sqft) || typeof draft.motto !== 'string' ||
        draft.motto.length > 200 || !FLAG_TEMPLATES.some((flag) => flag.id === draft.flagId)) {
      return Response.json({ error: 'Invalid certificate details' }, { status: 400 });
    }
    const lat = Math.round(rawLat * 100) / 100;
    const roundedLng = Math.round(rawLng * 100) / 100;
    const lng = Math.abs(lat) === 90 ? 0 : roundedLng === 180 ? -180 : roundedLng;
    const { data: claim, error: claimError } = await admin.from('lunar_claims')
      .select('id').eq('lat',lat).eq('lng',lng).maybeSingle();
    if (claimError) throw claimError;
    if (claim) return Response.json({ error: 'That location is already registered' }, { status: 409 });

    const { error: reserveError } = await admin.from('lunar_registration_orders').insert({
      amount_cents: REGISTRATION_AMOUNT_CENTS, account_id: user.id, lat, lng, owner_name: owner, title, sqft: draft.sqft,
      motto: draft.motto, flag_id: draft.flagId,
    });
    if (reserveError && reserveError.code !== '23505') throw reserveError;
    const { data: reservation, error } = await admin.from('lunar_registration_orders')
      .select('*').eq('lat',lat).eq('lng',lng).single();
    if (error) throw error;
    if (reservation.account_id !== user.id || reservation.claim_id) {
      return Response.json({ error: 'That location is reserved. Choose another spot.' }, { status: 409 });
    }
    if (reservation.owner_name !== owner || reservation.title !== title || reservation.sqft !== draft.sqft ||
        reservation.motto !== draft.motto || reservation.flag_id !== draft.flagId) {
      return Response.json({ error: 'Use the original certificate details for this reserved location.' }, { status: 409 });
    }
    if (!reservation.order_id && reservation.amount_cents !== REGISTRATION_AMOUNT_CENTS) {
      const { error: priceError } = await admin.from('lunar_registration_orders')
        .update({ amount_cents: REGISTRATION_AMOUNT_CENTS }).eq('id', reservation.id).is('order_id', null);
      if (priceError) throw priceError;
      reservation.amount_cents = REGISTRATION_AMOUNT_CENTS;
    }
    let orderId = reservation.order_id;
    if (whopEnabled() && !orderId) {
      const checkout = await createWhopCheckout(reservation.id, request.url);
      const { error: saveError } = await admin.from('lunar_registration_orders')
        .update({ order_id: checkout.id }).eq('id', reservation.id).is('order_id', null);
      if (saveError) throw saveError;
      const { data: saved, error: reloadError } = await admin.from('lunar_registration_orders')
        .select('order_id').eq('id', reservation.id).single();
      if (reloadError || !saved?.order_id) throw reloadError ?? new Error('Checkout was not saved');
      orderId = saved.order_id;
    }
    if (orderId?.startsWith('ch_')) {
      const host = whopSandbox() ? 'sandbox.whop.com' : 'whop.com';
      return Response.json({ checkoutUrl: 'https://' + host + '/checkout/' + orderId + '/' });
    }
    if (!orderId) {
      const order = await paymentGateway().orders.create({ amount: reservation.amount_cents, currency: 'USD', receipt: reservation.id });
      const { error: saveError } = await admin.from('lunar_registration_orders')
        .update({ order_id: order.id }).eq('id',reservation.id).is('order_id',null);
      if (saveError) throw saveError;
      const { data: saved, error: reloadError } = await admin.from('lunar_registration_orders')
        .select('order_id').eq('id',reservation.id).single();
      if (reloadError || !saved?.order_id) throw reloadError ?? new Error('Order was not saved');
      orderId = saved.order_id;
    }
    return Response.json({ id: orderId, amount: reservation.amount_cents, currency: 'USD' });
  } catch (error) {
    console.error('Registration checkout failed', error);
    return Response.json({ error: 'Registration checkout could not be started' }, { status: 502 });
  }
}
