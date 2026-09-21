import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing Razorpay signature' }, { status: 400 });
    }

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(bodyText)
      .digest('hex');

    if (expectedSig !== signature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(bodyText);

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const transferId = payment.notes?.transfer_id;

      if (transferId) {
        // 1. Mark platform fee paid in transfers table
        const { data: transfer, error: updateErr } = await supabaseAdmin
          .from('transfers')
          .update({
            fee_paid_razorpay: true,
            razorpay_payment_id: payment.id,
            razorpay_order_id: payment.order_id,
          })
          .eq('id', transferId)
          .select()
          .single();

        if (updateErr) {
          console.error('Failed to update transfer status:', updateErr);
        }

        // 2. If seller already confirmed P2P payment, finalize title ownership transfer
        if (transfer && transfer.seller_confirmed_p2p) {
          await supabaseAdmin
            .from('items')
            .update({
              owner_id: transfer.buyer_id,
              status: 'transferred',
            })
            .eq('id', transfer.item_id);

          await supabaseAdmin
            .from('transfers')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', transferId);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err: any) {
    console.error('Razorpay Webhook Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
