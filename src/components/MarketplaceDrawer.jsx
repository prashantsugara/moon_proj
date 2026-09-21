import React, { useState } from 'react';
import { X, ShoppingBag, Users, Tag, History, Send, Globe, Check, AlertCircle, PlusCircle } from 'lucide-react';

export default function MarketplaceDrawer({
  isOpen,
  onClose,
  claimedPlots,
  onSelectPlot,
  onOpenTrail,
  onListPlotForSale,
  onAcceptBid,
  onBuyListedPlot
}) {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'marketplace' | 'my-bids'
  const [listPriceInput, setListPriceInput] = useState({});

  if (!isOpen) return null;

  const listedPlots = claimedPlots.filter((p) => p.forSale);

  return (
    <div className="marketplace-drawer-backdrop" onClick={onClose}>
      <div className="marketplace-drawer glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="header-title-group">
            <ShoppingBag size={20} className="header-icon" />
            <h2>Marketplace</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="tab-buttons-row">
          <button
            className={`tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
            onClick={() => setActiveTab('directory')}
          >
            <Users size={15} />
            <span>Landowners ({claimedPlots.length})</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'marketplace' ? 'active' : ''}`}
            onClick={() => setActiveTab('marketplace')}
          >
            <Tag size={15} />
            <span>For Sale ({listedPlots.length})</span>
          </button>
        </div>

        {/* TAB 1: LANDOWNERS DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="drawer-tab-content">
            <p className="tab-sub">Searchable public ledger of all registered lunar parcel titleholders.</p>
            <div className="plots-list">
              {claimedPlots.map((plot) => (
                <div key={plot.id} className="plot-directory-card">
                  <div className="card-top">
                    <div className="plot-info">
                      <span className="plot-id">{plot.id}</span>
                      <h3 className="plot-title">{plot.title}</h3>
                    </div>
                    <span className="flag-badge">{plot.flagSymbol || '🚩'}</span>
                  </div>

                  <div className="plot-owner-meta">
                    <div className="meta-row">
                      <span className="label">Owner:</span>
                      <strong className="val">{plot.ownerName}</strong>
                    </div>
                    <div className="meta-row">
                      <span className="label">Size:</span>
                      <strong className="val">{(plot.acres ? plot.acres * 43560 : plot.sqft || 100).toLocaleString()} sq ft</strong>
                    </div>
                    <div className="meta-row">
                      <span className="label">Region:</span>
                      <strong className="val">{plot.regionName}</strong>
                    </div>
                  </div>

                  <div className="card-actions-row">
                    <button className="btn-ghost card-btn" onClick={() => onSelectPlot(plot)}>
                      <Globe size={14} />
                      <span>Locate</span>
                    </button>

                    <button className="btn-ghost card-btn" onClick={() => onOpenTrail(plot)}>
                      <History size={14} />
                      <span>Trail & Bids ({(plot.bids || []).length})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MARKETPLACE FOR SALE */}
        {activeTab === 'marketplace' && (
          <div className="drawer-tab-content">
            <p className="tab-sub">Secondary market parcels listed for immediate purchase.</p>
            {listedPlots.length === 0 ? (
              <div className="empty-state">
                <Tag size={36} className="empty-icon" />
                <h3>No parcels currently for sale</h3>
                <p>Check the Landowners tab to inspect owned plots and place custom bids.</p>
              </div>
            ) : (
              <div className="plots-list">
                {listedPlots.map((plot) => (
                  <div key={plot.id} className="plot-directory-card">
                    <div className="card-top">
                      <div className="plot-info">
                        <span className="plot-id">{plot.id}</span>
                        <h3 className="plot-title">{plot.title}</h3>
                      </div>
                      <span className="sale-price-badge">${plot.listPrice.toLocaleString()}</span>
                    </div>

                    <div className="plot-owner-meta">
                      <div className="meta-row">
                        <span className="label">Owner:</span>
                        <strong className="val">{plot.ownerName}</strong>
                      </div>
                      <div className="meta-row">
                        <span className="label">Region:</span>
                        <strong className="val">{plot.regionName}</strong>
                      </div>
                    </div>

                    <div className="card-actions-row">
                      <button className="btn-ghost card-btn" onClick={() => onOpenTrail(plot)}>
                        <History size={14} />
                        <span>Trail</span>
                      </button>

                      <button
                        className="btn-primary card-btn"
                        onClick={() => {
                          onBuyListedPlot(plot);
                          onClose();
                        }}
                      >
                        <Tag size={14} />
                        <span>Buy Now (${plot.listPrice.toLocaleString()})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .marketplace-drawer-backdrop {
          position: absolute;
          inset: 0;
          z-index: 95;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: flex;
          justify-content: flex-end;
        }

        .marketplace-drawer {
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
          margin-bottom: 16px;
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

        .tab-buttons-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 16px;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
          border-color: var(--border-active);
        }

        .tab-btn.active {
          border-color: var(--accent);
          color: var(--text-primary);
          background: var(--accent-soft);
          font-weight: 600;
        }

        .drawer-tab-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .tab-sub {
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 14px;
          line-height: 1.4;
        }

        .plots-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-right: 4px;
        }

        .plot-directory-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .plot-directory-card:hover {
          border-color: var(--border-active);
          background: rgba(255, 255, 255, 0.05);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .plot-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .plot-id {
          font-family: var(--font-sans);
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .plot-title {
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .flag-badge {
          font-size: 18px;
          line-height: 1;
        }

        .sale-price-badge {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 600;
          color: var(--green);
          background: var(--green-soft);
          border: 1px solid rgba(34, 197, 94, 0.25);
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          white-space: nowrap;
        }

        .plot-owner-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 12px;
          font-family: var(--font-sans);
          font-size: 12px;
          background: rgba(0, 0, 0, 0.2);
          padding: 8px 10px;
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
          font-size: 11px;
          flex-shrink: 0;
        }

        .meta-row .val {
          color: var(--text-primary);
          font-weight: 500;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-actions-row {
          display: flex;
          gap: 8px;
        }

        .card-btn {
          flex: 1;
          justify-content: center;
          padding: 7px 12px;
          font-size: 12px;
        }

        .empty-state {
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

        .empty-state h3 {
          font-family: var(--font-sans);
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .empty-state p {
          font-family: var(--font-sans);
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 500px) {
          .marketplace-drawer { width: 100%; }
        }
      `}</style>
    </div>
  );
}
