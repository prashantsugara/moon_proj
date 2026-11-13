import { MapPin } from 'lucide-react';

export default function TelemetryBar({
  activeCoordinates, selectedRegion, claimedPlots, onOpenDeed, onOpenTrail, onOpenClaimModal,
}) {
  const lat = Math.round(activeCoordinates.lat * 100) / 100;
  const roundedLng = Math.round(activeCoordinates.lng * 100) / 100;
  const lng = Math.abs(lat) === 90 ? 0 : roundedLng === 180 ? -180 : roundedLng;
  const plot = claimedPlots.find((item) => item.lat === lat && item.lng === lng);

  return (
    <aside className="location-card glass-card" aria-label="Selected lunar location">
      <p className="location-coordinates"><MapPin size={15} aria-hidden="true" />
        {Math.abs(lat).toFixed(2)}° {lat < 0 ? 'S' : 'N'} · {Math.abs(lng).toFixed(2)}° {lng < 0 ? 'W' : 'E'}
      </p>
      <h2>{plot?.title ?? selectedRegion?.name ?? 'Selected lunar location'}</h2>
      {plot ? <>
        <p>Registered to {plot.ownerName}</p>
        <button className="btn-primary" type="button" onClick={() => onOpenDeed(plot)}>View certificate</button>
        <button className="btn-ghost" type="button" onClick={() => onOpenTrail(plot)}>Registration history</button>
      </> : <button className="btn-primary" type="button" onClick={onOpenClaimModal}>Create my certificate</button>}
    </aside>
  );
}
