import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Tag,
  User,
  Shield,
  CreditCard,
  History,
  Send,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FLAG_TEMPLATES } from '../data/lunarRegions';

export default function TelemetryBar({
  activeCoordinates,
  selectedRegion,
  claimedPlots,
  onClaimSuccess,
  onBuyListedPlot,
  onPlaceBid,
  onOpenDeed,
  onOpenTrail,
  onOpenClaimModal
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [ownerNameInput, setOwnerNameInput] = useState('');
  const [plotTitleInput, setPlotTitleInput] = useState('');
  const [selectedSqft, setSelectedSqft] = useState(100);
  const [selectedFlagId, setSelectedFlagId] = useState('classic');
  const [isProcessing, setIsProcessing] = useState(false);

  // Bidding state for owned land
  const [bidAmountInput, setBidAmountInput] = useState('');
  const [bidderNameInput, setBidderNameInput] = useState('');
  const [bidSubmittedMessage, setBidSubmittedMessage] = useState(false);

  const latText = activeCoordinates
    ? activeCoordinates.lat > 0
      ? `${activeCoordinates.lat}° N`
      : `${Math.abs(activeCoordinates.lat)}° S`
    : '0.000° N';

  const lngText = activeCoordinates
    ? activeCoordinates.lng > 0
      ? `${activeCoordinates.lng}° E`
      : `${Math.abs(activeCoordinates.lng)}° W`
    : '0.000° E';

  // Check if current coordinate or selected region matches an existing claimed plot
  const existingPlot = activeCoordinates
    ? claimedPlots.find((p) => {
        const latDiff = Math.abs(p.lat - activeCoordinates.lat);
        const lngDiff = Math.abs(p.lng - activeCoordinates.lng);
        return (
          (latDiff < 3 && lngDiff < 3) ||
          (selectedRegion && p.regionName === selectedRegion.name)
        );
      })
    : null;

  const isAvailable = !existingPlot;

  // Size Options
  const SQFT_PRESETS = [
    { label: '100 sq ft', sqft: 100, price: 19.99, acres: 0.0023 },
    { label: '1,000 sq ft', sqft: 1000, price: 149.00, acres: 0.023 },
    {
      label: '1 Acre',
      sqft: 43560,
      price: selectedRegion ? selectedRegion.pricePerAcre || 249 : 249.00,
      acres: 1
    }
  ];

  const activePreset = SQFT_PRESETS.find((p) => p.sqft === selectedSqft) || SQFT_PRESETS[0];
  const regFee = 5.0;
  const totalPrice = Number((activePreset.price + regFee).toFixed(2));
  const activeFlag = FLAG_TEMPLATES.find((f) => f.id === selectedFlagId) || FLAG_TEMPLATES[0];

  // Quick Direct Buying Handler
  const handleQuickBuy = (e) => {
    e.preventDefault();
    const finalOwner = ownerNameInput.trim() || 'Lunar Pioneer';
    const finalTitle =
      plotTitleInput.trim() ||
      (selectedRegion ? `${selectedRegion.name} Plot` : `Sector ${latText} ${lngText}`);

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.7 }
      });

      const newClaim = {
        id: `SQFT-${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        ownerName: finalOwner,
        title: finalTitle,
        lat: activeCoordinates ? activeCoordinates.lat : 0,
        lng: activeCoordinates ? activeCoordinates.lng : 0,
        sqft: activePreset.sqft,
        acres: activePreset.acres,
        totalPaid: totalPrice,
        regionName: selectedRegion ? selectedRegion.name : 'Custom Surface Sector',
        motto: 'Per Aspera Ad Astra',
        flagId: activeFlag.id,
        flagColor1: activeFlag.color1,
        flagColor2: activeFlag.color2,
        flagSymbol: activeFlag.symbol,
        claimedAt: new Date().toISOString(),
        txHash: `REG-${Math.random().toString(16).substring(2, 10).toUpperCase()}`
      };

      onClaimSuccess(newClaim);
    }, 1200);
  };

  // Handle inline bid submission
  const handleQuickBid = (e) => {
    e.preventDefault();
    if (!existingPlot || !bidAmountInput || !bidderNameInput) return;

    const amount = parseFloat(bidAmountInput);
    if (isNaN(amount) || amount <= 0) return;

    const newBid = {
      id: `bid-${Date.now()}`,
      bidderName: bidderNameInput.trim(),
      bidAmount: amount,
      createdAt: new Date().toISOString()
    };

    onPlaceBid(existingPlot.id, newBid);
    setBidSubmittedMessage(true);
    setBidAmountInput('');
    setTimeout(() => setBidSubmittedMessage(false), 4000);
  };

  if (!activeCoordinates) return null;

  return (
    <div className={`tight-buying-panel glass-card ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header bar */}
      <div className="panel-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="location-title-group">
          <MapPin size={16} className="location-icon" />
          <div className="title-stack">
            <h3 className="location-name">
              {selectedRegion ? selectedRegion.name : 'Custom Surface Sector'}
            </h3>
            <span className="coords-sub">
              {latText}, {lngText}
            </span>
          </div>
        </div>

        <div className="header-right">
          <span className={`status-pill ${isAvailable ? 'available' : 'claimed'}`}>
            {isAvailable
              ? 'Available'
              : existingPlot?.forSale
              ? `For Sale ($${existingPlot.listPrice})`
              : `Claimed`}
          </span>
          <button
            type="button"
            className="collapse-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            aria-label="Toggle panel"
          >
            {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="panel-body">
          {/* CASE 1: AVAILABLE LAND FOR INSTANT PURCHASE */}
          {isAvailable ? (
            <form onSubmit={handleQuickBuy} className="buying-options-form">
              <div className="section-label-row">
                <Sparkles size={13} className="label-icon" />
                <span>Instant Purchase Options</span>
              </div>

              {/* Plot Size Selector Pills */}
              <div className="size-selector-pills">
                {SQFT_PRESETS.map((preset) => (
                  <button
                    key={preset.sqft}
                    type="button"
                    className={`size-pill ${selectedSqft === preset.sqft ? 'active' : ''}`}
                    onClick={() => setSelectedSqft(preset.sqft)}
                  >
                    <span className="size-label">{preset.label}</span>
                    <span className="size-price">${preset.price}</span>
                  </button>
                ))}
              </div>

              {/* Buyer & Title Quick Inputs */}
              <div className="inputs-grid">
                <input
                  type="text"
                  placeholder="Owner Name (e.g. Alex Mercer)"
                  value={ownerNameInput}
                  onChange={(e) => setOwnerNameInput(e.target.value)}
                  className="tight-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Plot Name (e.g. Haven Plot)"
                  value={plotTitleInput}
                  onChange={(e) => setPlotTitleInput(e.target.value)}
                  className="tight-input"
                />
              </div>

              {/* Country Flag Dropdown Selector */}
              <div className="flag-selector-row">
                <span className="flag-row-label">Country / Flag:</span>
                <select
                  value={selectedFlagId}
                  onChange={(e) => setSelectedFlagId(e.target.value)}
                  className="tight-input country-select"
                >
                  {FLAG_TEMPLATES.map((flag) => (
                    <option key={flag.id} value={flag.id} style={{ background: '#0f172a', color: '#ffffff' }}>
                      {flag.symbol} {flag.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Buy Now CTA */}
              <div className="checkout-cta-box">
                <div className="price-row">
                  <span className="price-label">Total (incl. fee):</span>
                  <strong className="price-amount">${totalPrice.toFixed(2)}</strong>
                </div>

                <button
                  type="submit"
                  className="btn-primary buy-now-action-btn"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Processing Deed...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={15} />
                      <span>Buy Land Now (${totalPrice.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                className="full-form-link"
                onClick={onOpenClaimModal}
              >
                Open custom claim modal &rarr;
              </button>
            </form>
          ) : (
            /* CASE 2: OWNED LAND (RESALE OR BIDDING) */
            <div className="owned-land-buying-options">
              <div className="owner-summary-card">
                <div className="owner-card-top">
                  <User size={16} className="user-icon" />
                  <div>
                    <h4 className="plot-owner-name">{existingPlot.ownerName}</h4>
                    <span className="plot-id-sub">{existingPlot.title} ({existingPlot.id})</span>
                  </div>
                  <span className="plot-flag-symbol">{existingPlot.flagSymbol || '🚩'}</span>
                </div>

                <div className="plot-specs-row">
                  <span>{(existingPlot.acres ? existingPlot.acres * 43560 : existingPlot.sqft || 100).toLocaleString()} sq ft</span>
                  <span>·</span>
                  <span>{existingPlot.regionName}</span>
                </div>
              </div>

              {/* LISTED FOR SALE OPTION */}
              {existingPlot.forSale ? (
                <div className="for-sale-buy-box">
                  <div className="sale-price-header">
                    <Tag size={15} className="sale-icon" />
                    <span>Listed Price:</span>
                    <strong className="sale-price-tag">${existingPlot.listPrice.toLocaleString()}</strong>
                  </div>
                  <button
                    type="button"
                    className="btn-primary buy-now-action-btn"
                    onClick={() => onBuyListedPlot(existingPlot)}
                  >
                    <CreditCard size={15} />
                    <span>Buy Title Now (${existingPlot.listPrice.toLocaleString()})</span>
                  </button>
                </div>
              ) : null}

              {/* INLINE BIDDING OPTION */}
              <form onSubmit={handleQuickBid} className="inline-bid-form">
                <div className="bid-header">
                  <Send size={13} />
                  <span>Place Offer / Bid</span>
                </div>

                <div className="bid-inputs-row">
                  <input
                    type="number"
                    placeholder="Offer $"
                    value={bidAmountInput}
                    onChange={(e) => setBidAmountInput(e.target.value)}
                    className="tight-input price-input"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={bidderNameInput}
                    onChange={(e) => setBidderNameInput(e.target.value)}
                    className="tight-input name-input"
                    required
                  />
                  <button type="submit" className="btn-secondary submit-bid-btn">
                    Bid
                  </button>
                </div>

                {bidSubmittedMessage && (
                  <div className="bid-success-toast">
                    <CheckCircle2 size={14} />
                    <span>Offer submitted to {existingPlot.ownerName}!</span>
                  </div>
                )}
              </form>

              {/* ACTION LINKS */}
              <div className="owned-actions-row">
                <button
                  type="button"
                  className="btn-ghost panel-action-btn"
                  onClick={() => onOpenTrail(existingPlot)}
                >
                  <History size={14} />
                  <span>Trail & Bids ({(existingPlot.bids || []).length})</span>
                </button>
                <button
                  type="button"
                  className="btn-ghost panel-action-btn"
                  onClick={() => onOpenDeed(existingPlot)}
                >
                  <Shield size={14} />
                  <span>View Deed</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .tight-buying-panel {
          position: absolute;
          bottom: 24px;
          right: 24px;
          z-index: 50;
          width: 360px;
          max-width: calc(100vw - 32px);
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          padding: 14px;
          font-family: var(--font-sans);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
          animation: fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
        }

        .location-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow: hidden;
        }

        .location-icon {
          color: var(--accent);
          flex-shrink: 0;
        }

        .title-stack {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .location-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .coords-sub {
          font-size: 11px;
          color: var(--text-muted);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .status-pill {
          font-size: 11px;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          white-space: nowrap;
        }

        .status-pill.available {
          background: var(--green-soft);
          color: var(--green);
          border: 1px solid rgba(34, 197, 94, 0.25);
        }

        .status-pill.claimed {
          background: var(--accent-soft);
          color: var(--accent);
          border: 1px solid rgba(59, 130, 246, 0.25);
        }

        .collapse-toggle-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          border-radius: var(--radius-sm);
          transition: color 0.15s ease;
        }

        .collapse-toggle-btn:hover {
          color: var(--text-primary);
        }

        .panel-body {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .buying-options-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .section-label-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .label-icon {
          color: var(--accent);
        }

        .size-selector-pills {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
        }

        .size-pill {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 6px 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .size-pill:hover {
          border-color: var(--border-active);
          background: rgba(255, 255, 255, 0.06);
        }

        .size-pill.active {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .size-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .size-price {
          font-size: 11px;
          color: var(--text-muted);
        }

        .size-pill.active .size-price {
          color: var(--accent);
          font-weight: 600;
        }

        .inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .tight-input {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 8px 10px;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 12px;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .tight-input::placeholder {
          color: var(--text-muted);
        }

        .tight-input:focus {
          border-color: var(--accent);
        }

        .flag-selector-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
        }

        .flag-row-label {
          font-size: 11px;
          color: var(--text-muted);
        }

        .flag-minis {
          display: flex;
          gap: 4px;
        }

        .mini-flag-btn {
          background: transparent;
          border: 1px solid transparent;
          border-radius: 4px;
          padding: 2px 5px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .mini-flag-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .mini-flag-btn.active {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .checkout-cta-box {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 10px;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .price-label {
          color: var(--text-secondary);
        }

        .price-amount {
          font-size: 15px;
          color: var(--green);
          font-weight: 700;
        }

        .buy-now-action-btn {
          width: 100%;
          justify-content: center;
          padding: 10px;
          font-size: 13px;
          border-radius: var(--radius-sm);
        }

        .full-form-link {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 11px;
          cursor: pointer;
          text-align: center;
          transition: color 0.15s ease;
          padding: 2px;
        }

        .full-form-link:hover {
          color: var(--accent);
          text-decoration: underline;
        }

        .owned-land-buying-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .owner-summary-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .owner-card-top {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .user-icon {
          color: var(--accent);
          flex-shrink: 0;
        }

        .plot-owner-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .plot-id-sub {
          font-size: 11px;
          color: var(--text-muted);
        }

        .plot-flag-symbol {
          margin-left: auto;
          font-size: 16px;
        }

        .plot-specs-row {
          font-size: 11px;
          color: var(--text-secondary);
          display: flex;
          gap: 6px;
        }

        .for-sale-buy-box {
          background: var(--green-soft);
          border: 1px solid rgba(34, 197, 94, 0.25);
          border-radius: var(--radius-sm);
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sale-price-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-primary);
        }

        .sale-icon {
          color: var(--green);
        }

        .sale-price-tag {
          margin-left: auto;
          font-size: 15px;
          color: var(--green);
          font-weight: 700;
        }

        .inline-bid-form {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 8px;
        }

        .bid-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .bid-inputs-row {
          display: flex;
          gap: 6px;
        }

        .price-input {
          width: 80px;
        }

        .name-input {
          flex: 1;
        }

        .submit-bid-btn {
          padding: 6px 12px;
          font-size: 12px;
        }

        .bid-success-toast {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--green);
          padding: 4px;
        }

        .owned-actions-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }

        .panel-action-btn {
          justify-content: center;
          padding: 6px 8px;
          font-size: 11px;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 600px) {
          .tight-buying-panel {
            right: 12px;
            bottom: 12px;
            width: calc(100vw - 24px);
          }
        }
      `}</style>
    </div>
  );
}
