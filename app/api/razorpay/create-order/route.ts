import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { transferId, amount } = await req.json();

    if (!transferId || !amount) {
      return NextResponse.json({ error: 'Missing transferId or amount' }, { status: 400 });
    }

    // Verify transfer record exists
    const { data: transfer, error } = await supabase
      .from('transfers')
      .select('id, platform_fee')
      .eq('id', transferId)
      .single();

    if (error || !transfer) {
      return NextResponse.json({ error: 'Invalid transfer record' }, { status: 404 });
    }

    // Amount in Razorpay is in paise (1 INR = 100 Paise)
    const orderAmountPaise = Math.round(Number(transfer.platform_fee) * 100);

    const order = await razorpay.orders.create({
      amount: orderAmountPaise,
      currency: 'INR',
      receipt: `receipt_${transferId.substring(0, 8)}`,
      notes: {
        transfer_id: transferId,
      },
    });

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (err: any) {
    console.error('Razorpay order creation failed:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
