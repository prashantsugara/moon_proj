export function generateDeedImage(plotData) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return Promise.resolve('');
  return new Promise((resolve) => {
    const width = 2048;
    const height = 1448;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Background - Deep Space Obsidian with subtle Grid
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, width, height);

    // Decorative grid lines
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 64;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Outer Cyber Border Frame
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    ctx.strokeStyle = 'rgba(255, 183, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(52, 52, width - 104, height - 104);

    // Corner Accents
    const cornerSize = 40;
    ctx.fillStyle = '#00f3ff';
    // Top-left
    ctx.fillRect(36, 36, cornerSize, 12);
    ctx.fillRect(36, 36, 12, cornerSize);
    // Top-right
    ctx.fillRect(width - 36 - cornerSize, 36, cornerSize, 12);
    ctx.fillRect(width - 48, 36, 12, cornerSize);
    // Bottom-left
    ctx.fillRect(36, height - 48, cornerSize, 12);
    ctx.fillRect(36, height - 36 - cornerSize, 12, cornerSize);
    // Bottom-right
    ctx.fillRect(width - 36 - cornerSize, height - 48, cornerSize, 12);
    ctx.fillRect(width - 48, height - 36 - cornerSize, 12, cornerSize);

    // 2. Header Section
    ctx.textAlign = 'center';

    // Subtitle / Issuer
    ctx.font = '600 24px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffb700';
    ctx.fillText('UNITED LUNAR LAND REGISTRY • EXTRA-TERRESTRIAL PROPERTY AUTHORITY', width / 2, 120);

    // Main Certificate Title
    ctx.font = '900 68px "Orbitron", sans-serif';
    const grad = ctx.createLinearGradient(width / 2 - 400, 0, width / 2 + 400, 0);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#00f3ff');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;
    ctx.fillText('OFFICIAL CERTIFICATE OF TITLE', width / 2, 200);

    // Divider Line
    ctx.beginPath();
    ctx.moveTo(width / 2 - 450, 230);
    ctx.lineTo(width / 2 + 450, 230);
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Grant Declaration
    ctx.font = '400 26px "Inter", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('THIS IS TO CERTIFY THAT THE REAL ESTATE PARCEL HEREIN DESCRIBED HAS BEEN DULY REGISTERED TO', width / 2, 290);

    // Owner Name Highlight Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(width / 2 - 500, 320, 1000, 100);
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - 500, 320, 1000, 100);

    ctx.font = '700 48px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(plotData.ownerName || 'UNREGISTERED CITIZEN', width / 2, 385);

    // 4. Property Specifications Grid
    const startY = 470;
    ctx.textAlign = 'left';

    // Left Column Box - Coordinates & Region
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(120, startY, 860, 480);
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(120, startY, 860, 480);

    ctx.font = '700 22px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffb700';
    ctx.fillText('PARCEL SPECIFICATIONS & COORDINATES', 150, startY + 45);

    const specs = [
      ['REGISTRY DEED ID', plotData.id || 'LUNA-2026-000'],
      ['SECTOR TITLE', plotData.title || 'Lunar Sector Alpha'],
      ['LUNAR REGION', plotData.regionName || 'Mare Tranquillitatis'],
      ['LATITUDE', `${plotData.lat > 0 ? plotData.lat + '° N' : Math.abs(plotData.lat) + '° S'}`],
      ['LONGITUDE', `${plotData.lng > 0 ? plotData.lng + '° E' : Math.abs(plotData.lng) + '° W'}`],
      ['AREA SIZE', `${plotData.acres || 1} ACRE(S) (${(plotData.acres * 4046.86).toLocaleString()} m²)`],
      ['TRANSACTION HASH', plotData.txHash || '0x4918B2FA1099']
    ];

    let rowY = startY + 95;
    specs.forEach(([label, value]) => {
      ctx.font = '600 18px "JetBrains Mono", monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText(label.padEnd(20, ' '), 150, rowY);

      ctx.font = '600 20px "JetBrains Mono", monospace';
      ctx.fillStyle = label === 'REGISTRY DEED ID' ? '#00f3ff' : '#f8fafc';
      ctx.fillText(value, 390, rowY);
      rowY += 52;
    });

    // Right Column Box - Motto, Emblem & Flag
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(1060, startY, 860, 480);
    ctx.strokeRect(1060, startY, 860, 480);

    ctx.font = '700 22px "Orbitron", sans-serif';
    ctx.fillStyle = '#ffb700';
    ctx.fillText('EMBLEM & OWNER MOTTO', 1090, startY + 45);

    // Custom Motto Box
    ctx.font = 'italic 400 24px "Inter", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    const mottoText = `"${plotData.motto || 'Per Aspera Ad Astra'}"`;
    ctx.fillText(mottoText, 1090, startY + 100);

    // Draw Flag Representation
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(1090, startY + 140, 320, 200);
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(1090, startY + 140, 320, 200);

    // Flag Stripes / Colors
    ctx.fillStyle = plotData.flagColor1 || '#00f3ff';
    ctx.fillRect(1092, startY + 142, 316, 96);
    ctx.fillStyle = plotData.flagColor2 || '#3b82f6';
    ctx.fillRect(1092, startY + 238, 316, 100);

    // Flag Symbol
    ctx.font = '64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(plotData.flagSymbol || '🚀', 1090 + 160, startY + 265);
    ctx.textAlign = 'left';

    // QR Code / Verification Mockup Box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1460, startY + 140, 200, 200);
    ctx.fillStyle = '#000000';
    // Draw QR pattern blocks
    for (let qx = 0; qx < 8; qx++) {
      for (let qy = 0; qy < 8; qy++) {
        if ((qx + qy) % 2 === 0 || (qx * qy) % 3 === 0) {
          ctx.fillRect(1470 + qx * 22, startY + 150 + qy * 22, 18, 18);
        }
      }
    }
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('SCAN TO VERIFY DEED', 1475, startY + 365);

    // 5. Holographic Gold Seal & Official Signatures Footer
    const footerY = 1000;

    // Gold Holographic Seal Circle (Left)
    const sealX = 260;
    const sealY = footerY + 180;
    const sealRadius = 95;

    const goldGrad = ctx.createRadialGradient(sealX, sealY, 10, sealX, sealY, sealRadius);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.5, '#eab308');
    goldGrad.addColorStop(1, '#854d0e');

    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.arc(sealX, sealY, sealRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = '900 16px "Orbitron", sans-serif';
    ctx.fillStyle = '#422006';
    ctx.textAlign = 'center';
    ctx.fillText('★ OFFICIAL SEAL ★', sealX, sealY - 30);
    ctx.font = '700 28px sans-serif';
    ctx.fillText('🌕', sealX, sealY + 10);
    ctx.font = '700 14px "Orbitron", sans-serif';
    ctx.fillText('LUNAR LAND TITLE', sealX, sealY + 45);

    // Middle Signature Line
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(700, footerY + 220);
    ctx.lineTo(1200, footerY + 220);
    ctx.stroke();

    // Script Signature text
    ctx.font = 'italic 700 36px "Inter", sans-serif';
    ctx.fillStyle = '#00f3ff';
    ctx.fillText('Commander V. Vance', 950, footerY + 200);

    ctx.font = '600 18px "Orbitron", sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('HIGH COMMISSIONER OF EXTRA-TERRESTRIAL LANDS', 950, footerY + 250);

    // Right Issue Timestamp & Auth Code
    ctx.textAlign = 'right';
    ctx.font = '600 18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`DATE OF ISSUANCE: ${new Date(plotData.claimedAt || Date.now()).toISOString().split('T')[0]}`, width - 140, footerY + 180);
    ctx.fillText(`STATUS: VERIFIED ON BLOCKCHAIN`, width - 140, footerY + 215);
    ctx.fillStyle = '#00f3ff';
    ctx.fillText(`SECURITY TOKEN: ENCRYPTED-RSA-4096`, width - 140, footerY + 250);

    // Resolve Data URL
    resolve(canvas.toDataURL('image/png'));
  });
}

export function downloadDeedPNG(plotData) {
  generateDeedImage(plotData).then((dataUrl) => {
    const link = document.createElement('a');
    link.download = `Luna_Deed_${plotData.id || 'Certificate'}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}
