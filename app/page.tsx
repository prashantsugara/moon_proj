'use client';
import { REGISTRATION_PRICE } from '@/lib/registrationPrice';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { openCheckout } from '@/lib/openCheckout';
import Auctions from '@/components/Auctions';
import HeaderNav from '@/components/HeaderNav';
import TelemetryBar from '@/components/TelemetryBar';
import LandmarkSelector from '@/components/LandmarkSelector';
import PlotClaimModal from '@/components/PlotClaimModal';
import DeedCertificateModal from '@/components/DeedCertificateModal';
import MyRegistryDrawer from '@/components/MyRegistryDrawer';
import OwnershipTrailModal from '@/components/OwnershipTrailModal';
import AuthModal from '@/components/AuthModal';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LUNAR_REGIONS, FLAG_TEMPLATES } from '@/data/lunarRegions';

import { supabase } from '@/lib/supabase';

// Dynamic import for WebGL 3D Moon Globe
const MoonGlobe = dynamic(() => import('@/components/MoonGlobe'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
      Loading 3D Moon Globe...
    </div>
  ),
});

function toPlot(row: {
  id: string; account_id: string; owner_name: string; title: string; lat: number;
  lng: number; sqft: number; motto: string; flag_id: string; created_at: string;
}) {
  const flag = FLAG_TEMPLATES.find((item) => item.id === row.flag_id) ?? FLAG_TEMPLATES[0];
  const txHash = row.id;
  return {
    id: row.id, accountId: row.account_id, ownerName: row.owner_name, title: row.title,
    lat: row.lat, lng: row.lng, sqft: row.sqft, acres: row.sqft / 43560,
    motto: row.motto, flagId: flag.id, flagImage: flag.image, flagName: flag.name,
    claimedAt: row.created_at, txHash,
    totalPaid: 0, regionName: 'Lunar Surface',
  };
}

type ClaimDraft = {
  ownerName: string; title: string; sqft: number; motto: string; flagId: string;
  coordinates: { lat: number; lng: number };
};
const draftKey = 'moonlandbuy.certificate-draft';

