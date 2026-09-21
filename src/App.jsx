import React, { useState, useEffect, useMemo } from 'react';
import MoonGlobe from './components/MoonGlobe';
import HeaderNav from './components/HeaderNav';
import TelemetryBar from './components/TelemetryBar';
import LandmarkSelector from './components/LandmarkSelector';
import PlotClaimModal from './components/PlotClaimModal';
import DeedCertificateModal from './components/DeedCertificateModal';
import MyRegistryDrawer from './components/MyRegistryDrawer';
import MarketplaceDrawer from './components/MarketplaceDrawer';
import OwnershipTrailModal from './components/OwnershipTrailModal';
import { LUNAR_REGIONS, INITIAL_CLAIMED_PLOTS } from './data/lunarRegions';

export default function App() {
  const [activeCoordinates, setActiveCoordinates] = useState({ lat: 0.674, lng: 23.473 });
  const [selectedRegion, setSelectedRegion] = useState(LUNAR_REGIONS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGrid, setShowGrid] = useState(true);

  // Drawers & Modals
  const [isLandmarksOpen, setIsLandmarksOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [activeDeedPlot, setActiveDeedPlot] = useState(null);
  const [activeTrailPlot, setActiveTrailPlot] = useState(null);

  // Load claims from LocalStorage
  const [claimedPlots, setClaimedPlots] = useState(() => {
    try {
      const saved = localStorage.getItem('luna_registry_claims');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load claims:', e);
    }
    return INITIAL_CLAIMED_PLOTS;
  });

  // Save claims on change
  useEffect(() => {
    try {
      localStorage.setItem('luna_registry_claims', JSON.stringify(claimedPlots));
    } catch (e) {
      console.error('Failed to save claims:', e);
    }
  }, [claimedPlots]);

  // Filtered regions based on search
  const filteredRegions = useMemo(() => {
    if (!searchTerm.trim()) return LUNAR_REGIONS;
    const term = searchTerm.toLowerCase();
    return LUNAR_REGIONS.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.subName.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // Search input handler
  const handleSearchChange = (val) => {
    setSearchTerm(val);
    if (val.trim()) {
      const match = LUNAR_REGIONS.find((r) => r.name.toLowerCase().includes(val.toLowerCase()));
      if (match) {
        setSelectedRegion(match);
        setActiveCoordinates({ lat: match.lat, lng: match.lng });
      }
    }
  };

  // Handle surface click or landmark pick
  const handleSelectPoint = ({ lat, lng, region }) => {
    setActiveCoordinates({ lat, lng });
    if (region) {
      setSelectedRegion(region);
    } else {
      const match = LUNAR_REGIONS.find(
        (r) => Math.abs(r.lat - lat) < 15 && Math.abs(r.lng - lng) < 15
      );
      setSelectedRegion(match || null);
    }
  };

  // Handle successful land claim
  const handleClaimSuccess = (newClaim) => {
    const claimWithHistory = {
      ...newClaim,
      forSale: false,
      listPrice: 0,
      bids: [],
      history: [
        {
          event: 'REGISTERED',
          from: 'LUNA LAND AUTHORITY',
          to: newClaim.ownerName,
          price: newClaim.totalPaid,
          date: newClaim.claimedAt,
          txHash: newClaim.txHash
        }
      ]
    };
    const updated = [claimWithHistory, ...claimedPlots];
    setClaimedPlots(updated);
    setIsClaimModalOpen(false);
    setActiveDeedPlot(claimWithHistory);
  };

  // Relinquish / delete claim
  const handleDeleteClaim = (plotId) => {
    setClaimedPlots((prev) => prev.filter((p) => p.id !== plotId));
  };

  // Handle placing a new bid on a plot
  const handlePlaceBid = (plotId, newBid) => {
    setClaimedPlots((prev) =>
      prev.map((p) => {
        if (p.id === plotId) {
          const updatedBids = [newBid, ...(p.bids || [])];
          const newHistoryItem = {
            event: 'OFFER_SUBMITTED',
            from: newBid.bidderName,
            to: p.ownerName,
            price: newBid.bidAmount,
            date: newBid.createdAt,
            txHash: `REG-${Math.random().toString(16).substring(2, 10).toUpperCase()}`
          };
          const updatedHistory = [...(p.history || []), newHistoryItem];
          const updatedPlot = { ...p, bids: updatedBids, history: updatedHistory };
          if (activeTrailPlot?.id === plotId) setActiveTrailPlot(updatedPlot);
          return updatedPlot;
        }
        return p;
      })
    );
  };

  // Handle buying a listed plot directly
  const handleBuyListedPlot = (plot) => {
    const buyerName = prompt('Enter your buyer name for title transfer:', 'Explorer Agent');
    if (!buyerName) return;

    setClaimedPlots((prev) =>
      prev.map((p) => {
        if (p.id === plot.id) {
          const newHistoryItem = {
            event: 'TRANSFERRED',
            from: p.ownerName,
            to: buyerName.trim(),
            price: p.listPrice || p.totalPaid,
            date: new Date().toISOString(),
            txHash: `REG-${Math.random().toString(16).substring(2, 10).toUpperCase()}`
          };
          const updatedPlot = {
            ...p,
            ownerName: buyerName.trim(),
            forSale: false,
            listPrice: 0,
            history: [...(p.history || []), newHistoryItem]
          };
          setActiveDeedPlot(updatedPlot);
          return updatedPlot;
        }
        return p;
      })
    );
  };

  return (
    <main className="app-container">
      {/* Top Console Navigation */}
      <HeaderNav
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        claimedCount={claimedPlots.length}
        onOpenRegistry={() => setIsRegistryOpen(true)}
        onOpenLandmarks={() => setIsLandmarksOpen(true)}
        onOpenMarketplace={() => setIsMarketplaceOpen(true)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((prev) => !prev)}
      />

      {/* 3D Interactive Moon Canvas */}
      <MoonGlobe
        onSelectPoint={handleSelectPoint}
        activeCoordinates={activeCoordinates}
        presetRegions={filteredRegions}
        claimedPlots={claimedPlots}
        selectedRegion={selectedRegion}
        showGrid={showGrid}
      />

      {/* Tight Screen Inspector & Instant Buying Panel */}
      <TelemetryBar
        activeCoordinates={activeCoordinates}
        selectedRegion={selectedRegion}
        claimedPlots={claimedPlots}
        onClaimSuccess={handleClaimSuccess}
        onBuyListedPlot={handleBuyListedPlot}
        onPlaceBid={handlePlaceBid}
        onOpenDeed={(plot) => setActiveDeedPlot(plot)}
        onOpenTrail={(plot) => setActiveTrailPlot(plot)}
        onOpenClaimModal={() => setIsClaimModalOpen(true)}
      />

      {/* Slide-over Drawer: Preset Landmark Regions */}
      <LandmarkSelector
        isOpen={isLandmarksOpen}
        onClose={() => setIsLandmarksOpen(false)}
        regions={filteredRegions}
        selectedRegion={selectedRegion}
        onSelectRegion={(region) => {
          setSelectedRegion(region);
          setActiveCoordinates({ lat: region.lat, lng: region.lng });
        }}
      />

      {/* Modal: Customize & Claim Sq Ft Plot */}
      <PlotClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        coordinates={activeCoordinates}
        selectedRegion={selectedRegion}
        onClaimSuccess={handleClaimSuccess}
      />

      {/* Slide-over Drawer: My Claims Registry */}
      <MyRegistryDrawer
        isOpen={isRegistryOpen}
        onClose={() => setIsRegistryOpen(false)}
        claimedPlots={claimedPlots}
        onSelectPlot={(plot) => {
          setActiveCoordinates({ lat: plot.lat, lng: plot.lng });
          setIsRegistryOpen(false);
        }}
        onOpenDeed={(plot) => setActiveDeedPlot(plot)}
        onDeleteClaim={handleDeleteClaim}
      />

      {/* Slide-over Drawer: Marketplace & Landowners Directory */}
      <MarketplaceDrawer
        isOpen={isMarketplaceOpen}
        onClose={() => setIsMarketplaceOpen(false)}
        claimedPlots={claimedPlots}
        onSelectPlot={(plot) => {
          setActiveCoordinates({ lat: plot.lat, lng: plot.lng });
          setIsMarketplaceOpen(false);
        }}
        onOpenTrail={(plot) => setActiveTrailPlot(plot)}
        onBuyListedPlot={handleBuyListedPlot}
      />

      {/* Modal: Ownership Trail & Bidding Inspector */}
      <OwnershipTrailModal
        isOpen={!!activeTrailPlot}
        onClose={() => setActiveTrailPlot(null)}
        plot={activeTrailPlot}
        onPlaceBid={handlePlaceBid}
        onBuyListedPlot={handleBuyListedPlot}
      />

      {/* Modal: High-Res Deed Certificate Viewer */}
      <DeedCertificateModal
        isOpen={!!activeDeedPlot}
        onClose={() => setActiveDeedPlot(null)}
        plotData={activeDeedPlot}
        onFocusPlot={(plot) => setActiveCoordinates({ lat: plot.lat, lng: plot.lng })}
      />

      <style>{`
        .app-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #04070e;
        }
      `}</style>
    </main>
  );
}
