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
    <main className="main-container">
      <div className="hero-header">
        <h1 className="hero-title">P2P Registry & Marketplace</h1>
        <p className="hero-sub">
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
