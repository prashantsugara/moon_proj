import { timingSafeEqual } from 'node:crypto';
import { paymentAdmin } from '@/lib/paymentAdmin';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({}, { status: 503 });
  const supplied = Buffer.from(request.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return Response.json({}, { status: 401 });
  }
  try {
    const { error } = await paymentAdmin().rpc('lunar_advance_auctions');
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Auction advancement failed', error);
    return Response.json({}, { status: 500 });
  }
}
