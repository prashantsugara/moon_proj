import React, { useState, useEffect } from 'react';
import { X, Download, Share2, Globe, Check, Award, ShieldCheck } from 'lucide-react';
import { generateDeedImage, downloadDeedPNG } from '../utils/deedGenerator';

export default function DeedCertificateModal({
  isOpen,
  onClose,
  plotData,
  onFocusPlot
}) {
  const [deedImageSrc, setDeedImageSrc] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (plotData && isOpen) {
      generateDeedImage(plotData).then((src) => {
        setDeedImageSrc(src);
      });
    }
  }, [plotData, isOpen]);

  if (!isOpen || !plotData) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}?plot=${plotData.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="deed-modal-backdrop" onClick={onClose}>
      <div className="deed-modal-container glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="deed-header">
          <div className="header-left">
            <div className="header-icon">
              <Award size={22} />
            </div>
            <div>
              <h2>Official Lunar Title Deed</h2>
              <span className="deed-id-sub">Registry ID: {plotData.id}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="deed-body">
          <div className="deed-preview-box">
            {deedImageSrc ? (
              <img src={deedImageSrc} alt="Lunar Land Deed Certificate" className="deed-image" />
            ) : (
              <div className="deed-loading">
                <ShieldCheck size={28} className="animate-pulse" style={{ color: 'var(--accent)' }} />
                <span>Generating deed certificate...</span>
              </div>
            )}
          </div>
        </div>

        <div className="deed-footer">
          <div className="deed-info-badges">
            <span className="info-badge">
              <span className="info-label">Owner:</span>
              <strong className="info-val">{plotData.ownerName}</strong>
            </span>
            <span className="info-badge">
              <span className="info-label">Coordinates:</span>
              <span className="info-val">{plotData.lat}°, {plotData.lng}°</span>
            </span>
            <span className="info-badge">
              <span className="info-label">Area:</span>
              <span className="info-val">{plotData.acres} Acre(s)</span>
            </span>
          </div>

          <div className="deed-actions">
            {onFocusPlot && (
              <button className="btn-ghost" onClick={() => { onFocusPlot(plotData); onClose(); }}>
                <Globe size={15} />
                <span>Locate on Moon</span>
              </button>
            )}

            <button className="btn-ghost" onClick={handleCopyLink}>
              {copiedLink ? <Check size={15} style={{ color: 'var(--green)' }} /> : <Share2 size={15} />}
              <span>{copiedLink ? 'Link copied' : 'Share deed'}</span>
            </button>

            <button className="btn-primary" onClick={() => downloadDeedPNG(plotData)}>
              <Download size={15} />
              <span>Download Deed (PNG)</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .deed-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 110;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .deed-modal-container {
          width: 940px;
          max-width: 100%;
          max-height: 92vh;
          display: flex;
          flex-direction: column;
          border-radius: var(--radius);
          padding: 24px;
          border: 1px solid var(--border-active);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }

        .deed-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-icon {
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-left h2 {
          font-family: var(--font-sans);
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .deed-id-sub {
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--text-secondary);
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border-radius: var(--radius-sm);
          transition: background 0.15s ease, color 0.15s ease;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .deed-body {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          margin-bottom: 20px;
          min-height: 0;
        }

        .deed-preview-box {
          width: 100%;
          max-height: 60vh;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: #000000;
          border: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .deed-image {
          width: 100%;
          height: auto;
          object-fit: contain;
          max-height: 60vh;
          display: block;
        }

        .deed-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 13px;
          padding: 60px;
        }

        .deed-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          border-top: 1px solid var(--border-subtle);
          padding-top: 16px;
        }

        .deed-info-badges {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .info-badge {
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--text-secondary);
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .info-label {
          color: var(--text-muted);
          font-weight: 500;
        }

        .info-val {
          color: var(--text-primary);
          font-weight: 500;
        }

        .deed-actions {
          display: flex;
          gap: 10px;
          margin-left: auto;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @media (max-width: 768px) {
          .deed-modal-container {
            padding: 16px;
            max-height: 96vh;
          }
          .deed-footer {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .deed-info-badges {
            justify-content: flex-start;
          }
          .deed-actions {
            margin-left: 0;
            justify-content: stretch;
            flex-direction: column;
          }
          .deed-actions button {
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
