import React, { useState } from 'react';
import { X, MapPin, ChevronRight, Compass } from 'lucide-react';

export default function LandmarkSelector({
  isOpen,
  onClose,
  regions,
  selectedRegion,
  onSelectRegion
}) {
  const [activeCategory, setActiveCategory] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', 'Apollo', 'Recent', 'Landmark'];
  
  const filteredRegions = regions.filter(region => 
    activeCategory === 'All' || region.category === activeCategory
  );

  return (
    <div className="landmark-drawer-backdrop" onClick={onClose}>
      <div className="landmark-drawer glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="header-title-group">
            <Compass size={20} />
            <h2>Landing Sites</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p className="drawer-sub">
          Select famous NASA landing sites or landmark coordinates to view availability and claim land.
        </p>

        <div className="category-tabs">
          {categories.map(cat => (
            <button 
              key={cat}
              className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="landmark-list">
          {filteredRegions.map((region) => {
            const isSelected = selectedRegion?.id === region.id;
            const isAvailable = region.status === 'Available';

            return (
              <div
                key={region.id}
                className={`landmark-card ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  onSelectRegion(region);
                  onClose();
                }}
              >
                <div className="card-top">
                  <div className="title-area">
                    <span className="region-name">{region.name}</span>
                    <span className="region-sub">{region.subName}</span>
                  </div>
                  <span className={isAvailable ? 'badge-available' : 'badge-claimed'}>
                    {isAvailable ? 'Available' : 'Claimed'}
                  </span>
                </div>

                <p className="card-desc">{region.description}</p>

                <div className="card-meta">
                  <span className="coords-text">
                    <MapPin size={12} />
                    <span>Lat: {region.lat}° | Lng: {region.lng}°</span>
                  </span>
                  <span className="price-tag">
                    {isAvailable ? `$${region.pricePerAcre}/acre` : `Owned by ${region.owner}`}
                  </span>
                </div>

                <div className="card-action">
                  <span>{isAvailable ? 'Click to claim parcel' : 'View registered deed'}</span>
                  <ChevronRight size={16} className="arrow-icon" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .landmark-drawer-backdrop {
          position: absolute;
          inset: 0;
          z-index: 90;
          background: rgba(10, 10, 10, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: flex-start;
          font-family: var(--font-sans);
        }

        .landmark-drawer {
          width: 440px;
          height: 100%;
          padding: 24px;
          display: flex;
          flex-direction: column;
          animation: slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border-right: 1px solid var(--border-subtle);
          background: var(--bg-card);
        }

        @keyframes slideRight {
          from { transform: translateX(-100%); }
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

        .header-title-group h2 {
          font-family: var(--font-sans);
          font-size: 16px;
          font-weight: 600;
          margin: 0;
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
        }
        
        .close-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .drawer-sub {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .category-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .tab-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
        }

        .tab-btn.active {
          background: var(--text-primary);
          color: var(--bg-dark);
          border-color: var(--text-primary);
          font-weight: 500;
        }

        .landmark-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-right: 4px;
        }

        .landmark-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .landmark-list::-webkit-scrollbar-thumb {
          background: var(--border-active);
          border-radius: var(--radius-full);
        }

        .landmark-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius);
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .landmark-card:hover {
          border-color: var(--border-active);
          background: rgba(255, 255, 255, 0.05);
        }

        .landmark-card.active {
          border-color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .title-area {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .region-name {
          font-family: var(--font-sans);
          font-weight: 500;
          font-size: 15px;
          color: var(--text-primary);
        }

        .region-sub {
          font-size: 12px;
          color: var(--text-muted);
        }
        
        .badge-available {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: rgba(34, 197, 94, 0.15);
          color: var(--green);
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .badge-claimed {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: rgba(59, 130, 246, 0.15);
          color: var(--accent);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .card-desc {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.2);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          margin-bottom: 12px;
          font-size: 11px;
        }

        .coords-text {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
        }

        .price-tag {
          color: var(--text-primary);
          font-weight: 500;
        }

        .card-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: var(--text-muted);
          transition: color 0.2s;
        }
        
        .arrow-icon {
          transition: transform 0.2s;
        }

        .landmark-card:hover .card-action {
          color: var(--text-secondary);
        }

        .landmark-card:hover .arrow-icon {
          color: var(--text-primary);
          transform: translateX(4px);
        }

        @media (max-width: 500px) {
          .landmark-drawer { width: 100%; }
        }
      `}</style>
    </div>
  );
}
