import React from 'react';
import { Search, Globe, ShieldCheck, Compass, Grid, ShoppingBag } from 'lucide-react';

export default function HeaderNav({
  searchTerm,
  onSearchChange,
  claimedCount,
  onOpenRegistry,
  onOpenLandmarks,
  onOpenMarketplace,
  showGrid,
  onToggleGrid
}) {
  return (
    <header className="header-console glass-card">
      <div className="header-left">
        <div className="brand-logo">
          <Globe size={18} className="brand-icon" />
          <span className="brand-title">Luna</span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-bar">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search landing sites..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="header-right">
        <button
          className={`btn-ghost ${showGrid ? 'active' : ''}`}
          onClick={onToggleGrid}
          title="Toggle grid"
        >
          <Grid size={15} />
          <span>{showGrid ? 'Grid on' : 'Grid off'}</span>
        </button>

        <button className="btn-ghost" onClick={onOpenLandmarks}>
          <Compass size={15} />
          <span>Sites</span>
        </button>

        <button className="btn-ghost" onClick={onOpenMarketplace}>
          <ShoppingBag size={15} />
          <span>Market</span>
        </button>

        <button className="btn-primary" onClick={onOpenRegistry}>
          <ShieldCheck size={15} />
          <span>My Land ({claimedCount})</span>
        </button>
      </div>

      <style>{`
        .header-console {
          position: absolute;
          top: 16px;
          left: 16px;
          right: 16px;
          height: 56px;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
        }

        .header-left {
          display: flex;
          align-items: center;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-primary);
        }

        .brand-icon {
          color: var(--text-primary);
        }

        .brand-title {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 18px;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .header-center {
          flex: 1;
          max-width: 360px;
          margin: 0 16px;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-subtle);
          padding: 7px 12px;
          border-radius: var(--radius-sm);
          transition: border-color 0.15s ease;
        }

        .search-bar:focus-within {
          border-color: var(--border-active);
        }

        .search-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .search-bar input {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 13px;
          width: 100%;
        }

        .search-bar input::placeholder {
          color: var(--text-muted);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-ghost.active {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
          border-color: var(--border-active);
        }

        @media (max-width: 900px) {
          .header-center {
            max-width: 180px;
          }
        }
      `}</style>
    </header>
  );
}