function HomeContent() {
  const { user, session } = useAuth();

  const [activeCoordinates, setActiveCoordinates] = useState({ lat: 0.674, lng: 23.473 });
  const [selectedRegion, setSelectedRegion] = useState(LUNAR_REGIONS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGrid, setShowGrid] = useState(false);

  // Drawers & Modals
  const [isLandmarksOpen, setIsLandmarksOpen] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [claimLocation, setClaimLocation] = useState(activeCoordinates);
  const [draft, setDraft] = useState<ClaimDraft | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'magiclink'>('signin');

  const [activeDeedPlot, setActiveDeedPlot] = useState<any>(null);
  const [activeTrailPlot, setActiveTrailPlot] = useState<any>(null);

  const [claimedPlots, setClaimedPlots] = useState<ReturnType<typeof toPlot>[]>([]);
  const [marketOpen, setMarketOpen] = useState(false);
  const [listingPlot, setListingPlot] = useState<string | undefined>();
  const [paymentMessage, setPaymentMessage] = useState("");
  const [registryError, setRegistryError] = useState(false);
  const [sharedClaimError, setSharedClaimError] = useState(false);
  const myPlots = claimedPlots.filter((plot) => plot.accountId === user?.id);

  useEffect(() => {
    let active = true;
    void supabase.from('lunar_claims').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        setRegistryError(!!error);
        if (data) setClaimedPlots((current) => [
          ...current.filter((plot) => !data.some((row) => row.id === plot.id)),
          ...data.map(toPlot),
        ]);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('registration') === 'whop') {
      setIsRegistryOpen(true);
      setPaymentMessage('Your certificate appears in My Land once payment is confirmed. Reopen My Land to refresh.');
      try { sessionStorage.removeItem(draftKey); } catch {}
    }
    const id = params.get('plot');
    if (!id) return;
    if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) {
      setSharedClaimError(true);
      return;
    }
    let active = true;
    void supabase.from('lunar_claims').select('*').eq('id', id).maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (!data) {
          setSharedClaimError(true);
          return;
        }
        setActiveCoordinates({ lat: data.lat, lng: data.lng });
        setSelectedRegion(null);
        setActiveDeedPlot(toPlot(data));
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(draftKey);
      if (!saved) return;
      const restored = JSON.parse(saved) as ClaimDraft;
      if (!restored.coordinates || !restored.title || !restored.ownerName) return;
      setDraft(restored);
      setClaimLocation(restored.coordinates);
      setActiveCoordinates(restored.coordinates);
      setSelectedRegion(null);
      setExploring(true);
      setIsClaimModalOpen(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (user) setIsAuthOpen(false);
  }, [user?.id]);

  const refreshClaims = async () => {
    const { data, error } = await supabase.from('lunar_claims').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    setClaimedPlots(data.map(toPlot));
  };

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
    if (val.trim()) setExploring(true);
    if (val.trim()) {
      const match = LUNAR_REGIONS.find((r) => r.name.toLowerCase().includes(val.toLowerCase()));
      if (match) {
        setSelectedRegion(match);
        setActiveCoordinates({ lat: match.lat, lng: match.lng });
      }
    }
  };

  const handleSelectPoint = ({ lat, lng, region }: any) => {
    setExploring(true);
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

  const discardDraft = () => {
    setDraft(null);
    try { sessionStorage.removeItem(draftKey); } catch {}
  };

  const handleOpenClaimModal = () => {
    discardDraft();
    setClaimLocation(activeCoordinates);
    setIsClaimModalOpen(true);
  };

  const registerClaim = async (claim: ClaimDraft) => {
    if (!user) {
      setDraft(claim);
      try { sessionStorage.setItem(draftKey, JSON.stringify(claim)); } catch {}
      setAuthMode('signin');
      setIsAuthOpen(true);
      return;
    }
    const response = await fetch('/api/razorpay/registration', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + session?.access_token, 'Content-Type': 'application/json' },
      body: JSON.stringify(claim),
    });
    const order = await response.json();
    if (!response.ok) throw new Error(order.error || 'Checkout is unavailable.');
    if (order.checkoutUrl) {
      window.location.assign(order.checkoutUrl);
      return;
    }
    await openCheckout(order, 'Commemorative lunar certificate', () => {
      discardDraft();
      setIsClaimModalOpen(false);
      setPaymentMessage('Payment submitted. Your certificate appears in My Land after Razorpay confirms it.');
      void refreshClaims().catch(() => {});
    });
  };

  return (
    <main style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden', background: '#04070e' }}>
      {registryError && <p role="alert" style={{ position: 'absolute', top: 80, left: 16, zIndex: 20 }}>
        The registry could not be loaded. Refresh to try again.
      </p>}
      {sharedClaimError && !registryError && <p role="alert" style={{ position: 'absolute', top: 80, left: 16, zIndex: 20 }}>
        The shared certificate could not be found.
      </p>}
      {paymentMessage && <p role="status" className="glass-card" style={{ position: "absolute", top: 130, left: 16, zIndex: 30, padding: 12 }}>{paymentMessage}</p>}
      <HeaderNav
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        claimedCount={myPlots.length}
        onOpenRegistry={() => { setIsRegistryOpen(true); void refreshClaims().catch(() => {}); }}
        onOpenLandmarks={() => setIsLandmarksOpen(true)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((prev) => !prev)}
        onOpenAuth={() => {
          setAuthMode('signin');
          setIsAuthOpen(true);
        }}
      />

      {process.env.NEXT_PUBLIC_MARKETPLACE_ENABLED === 'true' && (
        <button className="btn-ghost glass-card" style={{ position: 'absolute', right: 16, top: 74, zIndex: 65 }}
          onClick={() => { setListingPlot(undefined); setMarketOpen(true); }}>Marketplace</button>
      )}
      {marketOpen && <Auctions initialPlot={listingPlot} plots={claimedPlots} refreshClaims={refreshClaims} onClose={() => setMarketOpen(false)} />}

      <MoonGlobe
        onSelectPoint={handleSelectPoint}
        activeCoordinates={activeCoordinates}
        presetRegions={filteredRegions}
        claimedPlots={claimedPlots}
        selectedRegion={selectedRegion}
        showGrid={showGrid}
      />

      {!exploring && <section className="explore-intro" aria-labelledby="explore-title">
        <h1 id="explore-title">Pick a spot on the Moon.</h1>
        <p>Preview your commemorative certificate. Registration costs {REGISTRATION_PRICE}.</p>
        <button className="btn-primary" type="button" onClick={() => setExploring(true)}>Explore the Moon</button>
      </section>}
      {exploring && <TelemetryBar
        activeCoordinates={activeCoordinates}
        selectedRegion={selectedRegion}
        claimedPlots={claimedPlots}
        onOpenDeed={(plot: any) => setActiveDeedPlot(plot)}
        onOpenTrail={(plot: any) => setActiveTrailPlot(plot)}
        onOpenClaimModal={handleOpenClaimModal}
      />}

      <LandmarkSelector
        isOpen={isLandmarksOpen}
        onClose={() => setIsLandmarksOpen(false)}
        regions={filteredRegions}
        selectedRegion={selectedRegion}
        onSelectRegion={(region: any) => {
          setExploring(true);
          setSelectedRegion(region);
          setActiveCoordinates({ lat: region.lat, lng: region.lng });
        }}
      />

      {isClaimModalOpen && <PlotClaimModal
        isOpen={isClaimModalOpen}
        hidden={isAuthOpen}
        onClose={() => { setIsClaimModalOpen(false); discardDraft(); }}
        coordinates={claimLocation}
        initialDraft={draft}
        onClaimSuccess={registerClaim}
      />}

      <MyRegistryDrawer
        isOpen={isRegistryOpen}
        onClose={() => setIsRegistryOpen(false)}
        claimedPlots={myPlots}
        onListPlot={process.env.NEXT_PUBLIC_MARKETPLACE_ENABLED === 'true' ? (id: string) => {
          setListingPlot(id);
          setIsRegistryOpen(false);
          setMarketOpen(true);
        } : undefined}
        onSelectPlot={(plot: any) => {
          setExploring(true);
          setActiveCoordinates({ lat: plot.lat, lng: plot.lng });
          setIsRegistryOpen(false);
        }}
        onOpenDeed={(plot: any) => setActiveDeedPlot(plot)}
      />

      <OwnershipTrailModal
        isOpen={!!activeTrailPlot}
        onClose={() => setActiveTrailPlot(null)}
        plot={activeTrailPlot}
      />

      <DeedCertificateModal
        isOpen={!!activeDeedPlot}
        onClose={() => setActiveDeedPlot(null)}
        plotData={activeDeedPlot}
        onFocusPlot={(plot: any) => setActiveCoordinates({ lat: plot.lat, lng: plot.lng })}
      />

      <AuthModal
        key={isAuthOpen ? authMode : "closed"}
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
      <style>{`
        .explore-intro { position: absolute; z-index: 55; left: clamp(16px, 5vw, 80px); bottom: 8%; width: min(440px, calc(100% - 32px)); padding: 24px; border-radius: 20px; background: #080f1de8; border: 1px solid #26364e; }
        .explore-intro h1 { font-size: clamp(28px, 5vw, 54px); line-height: 1.04; margin: 0; }
        .explore-intro p { color: #b6c6dc; margin: 14px 0 20px; }
        @media (max-width: 600px) { .explore-intro { bottom: max(12px, env(safe-area-inset-bottom)); padding: 16px; } }
      `}</style>
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
