'use client';

import React from 'react';
import P2PTransferHandshake from '@/components/P2PTransferHandshake';

export default function HomePage() {
  const dummyTransfer = {
    id: 'tr_sample_101',
    item_id: 'item_luna_sector_99',
    buyer_id: 'buyer_user_01',
    seller_id: 'seller_user_02',
    final_price: 499.0,
    platform_fee: 49.0,
    buyer_paid_p2p: false,
    seller_confirmed_p2p: false,
    fee_paid_razorpay: false,
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>P2P Registry & Marketplace</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          Off-platform direct P2P payments with certified title registry transfer.
        </p>
      </div>

      <P2PTransferHandshake
        transfer={dummyTransfer}
        sellerUpi="seller.luna@upi"
        currentUserId="buyer_user_01"
      />
    </main>
  );
}
