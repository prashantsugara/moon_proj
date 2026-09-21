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

      // If micro platform fee is already verified, trigger instant title transfer
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
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6 text-white max-w-lg shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-slate-100">P2P Title Transfer Handshake</h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
          Off-Platform P2P
        </span>
      </div>

      {/* STEP 1: Direct P2P Payment */}
      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>STEP 1: DIRECT P2P PAYMENT</span>
          <span className="text-green-400 font-bold text-sm">₹{transfer.final_price}</span>
        </div>

        <div className="bg-slate-900 p-3 rounded border border-slate-800 font-mono text-sm space-y-1">
          <p className="text-xs text-slate-400">Seller Payment Detail (UPI ID):</p>
          <div className="flex justify-between items-center text-slate-100 font-bold">
            <span>{sellerUpi || 'seller@upi'}</span>
            <button
              onClick={() => navigator.clipboard.writeText(sellerUpi)}
              className="text-xs text-blue-400 hover:underline"
            >
              Copy
            </button>
          </div>
        </div>

        {isBuyer && !isBuyerPaid && (
          <button
            onClick={handleNotifyPaid}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-2.5 rounded-lg font-semibold text-sm transition"
          >
            {isProcessing ? 'Updating...' : 'I Have Paid (Notify Seller)'}
          </button>
        )}

        {isBuyerPaid && !isSellerConfirmed && (
          <p className="text-xs text-amber-400 font-medium">
            ✓ Buyer notified payment. Awaiting seller confirmation...
          </p>
        )}

        {isSeller && isBuyerPaid && !isSellerConfirmed && (
          <button
            onClick={handleConfirmReceipt}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 py-2.5 rounded-lg font-semibold text-sm transition"
          >
            {isProcessing ? 'Processing...' : 'Confirm Funds Received in Bank'}
          </button>
        )}
      </div>

      {/* STEP 2: Micro Platform Transfer Fee */}
      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
          <span>STEP 2: REGISTRY TRANSFER FEE</span>
          <span className="text-slate-200 font-bold text-sm">₹{transfer.platform_fee}</span>
        </div>

        {!isFeePaid ? (
          <button
            onClick={handlePayPlatformFee}
            disabled={!isBuyerPaid || isProcessing}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 py-2.5 rounded-lg font-semibold text-sm transition"
          >
            {isProcessing ? 'Opening Razorpay...' : 'Pay Platform Fee (Razorpay)'}
          </button>
        ) : (
          <div className="text-xs text-green-400 font-semibold flex items-center gap-1.5">
            <span>✓ Platform registry fee paid & verified</span>
          </div>
        )}
      </div>

      {/* Final Completion State */}
      {isSellerConfirmed && isFeePaid && (
        <div className="p-4 bg-green-950/60 border border-green-800 text-green-300 text-center rounded-lg font-semibold text-sm">
          🎉 Transfer Complete! Title officially recorded in Registry.
        </div>
      )}

      {/* Dispute Section */}
      <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
        {disputeFiled ? (
          <span className="text-red-400 font-medium">⚠️ Dispute filed. Admin review pending.</span>
        ) : (
          <button
            onClick={() => setShowDisputeForm(!showDisputeForm)}
            className="text-slate-400 hover:text-red-400 transition underline"
          >
            Report Fraud / Non-payment Dispute
          </button>
        )}
      </div>

      {showDisputeForm && (
        <form onSubmit={handleFileDispute} className="space-y-2 pt-2">
          <textarea
            placeholder="Describe the payment issue (e.g. Buyer clicked paid but no funds arrived)..."
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-red-500"
            rows={3}
            required
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-red-600 hover:bg-red-500 py-2 rounded text-xs font-semibold transition"
          >
            Submit Dispute Report
          </button>
        </form>
      )}
    </div>
  );
}
