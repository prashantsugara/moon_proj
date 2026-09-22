'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import HeaderNav from '@/components/HeaderNav';
import TelemetryBar from '@/components/TelemetryBar';
import LandmarkSelector from '@/components/LandmarkSelector';
import PlotClaimModal from '@/components/PlotClaimModal';
import DeedCertificateModal from '@/components/DeedCertificateModal';
import MyRegistryDrawer from '@/components/MyRegistryDrawer';
import MarketplaceDrawer from '@/components/MarketplaceDrawer';
import OwnershipTrailModal from '@/components/OwnershipTrailModal';
import AuthModal from '@/components/AuthModal';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LUNAR_REGIONS, INITIAL_CLAIMED_PLOTS } from '@/data/lunarRegions';

// Dynamic import for WebGL 3D Moon Globe
const MoonGlobe = dynamic(() => import('@/components/MoonGlobe'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
      Loading 3D Moon Globe...
    </div>
  ),
});

function HomeContent() {
  const { user, profile } = useAuth();

  const [activeCoordinates, setActiveCoordinates] = useState({ lat: 0.674, lng: 23.473 });
  const [selectedRegion, setSelectedRegion] = useState(LUNAR_REGIONS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGrid, setShowGrid] = useState(true);

  // Drawers & Modals
  const [isLandmarksOpen, setIsLandmarksOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'magiclink'>('signin');

  const [activeDeedPlot, setActiveDeedPlot] = useState<any>(null);
  const [activeTrailPlot, setActiveTrailPlot] = useState<any>(null);

  const [claimedPlots, setClaimedPlots] = useState(INITIAL_CLAIMED_PLOTS);

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

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (val.trim()) {
      const match = LUNAR_REGIONS.find((r) => r.name.toLowerCase().includes(val.toLowerCase()));
      if (match) {
        setSelectedRegion(match);
        setActiveCoordinates({ lat: match.lat, lng: match.lng });
      }
    }
  };

  const handleSelectPoint = ({ lat, lng, region }: any) => {
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

  const handleOpenClaimModal = () => {
    if (!user) {
      setAuthMode('signup');
      setIsAuthOpen(true);
      return;
    }
    setIsClaimModalOpen(true);
  };

  const handleClaimSuccess = (newClaim: any) => {
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
          txHash: newClaim.txHash,
        },
      ],
    };
    setClaimedPlots([claimWithHistory, ...claimedPlots]);
    setIsClaimModalOpen(false);
    setActiveDeedPlot(claimWithHistory);
  };

  const handleDeleteClaim = (plotId: string) => {
    setClaimedPlots((prev) => prev.filter((p) => p.id !== plotId));
  };

  const handlePlaceBid = (plotId: string, newBid: any) => {
    if (!user) {
      setAuthMode('signin');
      setIsAuthOpen(true);
      return;
    }
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
            txHash: `REG-${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
          };
          const updatedPlot = { ...p, bids: updatedBids, history: [...(p.history || []), newHistoryItem] };
          if (activeTrailPlot?.id === plotId) setActiveTrailPlot(updatedPlot);
          return updatedPlot;
        }
        return p;
      })
    );
  };

  const handleBuyListedPlot = (plot: any) => {
    if (!user) {
      setAuthMode('signin');
      setIsAuthOpen(true);
      return;
    }

    const defaultBuyer = profile?.full_name || user.email?.split('@')[0] || 'Explorer Agent';
    const buyerName = prompt('Enter buyer name for official title transfer:', defaultBuyer);
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
            txHash: `REG-${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
          };
          const updatedPlot = {
            ...p,
            ownerName: buyerName.trim(),
            forSale: false,
            listPrice: 0,
            history: [...(p.history || []), newHistoryItem],
          };
          setActiveDeedPlot(updatedPlot);
          return updatedPlot;
        }
        return p;
      })
    );
  };

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#04070e' }}>
      <HeaderNav
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        claimedCount={claimedPlots.length}
        onOpenRegistry={() => setIsRegistryOpen(true)}
        onOpenLandmarks={() => setIsLandmarksOpen(true)}
        onOpenMarketplace={() => setIsMarketplaceOpen(true)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((prev) => !prev)}
        onOpenAuth={() => {
          setAuthMode('signin');
          setIsAuthOpen(true);
        }}
      />

      <MoonGlobe
        onSelectPoint={handleSelectPoint}
        activeCoordinates={activeCoordinates}
        presetRegions={filteredRegions}
        claimedPlots={claimedPlots}
        selectedRegion={selectedRegion}
        showGrid={showGrid}
      />

      <TelemetryBar
        activeCoordinates={activeCoordinates}
        selectedRegion={selectedRegion}
        claimedPlots={claimedPlots}
        onClaimSuccess={handleClaimSuccess}
        onBuyListedPlot={handleBuyListedPlot}
        onPlaceBid={handlePlaceBid}
        onOpenDeed={(plot: any) => setActiveDeedPlot(plot)}
        onOpenTrail={(plot: any) => setActiveTrailPlot(plot)}
        onOpenClaimModal={handleOpenClaimModal}
      />

      <LandmarkSelector
        isOpen={isLandmarksOpen}
        onClose={() => setIsLandmarksOpen(false)}
        regions={filteredRegions}
        selectedRegion={selectedRegion}
        onSelectRegion={(region: any) => {
          setSelectedRegion(region);
          setActiveCoordinates({ lat: region.lat, lng: region.lng });
        }}
      />

      <PlotClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        coordinates={activeCoordinates}
        selectedRegion={selectedRegion}
        onClaimSuccess={handleClaimSuccess}
      />

      <MyRegistryDrawer
        isOpen={isRegistryOpen}
        onClose={() => setIsRegistryOpen(false)}
        claimedPlots={claimedPlots}
        onSelectPlot={(plot: any) => {
          setActiveCoordinates({ lat: plot.lat, lng: plot.lng });
          setIsRegistryOpen(false);
        }}
        onOpenDeed={(plot: any) => setActiveDeedPlot(plot)}
        onDeleteClaim={handleDeleteClaim}
      />

      <MarketplaceDrawer
        isOpen={isMarketplaceOpen}
        onClose={() => setIsMarketplaceOpen(false)}
        claimedPlots={claimedPlots}
        onSelectPlot={(plot: any) => {
          setActiveCoordinates({ lat: plot.lat, lng: plot.lng });
          setIsMarketplaceOpen(false);
        }}
        onOpenTrail={(plot: any) => setActiveTrailPlot(plot)}
        onListPlotForSale={(plotId: string, price: number) => {
          setClaimedPlots((prev) =>
            prev.map((p) => (p.id === plotId ? { ...p, forSale: true, listPrice: price } : p))
          );
        }}
        onAcceptBid={(plotId: string, bid: any) => {
          setClaimedPlots((prev) =>
            prev.map((p) =>
              p.id === plotId
                ? {
                    ...p,
                    ownerName: bid.bidderName,
                    forSale: false,
                    listPrice: 0,
                    bids: [],
                  }
                : p
            )
          );
        }}
        onBuyListedPlot={handleBuyListedPlot}
      />

      <OwnershipTrailModal
        isOpen={!!activeTrailPlot}
        onClose={() => setActiveTrailPlot(null)}
        plot={activeTrailPlot}
        onPlaceBid={handlePlaceBid}
        onBuyListedPlot={handleBuyListedPlot}
      />

      <DeedCertificateModal
        isOpen={!!activeDeedPlot}
        onClose={() => setActiveDeedPlot(null)}
        plotData={activeDeedPlot}
        onFocusPlot={(plot: any) => setActiveCoordinates({ lat: plot.lat, lng: plot.lng })}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </main>
  );
}

export default function HomePage() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
