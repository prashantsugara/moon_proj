import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  // Optional security check for Cron Auth secret header
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
  }

  try {
    const { error } = await supabaseAdmin.rpc('expire_stale_transfers');
    if (error) throw error;

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error('Expire transfers cron failed:', err);
    return NextResponse.json({ error: err.message || 'Cron execution failed' }, { status: 500 });
  }
}
