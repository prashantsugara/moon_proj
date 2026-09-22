import React, { useState, useRef, useEffect } from 'react';
import { Search, Globe, ShieldCheck, Compass, Grid, ShoppingBag, User as UserIcon, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function HeaderNav({
  searchTerm,
  onSearchChange,
  claimedCount,
  onOpenRegistry,
  onOpenLandmarks,
  onOpenMarketplace,
  showGrid,
  onToggleGrid,
  onOpenAuth,
}) {
  const { user, profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Lunar Explorer';
  const initialLetter = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header-console glass-card">
      <div className="header-left">
        <div className="brand-logo">
          <Globe size={18} className="brand-icon" />
          <span className="brand-title">Moonlandbuy</span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-bar">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search landing sites & craters..."
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

        {user ? (
          <div className="user-menu-wrapper" ref={menuRef}>
            <button
              className="user-badge-btn"
              onClick={() => setShowUserMenu((prev) => !prev)}
            >
              <div className="avatar-circle">{initialLetter}</div>
              <span className="user-display-name">{displayName}</span>
              <ChevronDown size={13} className="chevron-icon" />
            </button>

            {showUserMenu && (
              <div className="user-dropdown glass-card">
                <div className="dropdown-header">
                  <span className="dropdown-name">{displayName}</span>
                  <span className="dropdown-email">{user.email || 'Citizen Account'}</span>
                </div>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenRegistry();
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>My Land Registry</span>
                </button>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item logout-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    signOut();
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn-secondary auth-btn" onClick={onOpenAuth}>
            <LogIn size={15} />
            <span>Sign In</span>
          </button>
        )}
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
          color: var(--accent);
        }

        .brand-title {
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 17px;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .header-center {
          flex: 1;
          max-width: 340px;
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

        .auth-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
        }

        .user-menu-wrapper {
          position: relative;
        }

        .user-badge-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border-subtle);
          padding: 4px 10px 4px 5px;
          border-radius: 20px;
          cursor: pointer;
          color: var(--text-primary);
          transition: all 0.15s ease;
        }

        .user-badge-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: var(--border-active);
        }

        .avatar-circle {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent) 0%, #3b82f6 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 700;
        }

        .user-display-name {
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 600;
          max-width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .chevron-icon {
          color: var(--text-muted);
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 220px;
          padding: 8px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 2px;
          z-index: 100;
        }

        .dropdown-header {
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dropdown-name {
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .dropdown-email {
          font-family: var(--font-sans);
          font-size: 11px;
          color: var(--text-muted);
          word-break: break-all;
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 4px 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          padding: 8px 10px;
          border-radius: 4px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          width: 100%;
          text-align: left;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
        }

        .logout-item {
          color: #f87171;
        }

        .logout-item:hover {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
        }

        @media (max-width: 900px) {
          .header-center {
            max-width: 160px;
          }
          .user-display-name {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
