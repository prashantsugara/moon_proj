import React from 'react';
import { X, ShieldCheck, MapPin, Award, Globe, Trash2, Calendar, FileText } from 'lucide-react';

export default function MyRegistryDrawer({
  isOpen,
  onClose,
  claimedPlots,
  onSelectPlot,
  onOpenDeed,
  onDeleteClaim
}) {
  if (!isOpen) return null;

  return (
    <div className="registry-drawer-backdrop" onClick={onClose}>
      <div className="registry-drawer glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="header-title-group">
            <ShieldCheck size={20} className="header-icon" />
            <h2>My Land</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <p className="drawer-sub">
          Official ledger of all verified land titles under your ownership account.
        </p>

        {claimedPlots.length === 0 ? (
          <div className="empty-registry">
            <Award size={40} className="empty-icon" />
            <h3>No claims yet</h3>
            <p>Select any region or click coordinates on the Moon surface to register your first parcel.</p>
          </div>
        ) : (
          <div className="claims-list">
            {claimedPlots.map((plot) => (
              <div key={plot.id} className="claim-card">
                <div className="card-top">
                  <div className="title-area">
                    <span className="claim-id">{plot.id}</span>
                    <h3 className="claim-title">{plot.title}</h3>
                  </div>
                  <span className="flag-badge">{plot.flagSymbol || '🚩'}</span>
                </div>

                <div className="claim-meta">
                  <div className="meta-row">
                    <span className="label">Owner:</span>
                    <span className="val">{plot.ownerName}</span>
                  </div>
                  <div className="meta-row">
                    <span className="label">Region:</span>
                    <span className="val">{plot.regionName}</span>
                  </div>
                  <div className="meta-row">
                    <span className="label">Coords:</span>
                    <span className="val">{plot.lat}°, {plot.lng}°</span>
                  </div>
                  <div className="meta-row">
                    <span className="label">Acres:</span>
                    <span className="val">{plot.acres} Acre(s)</span>
                  </div>
                </div>

                <div className="card-motto">
                  <em>"{plot.motto || 'Per Aspera Ad Astra'}"</em>
                </div>

                <div className="card-actions">
                  <button className="btn-ghost card-btn" onClick={() => onSelectPlot(plot)}>
                    <Globe size={14} />
                    <span>Locate</span>
                  </button>

                  <button className="btn-primary card-btn" onClick={() => onOpenDeed(plot)}>
                    <FileText size={14} />
                    <span>View Deed</span>
                  </button>

                  {onDeleteClaim && (
                    <button
                      className="btn-ghost card-btn delete-btn"
                      onClick={() => onDeleteClaim(plot.id)}
                      title="Relinquish Claim"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .registry-drawer-backdrop {
          position: absolute;
          inset: 0;
          z-index: 90;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          justify-content: flex-end;
        }

        .registry-drawer {
          width: 440px;
          height: 100%;
          padding: 24px;
          display: flex;
          flex-direction: column;
          animation: slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          border-left: 1px solid var(--border-subtle);
          border-right: none;
          border-top: none;
          border-bottom: none;
          border-radius: 0;
        }

        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .header-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-primary);
        }

        .header-icon {
          color: var(--accent);
        }

        .header-title-group h2 {
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: var(--radius-sm);
          transition: color 0.15s ease, background 0.15s ease;
        }

        .close-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .drawer-sub {
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .empty-registry {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--text-muted);
          gap: 12px;
          padding: 40px 24px;
        }

        .empty-icon {
          color: var(--text-muted);
        }

        .empty-registry h3 {
          font-family: var(--font-sans);
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .empty-registry p {
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .claims-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-right: 4px;
        }

        .claim-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: border-color 0.15s ease;
        }

        .claim-card:hover {
          border-color: var(--border-active);
        }

        .card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .title-area {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .claim-id {
          font-family: var(--font-sans);
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .claim-title {
          font-family: var(--font-sans);
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 600;
        }

        .flag-badge {
          font-size: 20px;
          line-height: 1;
        }

        .claim-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-family: var(--font-sans);
          font-size: 12px;
          background: rgba(0, 0, 0, 0.25);
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .meta-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          overflow: hidden;
        }

        .meta-row .label {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .meta-row .val {
          color: var(--text-primary);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-motto {
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--text-secondary);
          font-style: italic;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .card-btn {
          flex: 1;
          justify-content: center;
          padding: 7px 12px;
          font-size: 12px;
        }

        .delete-btn {
          flex: 0 0 auto;
          color: var(--red);
          border-color: rgba(239, 68, 68, 0.3);
          padding: 7px 10px;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: var(--red);
          color: var(--red);
        }

        @media (max-width: 500px) {
          .registry-drawer { width: 100%; }
        }
      `}</style>
    </div>
  );
}
