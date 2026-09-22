'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface TransferProps {
  transfer: {
    id: string;
    item_id: string;
    buyer_id: string;
    seller_id: string;
    final_price: number;
    platform_fee: number;
    buyer_paid_p2p: boolean;
    seller_confirmed_p2p: boolean;
    fee_paid_razorpay: boolean;
  };
  sellerUpi: string;
  currentUserId: string;
}

export default function P2PTransferHandshake({
  transfer,
  sellerUpi,
  currentUserId,
}: TransferProps) {
  const [isBuyerPaid, setIsBuyerPaid] = useState(transfer.buyer_paid_p2p);
  const [isSellerConfirmed, setIsSellerConfirmed] = useState(transfer.seller_confirmed_p2p);
  const [isFeePaid, setIsFeePaid] = useState(transfer.fee_paid_razorpay);
  const [isProcessing, setIsProcessing] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeFiled, setDisputeFiled] = useState(false);

  const isBuyer = currentUserId === transfer.buyer_id;
  const isSeller = currentUserId === transfer.seller_id;

  // 1. Buyer marks P2P payment as done
  const handleNotifyPaid = async () => {
    setIsProcessing(true);
    const { error } = await supabase
      .from('transfers')
      .update({ buyer_paid_p2p: true })
      .eq('id', transfer.id);

    if (!error) {
      await supabase
        .from('items')
        .update({ status: 'seller_confirming' })
        .eq('id', transfer.item_id);
      setIsBuyerPaid(true);
    }
    setIsProcessing(false);
  };

  // 2. Seller confirms receipt of funds
  const handleConfirmReceipt = async () => {
    setIsProcessing(true);
    const { error } = await supabase
      .from('transfers')
      .update({ seller_confirmed_p2p: true })
      .eq('id', transfer.id);

    if (!error) {
      setIsSellerConfirmed(true);

      if (isFeePaid) {
        await supabase
          .from('items')
          .update({ owner_id: transfer.buyer_id, status: 'transferred' })
          .eq('id', transfer.item_id);
      }
    }
    setIsProcessing(false);
  };

  // 3. Trigger Razorpay Micro-Fee Checkout (₹49)
  const handlePayPlatformFee = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferId: transfer.id, amount: transfer.platform_fee }),
      });
      const order = await res.json();

      if (!res.ok) throw new Error(order.error || 'Failed to create fee order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'Registry Transfer Fee',
        description: `Official registry transfer for parcel #${transfer.item_id.substring(0, 8)}`,
        order_id: order.id,
        handler: async (response: any) => {
          setIsFeePaid(true);
          window.location.reload();
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || 'Payment initiation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. File a Dispute
  const handleFileDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;

    setIsProcessing(true);
    const { error } = await supabase.from('disputes').insert({
      item_id: transfer.item_id,
      reporter_id: currentUserId,
      reason: disputeReason.trim(),
    });

    if (!error) {
      await supabase.from('items').update({ status: 'disputed' }).eq('id', transfer.item_id);
      setDisputeFiled(true);
      setShowDisputeForm(false);
    }
    setIsProcessing(false);
  };

  return (
    <div className="handshake-card">
      <div className="card-header">
        <h3 className="card-title">P2P Title Transfer Handshake</h3>
        <span className="p2p-badge">Off-Platform P2P</span>
      </div>

      {/* STEP 1: Direct P2P Payment */}
      <div className="step-box">
        <div className="step-label-row">
          <span>STEP 1: DIRECT P2P PAYMENT</span>
          <span className="step-price-tag">₹{transfer.final_price}</span>
        </div>

        <div className="upi-display-box">
          <span className="upi-label">Seller Payment Detail (UPI ID):</span>
          <div className="upi-value-row">
            <span>{sellerUpi || 'seller.luna@upi'}</span>
            <button
              onClick={() => navigator.clipboard.writeText(sellerUpi)}
              className="copy-btn"
            >
              Copy
            </button>
          </div>
        </div>

        {isBuyer && !isBuyerPaid && (
          <button
            onClick={handleNotifyPaid}
            disabled={isProcessing}
            className="btn-action btn-blue"
          >
            {isProcessing ? 'Updating...' : 'I Have Paid (Notify Seller)'}
          </button>
        )}

        {isBuyerPaid && !isSellerConfirmed && (
          <p className="status-message status-amber">
            ✓ Buyer notified payment. Awaiting seller confirmation...
          </p>
        )}

        {isSeller && isBuyerPaid && !isSellerConfirmed && (
          <button
            onClick={handleConfirmReceipt}
            disabled={isProcessing}
            className="btn-action btn-green"
          >
            {isProcessing ? 'Processing...' : 'Confirm Funds Received in Bank'}
          </button>
        )}
      </div>

      {/* STEP 2: Micro Platform Transfer Fee */}
      <div className="step-box">
        <div className="step-label-row">
          <span>STEP 2: REGISTRY TRANSFER FEE</span>
          <span style={{ color: '#e2e8f0', fontWeight: 700 }}>₹{transfer.platform_fee}</span>
        </div>

        {!isFeePaid ? (
          <button
            onClick={handlePayPlatformFee}
            disabled={!isBuyerPaid || isProcessing}
            className="btn-action btn-purple"
          >
            {isProcessing ? 'Opening Razorpay...' : 'Pay Platform Fee (Razorpay)'}
          </button>
        ) : (
          <div className="status-message status-green">
            ✓ Platform registry fee paid & verified
          </div>
        )}
      </div>

      {/* Final Completion State */}
      {isSellerConfirmed && isFeePaid && (
        <div className="success-banner">
          🎉 Transfer Complete! Title officially recorded in Registry.
        </div>
      )}

      {/* Dispute Section */}
      <div className="dispute-footer">
        {disputeFiled ? (
          <span style={{ color: '#ef4444', fontWeight: 600 }}>⚠️ Dispute filed. Admin review pending.</span>
        ) : (
          <button
            onClick={() => setShowDisputeForm(!showDisputeForm)}
            className="dispute-link"
          >
            Report Fraud / Non-payment Dispute
          </button>
        )}
      </div>

      {showDisputeForm && (
        <form onSubmit={handleFileDispute} className="dispute-form">
          <textarea
            placeholder="Describe the payment issue (e.g. Buyer clicked paid but no funds arrived)..."
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            className="dispute-textarea"
            rows={3}
            required
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="btn-action btn-red"
          >
            Submit Dispute Report
          </button>
        </form>
      )}
    </div>
  );
}
