import React, { useState } from 'react';
import { X, Sparkles, CreditCard, Shield, Flag, CheckCircle2, Loader2, Award, Zap, Building } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FLAG_TEMPLATES } from '../data/lunarRegions';

export default function PlotClaimModal({
  isOpen,
  onClose,
  coordinates,
  selectedRegion,
  onClaimSuccess
}) {
  const [ownerName, setOwnerName] = useState('');
  const [plotTitle, setPlotTitle] = useState('');
  const [motto, setMotto] = useState('Per Aspera Ad Astra');
  const [sqftOption, setSqftOption] = useState(100);
  const [selectedFlagId, setSelectedFlagId] = useState('apollo');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !coordinates) return null;

  const SQFT_PRESETS = [
    { label: '1 sq ft', sqft: 1, price: 1.99, acres: 0.000023 },
    { label: '100 sq ft', sqft: 100, price: 19.99, acres: 0.0023 },
    { label: '1,000 sq ft', sqft: 1000, price: 149.00, acres: 0.023 },
    { label: '1 acre (43,560 sq ft)', sqft: 43560, price: selectedRegion ? selectedRegion.pricePerAcre : 249.00, acres: 1 }
  ];

  const activePreset = SQFT_PRESETS.find((p) => p.sqft === sqftOption) || SQFT_PRESETS[1];
  const regFee = 5.00;
  const totalPrice = Number((activePreset.price + regFee).toFixed(2));
  const activeFlag = FLAG_TEMPLATES.find((f) => f.id === selectedFlagId) || FLAG_TEMPLATES[0];

  const handleSubmitClaim = (e) => {
    e.preventDefault();
    if (!ownerName.trim() || !plotTitle.trim()) return;

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#60a5fa', '#ffffff', '#22c55e']
      });

      const newClaim = {
        id: `SQFT-${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        ownerName: ownerName.trim(),
        title: plotTitle.trim(),
        lat: coordinates.lat,
        lng: coordinates.lng,
        sqft: activePreset.sqft,
        acres: activePreset.acres,
        totalPaid: totalPrice,
        regionName: selectedRegion ? selectedRegion.name : 'Custom Surface Sector',
        motto: motto.trim() || 'Per Aspera Ad Astra',
        flagId: activeFlag.id,
        flagColor1: activeFlag.color1,
        flagColor2: activeFlag.color2,
        flagSymbol: activeFlag.symbol,
        claimedAt: new Date().toISOString(),
        txHash: `REG-${Math.random().toString(16).substring(2, 10).toUpperCase()}`
      };

      onClaimSuccess(newClaim);
    }, 1600);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles size={20} color="var(--accent)" />
            <div>
              <h2>Register Land</h2>
              <span className="modal-sub">
                Lat: {coordinates.lat}° · Lng: {coordinates.lng}° ({selectedRegion ? selectedRegion.name : 'Custom Surface Plot'})
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} disabled={isProcessing} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmitClaim} className="modal-body">
          <div className="form-column">
            <div className="form-group">
              <label>Your name</label>
              <input
                type="text"
                placeholder="e.g. Alex Mercer"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                disabled={isProcessing}
              />
            </div>

            <div className="form-group">
              <label>Plot name</label>
              <input
                type="text"
                placeholder="e.g. Tranquility Base Alpha"
                value={plotTitle}
                onChange={(e) => setPlotTitle(e.target.value)}
                required
                disabled={isProcessing}
              />
            </div>

            <div className="form-group">
              <label>Motto (optional)</label>
              <input
                type="text"
                placeholder="e.g. Per Aspera Ad Astra"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="form-group">
              <label>Plot size</label>
              <div className="sqft-picker-grid">
                {SQFT_PRESETS.map((preset) => (
                  <button
                    key={preset.sqft}
                    type="button"
                    className={`sqft-option-btn ${sqftOption === preset.sqft ? 'active' : ''}`}
                    onClick={() => setSqftOption(preset.sqft)}
                    disabled={isProcessing}
                  >
                    <span className="preset-label">{preset.label}</span>
                    <span className="preset-price">${preset.price}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Flag</label>
              <div className="flags-grid">
                {FLAG_TEMPLATES.map((flag) => (
                  <div
                    key={flag.id}
                    className={`flag-item ${selectedFlagId === flag.id ? 'selected' : ''}`}
                    onClick={() => setSelectedFlagId(flag.id)}
                  >
                    <div
                      className="flag-preview-box"
                      style={{
                        background: `linear-gradient(135deg, ${flag.color1} 0%, ${flag.color2} 100%)`
                      }}
                    >
                      <span className="flag-symbol">{flag.symbol}</span>
                    </div>
                    <span className="flag-label">{flag.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-column summary-column">
            <div className="summary-box">
              <h3>Registration summary</h3>

              <div className="summary-row">
                <span>Location</span>
                <span>{selectedRegion ? selectedRegion.name : 'Custom Surface Plot'}</span>
              </div>
              <div className="summary-row">
                <span>Coordinates</span>
                <span>{coordinates.lat}°, {coordinates.lng}°</span>
              </div>
              <div className="summary-row">
                <span>Plot size</span>
                <span>{activePreset.sqft.toLocaleString()} sq ft</span>
              </div>
              <div className="summary-row">
                <span>Processing fee</span>
                <span>${regFee.toFixed(2)}</span>
              </div>

              <div className="summary-divider" />

              <div className="summary-row total-row">
                <span>Total</span>
                <span className="total-amount">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
              <label>Payment method</label>
              <div className="payment-options">
                <button
                  type="button"
                  className={`pay-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                  disabled={isProcessing}
                >
                  <CreditCard size={15} />
                  <span>Credit card</span>
                </button>
                <button
                  type="button"
                  className={`pay-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('paypal')}
                  disabled={isProcessing}
                >
                  <Building size={15} />
                  <span>Instant pay</span>
                </button>
              </div>
            </div>

            <div className="guarantee-badge">
              <Shield size={15} color="var(--accent)" />
              <span>Official deed certified under Lunar Land Registry</span>
            </div>

            <button type="submit" className="btn-primary submit-claim-btn" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Confirm & Register (${totalPrice.toFixed(2)})</span>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-backdrop {
          position: absolute;
          inset: 0;
          z-index: 100;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-container {
          width: 860px;
          max-width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-title h2 {
          font-family: var(--font-sans);
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .modal-sub {
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--text-muted);
        }

        .modal-close {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease, background 0.15s ease;
        }

        .modal-close:hover:not(:disabled) {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .modal-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .form-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-group input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 13px;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .form-group input::placeholder {
          color: var(--text-muted);
        }

        .form-group input:focus {
          border-color: var(--accent);
        }

        .sqft-picker-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .sqft-option-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          color: var(--text-secondary);
          gap: 2px;
          transition: all 0.15s ease;
          font-family: var(--font-sans);
        }

        .sqft-option-btn:hover:not(:disabled) {
          border-color: var(--border-active);
          color: var(--text-primary);
        }

        .sqft-option-btn.active {
          border-color: var(--accent);
          background: var(--accent-soft);
          color: var(--text-primary);
        }

        .preset-label {
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .preset-price {
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--text-secondary);
        }

        .sqft-option-btn.active .preset-price {
          color: var(--accent);
          font-weight: 600;
        }

        .flags-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }

        .flag-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          padding: 6px 4px;
          border-radius: var(--radius-sm);
          border: 1px solid transparent;
          transition: all 0.15s ease;
        }

        .flag-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .flag-item.selected {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .flag-preview-box {
          width: 38px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .flag-symbol {
          font-size: 13px;
        }

        .flag-label {
          font-family: var(--font-sans);
          font-size: 10px;
          color: var(--text-secondary);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        .flag-item.selected .flag-label {
          color: var(--text-primary);
          font-weight: 500;
        }

        .summary-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .summary-box h3 {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--text-secondary);
        }

        .summary-row span:last-child {
          color: var(--text-primary);
          font-weight: 500;
        }

        .summary-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 4px 0;
        }

        .total-row {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          align-items: baseline;
        }

        .total-amount {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .payment-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .pay-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .pay-btn:hover:not(:disabled) {
          border-color: var(--border-active);
          color: var(--text-primary);
        }

        .pay-btn.active {
          border-color: var(--accent);
          background: var(--accent-soft);
          color: var(--text-primary);
        }

        .guarantee-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
        }

        .submit-claim-btn {
          width: 100%;
          justify-content: center;
          padding: 12px;
          font-size: 13px;
          margin-top: 4px;
          border-radius: var(--radius-sm);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .modal-body { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
