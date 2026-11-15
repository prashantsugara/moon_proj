import { REGISTRATION_PRICES, formatRegistrationPrice } from '@/lib/registrationPrice';
import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Shield, Flag, CheckCircle2, Loader2, Award, Zap } from 'lucide-react';
import { FLAG_TEMPLATES } from '../data/lunarRegions';
import { generateDeedImage } from '../utils/deedGenerator';
import { useAuth } from '@/context/AuthContext';

export default function PlotClaimModal({
  isOpen,
  onClose,
  coordinates,
  initialDraft,
  hidden,
  onClaimSuccess
}) {
  const { user, profile, loading } = useAuth();
  const [ownerName, setOwnerName] = useState(initialDraft?.ownerName ?? '');
  const [plotTitle, setPlotTitle] = useState(initialDraft?.title ?? '');
  const [motto, setMotto] = useState(initialDraft?.motto ?? '');
  const [sqftOption, setSqftOption] = useState(initialDraft?.sqft ?? 1);
  const [selectedFlagId, setSelectedFlagId] = useState(initialDraft?.flagId ?? 'apollo');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [previewing, setPreviewing] = useState(!!initialDraft);
  const [flagSearch, setFlagSearch] = useState('');
  const [preview, setPreview] = useState(null);
  const modalRef = useRef(null);
  useEffect(() => {
    if (modalRef.current) modalRef.current.scrollTop = 0;
  }, [previewing]);

  useEffect(() => {
    if (!previewing || !isOpen || hidden) return;
    let current = true;
    const flag = FLAG_TEMPLATES.find((item) => item.id === selectedFlagId) ?? FLAG_TEMPLATES[0];
    setPreview(null);
    generateDeedImage({
      ...coordinates, title: plotTitle, ownerName, motto, sqft: sqftOption,
      acres: sqftOption / 43560, flagColor1: flag.color1, flagColor2: flag.color2,
      flagSymbol: flag.symbol, flagId: flag.id, regionName: 'Lunar Surface', draft: true,
    }).then((image) => { if (current) setPreview(image); })
      .catch(() => { if (current) setErrorMessage('The image preview could not be generated.'); });
    return () => { current = false; };
  }, [previewing, isOpen, hidden, coordinates, plotTitle, ownerName, motto, sqftOption, selectedFlagId]);

  useEffect(() => {
    if (isOpen) {
      const defaultName = profile?.full_name || user?.email?.split('@')[0] || '';
      if (defaultName && !ownerName) {
        setOwnerName(defaultName);
      }
    }
  }, [isOpen, profile, user]);

  if (!isOpen || hidden || !coordinates) return null;

  const SQFT_PRESETS = [
    { label: '1 sq ft', sqft: 1 },
    { label: '100 sq ft', sqft: 100 },
    { label: '1,000 sq ft', sqft: 1000 },
    { label: '1 acre (43,560 sq ft)', sqft: 43560 }
  ];

  const query = flagSearch.trim().toLowerCase();
  const matchingFlags = FLAG_TEMPLATES.filter((flag) =>
    flag.name.toLowerCase().includes(query) || flag.code.toLowerCase() === query);
  const activePreset = SQFT_PRESETS.find((p) => p.sqft === sqftOption) || SQFT_PRESETS[0];
  const handleSubmitClaim = async (event) => {
    event.preventDefault();
    if (isProcessing || !ownerName.trim() || !plotTitle.trim()) return;
    setErrorMessage('');
    if (!previewing) { setPreviewing(true); return; }
    setIsProcessing(true);
    try {
      await onClaimSuccess({
        ownerName: ownerName.trim(),
        title: plotTitle.trim(),
        sqft: activePreset.sqft,
        motto: motto.trim(),
        flagId: selectedFlagId,
        coordinates,
      });
    } catch (error) {
      setErrorMessage(error.message || 'Registration failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={isProcessing ? undefined : onClose}>
      <div ref={modalRef} className="modal-container glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles size={20} color="var(--accent)" />
            <div>
              <h2>{previewing ? 'Preview your certificate' : 'Personalize your certificate'}</h2>
              <span className="modal-sub">
                Lat: {coordinates.lat}° · Lng: {coordinates.lng}°
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} disabled={isProcessing} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmitClaim} className={previewing ? 'modal-body certificate-preview' : 'modal-body'}>
          {previewing ? <div className="form-column">
            {preview ? <img className="certificate-preview-image" src={preview} alt="Your commemorative lunar certificate preview" />
              : <p>{plotTitle} · {ownerName} · {sqftOption.toLocaleString()} sq ft</p>}
            <button className="btn-ghost" type="button" disabled={isProcessing} onClick={() => setPreviewing(false)}>Edit details</button>
          </div> : <div className="form-column">
            <div className="form-group">
              <label htmlFor="claim-name">Display name</label>
              <input
                type="text"
                placeholder="e.g. Alex Mercer"
                id="claim-name" value={ownerName}
                maxLength={100}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                disabled={isProcessing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="claim-title">Plot name</label>
              <input
                type="text"
                placeholder="e.g. Tranquility Base Alpha"
                id="claim-title" value={plotTitle}
                maxLength={120}
                onChange={(e) => setPlotTitle(e.target.value)}
                required
                disabled={isProcessing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="claim-motto">Motto (optional)</label>
              <input
                type="text"
                placeholder="e.g. Per Aspera Ad Astra"
                id="claim-motto" value={motto}
                maxLength={200}
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
                    <span className="preset-label">{preset.label} · {formatRegistrationPrice(REGISTRATION_PRICES[preset.sqft])}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="flag-search">Search flags</label>
              <input id="flag-search" type="search" placeholder="Country, territory, or code"
                value={flagSearch} onChange={(event) => setFlagSearch(event.target.value)} />
              <div className="flags-grid" style={{ maxHeight: 230, overflowY: "auto" }}>
                {matchingFlags.map((flag) => (
                  <button type="button" aria-pressed={selectedFlagId === flag.id}
                    key={flag.id}
                    className={`flag-item ${selectedFlagId === flag.id ? 'selected' : ''}`}
                    onClick={() => setSelectedFlagId(flag.id)}
                  >
                    <div
                      className="flag-preview-box"
                      style={{
                        background: flag.image ? "#101824" : `linear-gradient(135deg, ${flag.color1} 0%, ${flag.color2} 100%)`
                      }}
                    >
                      {flag.image ? <img loading="lazy" src={flag.image} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span className="flag-symbol">{flag.symbol}</span>}
                    </div>
                    <span className="flag-label">{flag.name}</span>
                  </button>
                ))}
              </div>
              {!matchingFlags.length && <p role="status">No flags match your search.</p>}
            </div>
          </div>}

          <div className="form-column summary-column">
            {errorMessage && <p role="alert">{errorMessage}</p>}
            <div className="guarantee-badge">
              <Shield size={15} color="var(--accent)" />
              <span>This certificate is commemorative. Saving publishes your display name and plot details.</span>
            </div>

            <button type="submit" className="btn-primary submit-claim-btn" disabled={isProcessing || (previewing && loading)}>
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Opening checkout…</span>
                </>
              ) : (
                <span>{previewing ? (user ? `Pay ${formatRegistrationPrice(REGISTRATION_PRICES[activePreset.sqft])} and register` : "Sign in to continue") : "Preview certificate"}</span>
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
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 24px;
        }

        .certificate-preview {
          grid-template-columns: minmax(0, 1fr);
        }

        .certificate-preview-image {
          display: block;
          width: 100%;
          height: auto;
        }

        .form-column {
          min-width: 0;
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
          min-width: 0;
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
          grid-template-columns: repeat(2, minmax(0, 1fr));
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
          overflow-wrap: anywhere;
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
          grid-template-columns: repeat(auto-fill, minmax(58px, 1fr));
          gap: 8px;
        }

        .flag-item {
          min-width: 0;
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
          .modal-body { grid-template-columns: minmax(0, 1fr); }
        }
      `}</style>
    </div>
  );
}
