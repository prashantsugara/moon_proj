import React, { useState } from 'react';
import { X, History, ArrowRight, ShieldCheck, Tag, DollarSign, Send, Check } from 'lucide-react';

export default function OwnershipTrailModal({
  isOpen,
  onClose,
  plot,
  onPlaceBid,
  onBuyListedPlot
}) {
  const [bidderName, setBidderName] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [bidSuccessMsg, setBidSuccessMsg] = useState(false);

  if (!isOpen || !plot) return null;

  const history = plot.history || [
    {
      event: 'MINTED',
      from: 'Luna Land Authority',
      to: plot.ownerName,
      price: plot.totalPaid,
      date: plot.claimedAt,
      txHash: plot.txHash
    }
  ];

  const bids = plot.bids || [];

  const handleBidSubmit = (e) => {
    e.preventDefault();
    if (!bidderName.trim() || !bidAmount || Number(bidAmount) <= 0) return;

    onPlaceBid(plot.id, {
      id: `bid-${Date.now()}`,
      bidderName: bidderName.trim(),
      bidAmount: Number(bidAmount),
      createdAt: new Date().toISOString()
    });

    setBidSuccessMsg(true);
    setTimeout(() => {
      setBidSuccessMsg(false);
      setBidderName('');
      setBidAmount('');
    }, 2000);
  };

  return (
    <div className="trail-modal-backdrop" onClick={onClose}>
      <div className="trail-modal-container glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="trail-header">
          <div className="header-title-group">
            <div className="header-icon-ring">
              <History size={18} />
            </div>
            <div>
              <h2>Chain of Title & Ownership Trail</h2>
              <span className="trail-plot-sub">{plot.title} • {plot.id}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="trail-body">
          {/* Left Column: Ownership Trail Timeline */}
          <div className="trail-column">
            <h3 className="section-title">Ownership History</h3>
            <div className="timeline-wrapper">
              {history.map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="event-top">
                      <span className="event-type">{item.event.replace(/_/g, ' ')}</span>
                      <span className="event-date">{new Date(item.date).toLocaleDateString()}</span>
                    </div>

                    <div className="event-transfer">
                      <span className="owner-from">{item.from}</span>
                      <ArrowRight size={13} className="transfer-arrow" />
                      <span className="owner-to">{item.to}</span>
                    </div>

                    <div className="event-meta">
                      <span className="price-tag">{item.price ? `$${item.price.toLocaleString()}` : 'N/A'}</span>
                      <span className="hash-tag">TX: {item.txHash || '0x4918...'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Marketplace Bidding & Status */}
          <div className="trail-column side-column">
            <div className="current-status-box">
              <h3 className="section-title">Parcel Status</h3>
              <div className="status-row">
                <span className="status-label">Current Owner</span>
                <span className="status-value">{plot.ownerName}</span>
              </div>
              <div className="status-row">
                <span className="status-label">Parcel Size</span>
                <span className="status-value">{(plot.acres ? plot.acres * 43560 : plot.sqft || 100).toLocaleString()} sq ft</span>
              </div>
              <div className="status-row">
                <span className="status-label">Listing Status</span>
                {plot.forSale ? (
                  <span className="badge-available">For Sale • ${plot.listPrice.toLocaleString()}</span>
                ) : (
                  <span className="status-value-muted">Not Listed</span>
                )}
              </div>

              {plot.forSale && onBuyListedPlot && (
                <button
                  className="btn-primary buy-listed-btn"
                  onClick={() => {
                    onBuyListedPlot(plot);
                    onClose();
                  }}
                >
                  <Tag size={15} />
                  <span>Buy Parcel (${plot.listPrice.toLocaleString()})</span>
                </button>
              )}
            </div>

            {/* Bids List & Place Bid Form */}
            <div className="bidding-box">
              <h3 className="section-title">Active Offers ({bids.length})</h3>
              <div className="bids-scroll-list">
                {bids.length === 0 ? (
                  <p className="no-bids-text">No offers placed yet. Be the first to make an offer on this parcel.</p>
                ) : (
                  bids.map((b) => (
                    <div key={b.id} className="bid-card">
                      <div className="bid-top">
                        <span className="bidder-name">{b.bidderName}</span>
                        <span className="bid-amount">${b.bidAmount.toLocaleString()}</span>
                      </div>
                      <span className="bid-date">{new Date(b.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Form to submit offer */}
              <form onSubmit={handleBidSubmit} className="place-bid-form">
                <input
                  type="text"
                  placeholder="Your name or entity"
                  value={bidderName}
                  onChange={(e) => setBidderName(e.target.value)}
                  className="bid-input"
                  required
                />
                <div className="bid-input-row">
                  <input
                    type="number"
                    placeholder="Offer amount ($)"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="bid-input"
                    required
                  />
                  <button type="submit" className="btn-primary submit-bid-btn">
                    <Send size={13} />
                    <span>Place Bid</span>
                  </button>
                </div>

                {bidSuccessMsg && (
                  <div className="bid-success-tag">
                    <Check size={14} />
                    <span>Offer submitted to owner</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .trail-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 120;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .trail-modal-container {
          width: 860px;
          max-width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          padding: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          overflow: hidden;
        }

        .trail-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        .header-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-icon-ring {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: var(--accent-soft);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .header-title-group h2 {
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .trail-plot-sub {
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--text-muted);
        }

        .close-btn {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-muted);
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .close-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
          border-color: var(--border-subtle);
        }

        .trail-body {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 24px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .trail-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-title {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.02em;
        }

        .timeline-wrapper {
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          padding-left: 18px;
          border-left: 1px solid var(--border-subtle);
          margin-left: 6px;
        }

        .timeline-item {
          position: relative;
        }

        .timeline-dot {
          position: absolute;
          left: -23px;
          top: 14px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--accent);
          border: 2px solid var(--bg-card);
        }

        .timeline-content {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .event-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-sans);
          font-size: 11px;
        }

        .event-type {
          font-weight: 600;
          color: var(--accent);
          text-transform: capitalize;
        }

        .event-date {
          color: var(--text-muted);
        }

        .event-transfer {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .transfer-arrow {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .owner-from {
          color: var(--text-secondary);
        }

        .owner-to {
          color: var(--text-primary);
          font-weight: 600;
        }

        .event-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-sans);
          font-size: 11px;
          padding-top: 4px;
          border-top: 1px solid var(--border-subtle);
        }

        .price-tag {
          color: var(--green);
          font-weight: 600;
        }

        .hash-tag {
          color: var(--text-muted);
          font-size: 10px;
        }

        .side-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .current-status-box,
        .bidding-box {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-sans);
          font-size: 12px;
        }

        .status-label {
          color: var(--text-muted);
        }

        .status-value {
          color: var(--text-primary);
          font-weight: 500;
        }

        .status-value-muted {
          color: var(--text-muted);
        }

        .buy-listed-btn {
          width: 100%;
          justify-content: center;
          padding: 9px 16px;
          margin-top: 4px;
        }

        .bids-scroll-list {
          max-height: 140px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .no-bids-text {
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .bid-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .bid-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-sans);
          font-size: 12px;
        }

        .bidder-name {
          color: var(--text-primary);
          font-weight: 500;
        }

        .bid-amount {
          color: var(--green);
          font-weight: 600;
        }

        .bid-date {
          font-family: var(--font-sans);
          font-size: 11px;
          color: var(--text-muted);
        }

        .place-bid-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
        }

        .bid-input {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 12px;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .bid-input:focus {
          border-color: var(--border-active);
        }

        .bid-input::placeholder {
          color: var(--text-muted);
        }

        .bid-input-row {
          display: flex;
          gap: 8px;
        }

        .bid-input-row .bid-input {
          flex: 1;
        }

        .submit-bid-btn {
          flex-shrink: 0;
          padding: 8px 14px;
        }

        .bid-success-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 500;
          color: var(--green);
        }

        @media (max-width: 768px) {
          .trail-body {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
