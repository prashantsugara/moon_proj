import QRCode from 'qrcode';

export function generateDeedImage(plotData) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return Promise.resolve('');

  return new Promise(async (resolve) => {
    const width = 2048;
    const height = 1448;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 1. Classic Off-White Parchment Paper Background
    ctx.fillStyle = '#faf9f5';
    ctx.fillRect(0, 0, width, height);

    // Subtle Parchment Texture Pattern
    ctx.fillStyle = 'rgba(180, 150, 100, 0.03)';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      const rw = Math.random() * 80 + 20;
      const rh = Math.random() * 40 + 10;
      ctx.fillRect(rx, ry, rw, rh);
    }

    // Double Classic Legal Frame Border
    // Outer Deep Navy Border
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 8;
    ctx.strokeRect(48, 48, width - 96, height - 96);

    // Inner Gold Filigree Line
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.strokeRect(64, 64, width - 128, height - 128);

    // Fine Inner Border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.strokeRect(74, 74, width - 148, height - 148);

    // Corner Ornament Accents
    const drawCornerOrnament = (cx, cy, flipX = 1, flipY = 1) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(flipX, flipY);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, 0, 36, 4);
      ctx.fillRect(0, 0, 4, 36);
      ctx.fillRect(8, 8, 20, 2);
      ctx.fillRect(8, 8, 2, 20);
      ctx.restore();
    };

    drawCornerOrnament(78, 78, 1, 1);
    drawCornerOrnament(width - 78, 78, -1, 1);
    drawCornerOrnament(78, height - 78, 1, -1);
    drawCornerOrnament(width - 78, height - 78, -1, -1);

    // 2. Formal Header Section
    ctx.textAlign = 'center';

    // Issuer Subtitle
    ctx.font = '600 20px "Georgia", "Times New Roman", serif';
    ctx.fillStyle = '#b45309';
    ctx.letterSpacing = '3px';
    ctx.fillText('UNITED LUNAR LAND REGISTRY • EXTRA-TERRESTRIAL PROPERTY AUTHORITY', width / 2, 125);

    // Main Certificate Title
    ctx.font = '700 58px "Georgia", "Times New Roman", serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('CERTIFICATE OF TITLE', width / 2, 195);

    // Formal Gold Line Divider with Diamond Center
    ctx.beginPath();
    ctx.moveTo(width / 2 - 400, 225);
    ctx.lineTo(width / 2 + 400, 225);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(width / 2, 225, 6, 0, Math.PI * 2);
    ctx.fill();

    // 3. Legal Grant Declaration
    ctx.font = 'italic 400 22px "Georgia", "Times New Roman", serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(
      'BE IT KNOWN TO ALL THAT THE REAL ESTATE PARCEL HEREIN DESCRIBED HAS BEEN OFFICIALLY DULY REGISTERED TO',
      width / 2,
      280
    );

    // Owner Name Parchment Card
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(width / 2 - 480, 310, 960, 90);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(width / 2 - 480, 310, 960, 90);

    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.strokeRect(width / 2 - 474, 316, 948, 78);

    ctx.font = '700 44px "Georgia", "Times New Roman", serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(plotData.ownerName || 'UNREGISTERED CITIZEN', width / 2, 370);

    // 4. Property Specifications Table
    const startY = 440;
    ctx.textAlign = 'left';

    // Left Specifications Box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(120, startY, 860, 500);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(120, startY, 860, 500);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(120, startY, 860, 48);

    ctx.font = '700 18px "Georgia", "Times New Roman", serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PARCEL SPECIFICATIONS & COORDINATES', 150, startY + 30);

    const specs = [
      ['REGISTRY DEED ID', plotData.id || 'LUNA-2026-000'],
      ['SECTOR TITLE', plotData.title || 'Lunar Sector Alpha'],
      ['LUNAR REGION', plotData.regionName || 'Mare Tranquillitatis'],
      ['LATITUDE', `${plotData.lat > 0 ? plotData.lat + '° N' : Math.abs(plotData.lat) + '° S'}`],
      ['LONGITUDE', `${plotData.lng > 0 ? plotData.lng + '° E' : Math.abs(plotData.lng) + '° W'}`],
      ['AREA SIZE', `${plotData.acres || 1} Acre(s) (${((plotData.acres || 1) * 43560).toLocaleString()} sq ft)`],
      ['REGISTRY HASH', plotData.txHash || 'REG-4918B2FA1099']
    ];

    let rowY = startY + 92;
    specs.forEach(([label, value], idx) => {
      if (idx % 2 === 0) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(122, rowY - 26, 856, 46);
      }

      ctx.font = '600 14px "Georgia", "Times New Roman", serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(label, 150, rowY);

      ctx.font = '600 16px "Courier New", monospace';
      ctx.fillStyle = label === 'REGISTRY DEED ID' ? '#b45309' : '#0f172a';
      ctx.fillText(value, 380, rowY);
      rowY += 48;
    });

    // Right Box - Emblem, Flag & Real Scannable QR Code
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1060, startY, 860, 500);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(1060, startY, 860, 500);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(1060, startY, 860, 48);

    ctx.font = '700 18px "Georgia", "Times New Roman", serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('NATIONAL EMBLEM & VERIFICATION QR', 1090, startY + 30);

    // Custom Motto
    ctx.font = 'italic 400 20px "Georgia", serif';
    ctx.fillStyle = '#334155';
    const mottoText = `"${plotData.motto || 'Per Aspera Ad Astra'}"`;
    ctx.fillText(mottoText, 1090, startY + 90);

    // Draw Flag Representation Box
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(1090, startY + 130, 320, 200);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(1090, startY + 130, 320, 200);

    // Flag Color Stripes
    ctx.fillStyle = plotData.flagColor1 || '#ff9933';
    ctx.fillRect(1092, startY + 132, 316, 96);
    ctx.fillStyle = plotData.flagColor2 || '#138808';
    ctx.fillRect(1092, startY + 228, 316, 100);

    // Flag Symbol / Country Flag Emoji
    ctx.font = '72px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(plotData.flagSymbol || '🇮🇳', 1090 + 160, startY + 255);
    ctx.textAlign = 'left';

    // REAL SCANNABLE QR CODE GENERATION
    const verifyUrl = `https://moon-proj-bittruth.vercel.app/?plot=${plotData.id || 'DEED'}`;
    const qrCanvas = document.createElement('canvas');
    try {
      await QRCode.toCanvas(qrCanvas, verifyUrl, {
        width: 200,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' }
      });
      ctx.drawImage(qrCanvas, 1460, startY + 130, 200, 200);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(1460, startY + 130, 200, 200);
    } catch (e) {
      console.error('QR generation error:', e);
    }

    ctx.font = '600 13px "Courier New", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('SCAN QR TO VERIFY DEED', 1460, startY + 355);

    // 5. Official Gold Embossed Seal & Signatures Footer
    const footerY = 980;

    // Gold Metallic Embossed Seal (Left)
    const sealX = 260;
    const sealY = footerY + 180;
    const sealRadius = 90;

    const goldGrad = ctx.createRadialGradient(sealX - 20, sealY - 20, 10, sealX, sealY, sealRadius);
    goldGrad.addColorStop(0, '#fef08a');
    goldGrad.addColorStop(0.4, '#eab308');
    goldGrad.addColorStop(0.8, '#ca8a04');
    goldGrad.addColorStop(1, '#854d0e');

    ctx.fillStyle = goldGrad;
    ctx.beginPath();
    ctx.arc(sealX, sealY, sealRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.font = '700 13px "Georgia", serif';
    ctx.fillStyle = '#422006';
    ctx.textAlign = 'center';
    ctx.fillText('★ OFFICIAL DEED SEAL ★', sealX, sealY - 25);
    ctx.font = '700 32px sans-serif';
    ctx.fillText('🌕', sealX, sealY + 12);
    ctx.font = '700 12px "Georgia", serif';
    ctx.fillText('LUNAR REGISTRY TITLE', sealX, sealY + 45);

    // Middle Signature Line
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(700, footerY + 210);
    ctx.lineTo(1200, footerY + 210);
    ctx.stroke();

    ctx.font = 'italic 700 32px "Georgia", serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Commander V. Vance', 950, footerY + 195);

    ctx.font = '600 16px "Georgia", serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('HIGH COMMISSIONER OF EXTRA-TERRESTRIAL LANDS', 950, footerY + 240);

    // Right Issue Timestamp & Auth Code
    ctx.textAlign = 'right';
    ctx.font = '600 16px "Courier New", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`DATE OF ISSUANCE: ${new Date(plotData.claimedAt || Date.now()).toISOString().split('T')[0]}`, width - 140, footerY + 180);
    ctx.fillText(`STATUS: OFFICIAL CERTIFIED DEED`, width - 140, footerY + 215);
    ctx.fillStyle = '#b45309';
    ctx.fillText(`SECURITY TOKEN: REG-RSA-4096-VERIFIED`, width - 140, footerY + 250);

    // Resolve Data URL
    resolve(canvas.toDataURL('image/png'));
  });
}

export function downloadDeedPNG(plotData) {
  generateDeedImage(plotData).then((dataUrl) => {
    const link = document.createElement('a');
    link.download = `Luna_Title_Deed_${plotData.id || 'Certificate'}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

export async function downloadDeedPDF(plotData) {
  try {
    const dataUrl = await generateDeedImage(plotData);
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [2048, 1448]
    });
    pdf.addImage(dataUrl, 'PNG', 0, 0, 2048, 1448);
    pdf.save(`Official_Lunar_Deed_${plotData.id || 'Certificate'}.pdf`);
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    downloadDeedPNG(plotData);
  }
}
