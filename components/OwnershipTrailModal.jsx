import { X, History } from 'lucide-react';

export default function OwnershipTrailModal({ isOpen, onClose, plot }) {
  if (!isOpen || !plot) return null;

  return (
    <div className="trail-modal-backdrop" onClick={onClose}>
      <div className="trail-modal-container glass-card" role="dialog" aria-modal="true"
        aria-label="Registration history" onClick={(event) => event.stopPropagation()}>
        <div className="trail-header">
          <div className="header-title-group">
            <History size={18} />
            <div>
              <h2>Registration history</h2>
              <span className="trail-plot-sub">{plot.title}</span>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="trail-column">
          <p>Registered to {plot.ownerName} on {new Date(plot.claimedAt).toLocaleDateString()}.</p>
          <p>{plot.sqft.toLocaleString()} sq ft</p>
          <p>Registration ID {plot.id}</p>
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
