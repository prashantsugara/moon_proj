import * as THREE from 'three';

/**
 * Photorealistic 4K Lunar Surface Texture Generator based on NASA LRO (Lunar Reconnaissance Orbiter) maps
 */
export function createProceduralMoonTexture() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  const width = 4096;
  const height = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. Base Lunar Highlands Albedo (Light Anorthosite Grey)
  const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
  baseGrad.addColorStop(0, '#9fa6ad');
  baseGrad.addColorStop(0.5, '#b4bcc3');
  baseGrad.addColorStop(1, '#98a0a7');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. High-Frequency Micro Noise (Regolith texture simulation)
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Pseudo-Perlin multi-scale noise
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor((i / 4) / width);

    // Fine grain noise
    const grain = (Math.random() - 0.5) * 28;
    // Low frequency variation
    const macro = Math.sin(x * 0.005) * Math.cos(y * 0.005) * 12;

    const val = Math.min(255, Math.max(0, data[i] + grain + macro));
    data[i] = val;
    data[i + 1] = val * 0.98; // Subtle warm-cold regolith tone
    data[i + 2] = val * 0.96;
  }
  ctx.putImageData(imgData, 0, 0);

  // Helper to draw realistic lunar maria (dark basaltic lava basins) with soft feathered boundaries
  function drawLunarMare(cx, cy, rx, ry, rotation, opacity = 0.65) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
    grad.addColorStop(0, `rgba(32, 36, 42, ${opacity})`);
    grad.addColorStop(0.6, `rgba(42, 47, 54, ${opacity * 0.85})`);
    grad.addColorStop(0.85, `rgba(58, 64, 72, ${opacity * 0.4})`);
    grad.addColorStop(1, 'rgba(120, 128, 136, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Secondary sub-basins inside mare
    for (let i = 0; i < 4; i++) {
      const offsetX = (Math.random() - 0.5) * rx * 0.8;
      const offsetY = (Math.random() - 0.5) * ry * 0.8;
      const subR = Math.min(rx, ry) * (0.3 + Math.random() * 0.4);
      ctx.beginPath();
      ctx.arc(offsetX, offsetY, subR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(26, 30, 36, ${opacity * 0.4})`;
      ctx.fill();
    }
    ctx.restore();
  }

  // 3. Draw Accurate NASA Lunar Nearside Maria (0° to 180° / -180° Longitude)
  // Oceanus Procellarum (Vast Western Mare)
  drawLunarMare(width * 0.32, height * 0.42, 480, 400, -0.2, 0.75);

  // Mare Imbrium (Sea of Rains - Top West)
  drawLunarMare(width * 0.36, height * 0.28, 320, 260, -0.1, 0.78);

  // Mare Serenitatis (Sea of Serenity - Top Center)
  drawLunarMare(width * 0.54, height * 0.32, 220, 180, -0.2, 0.72);

  // Mare Tranquillitatis (Sea of Tranquility - Center East)
  drawLunarMare(width * 0.58, height * 0.44, 260, 200, 0.1, 0.74);

  // Mare Crisium (Isolated Eastern Ring)
  drawLunarMare(width * 0.68, height * 0.36, 140, 120, 0.1, 0.8);

  // Mare Fecunditatis & Mare Nectaris (Lower East)
  drawLunarMare(width * 0.63, height * 0.56, 200, 160, 0.3, 0.7);
  drawLunarMare(width * 0.56, height * 0.60, 150, 120, 0.2, 0.68);

  // Mare Nubium & Mare Humorum (Lower West)
  drawLunarMare(width * 0.42, height * 0.60, 220, 180, -0.2, 0.72);
  drawLunarMare(width * 0.33, height * 0.62, 140, 120, -0.4, 0.75);

  // 4. Photorealistic Impact Craters with Terraced Rims & Bright Rays
  // Draw major famous craters explicitly
  const famousCraters = [
    { x: width * 0.47, y: height * 0.74, r: 32, name: 'Tycho', hasRays: true }, // Tycho crater
    { x: width * 0.44, y: height * 0.40, r: 38, name: 'Copernicus', hasRays: true }, // Copernicus crater
    { x: width * 0.38, y: height * 0.40, r: 24, name: 'Kepler', hasRays: true }, // Kepler crater
    { x: width * 0.54, y: height * 0.38, r: 28, name: 'Theophilus', hasRays: false },
    { x: width * 0.34, y: height * 0.24, r: 34, name: 'Plato', hasRays: false } // Dark-floored Plato
  ];

  // Helper to draw single realistic crater
  function drawCrater(cx, cy, radius, hasRays = false, isDarkFloor = false) {
    // 1. Dark Shadowed Interior Basin
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = isDarkFloor ? '#1e2228' : '#2b3038';
    ctx.fill();

    // 2. Sunlight Rim Highlight (Sun direction from top-left)
    ctx.beginPath();
    ctx.arc(cx - radius * 0.15, cy - radius * 0.15, radius * 1.02, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = Math.max(1.5, radius * 0.14);
    ctx.stroke();

    // 3. Shadowed Rim Edge
    ctx.beginPath();
    ctx.arc(cx + radius * 0.15, cy + radius * 0.15, radius * 0.98, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(10, 12, 16, 0.7)';
    ctx.lineWidth = Math.max(1.5, radius * 0.14);
    ctx.stroke();

    // 4. Central Mountain Peak (for large craters)
    if (radius > 20) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
    }

    // 5. Radiating Ejecta Rays (e.g., Tycho Rays stretching across half the Moon)
    if (hasRays) {
      const numRays = 16 + Math.floor(Math.random() * 12);
      for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * Math.PI * 2 + (Math.random() - 0.5) * 0.1;
        const rayLength = radius * (6 + Math.random() * 22);

        const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(angle) * rayLength, cy + Math.sin(angle) * rayLength);
        grad.addColorStop(0, 'rgba(240, 246, 255, 0.5)');
        grad.addColorStop(0.4, 'rgba(225, 235, 250, 0.25)');
        grad.addColorStop(1, 'rgba(210, 220, 240, 0)');

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * rayLength, cy + Math.sin(angle) * rayLength);
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(1, radius * 0.08);
        ctx.stroke();
      }
    }
  }

  // Draw famous craters
  famousCraters.forEach((c) => drawCrater(c.x, c.y, c.r, c.hasRays, c.name === 'Plato'));

  // Draw 800+ micro-craters procedural distribution across highlands and maria
  for (let i = 0; i < 900; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const radius = Math.pow(Math.random(), 3) * 18 + 1.5;
    const hasRays = radius > 12 && Math.random() > 0.6;
    drawCrater(cx, cy, radius, hasRays);
  }

  // 5. Build Texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}

/**
 * Photorealistic Normal / Bump Elevation Map for realistic shadow depth on Moon surface
 */
export function createProceduralBumpMap() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Base neutral height heightmap (128 = zero displacement)
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, width, height);

  // Draw crater height depressions & raised rims
  for (let c = 0; c < 600; c++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const radius = Math.pow(Math.random(), 2) * 20 + 2;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.1);
    grad.addColorStop(0, '#101010'); // Deep depression
    grad.addColorStop(0.7, '#606060');
    grad.addColorStop(0.88, '#ffffff'); // Raised bright rim wall
    grad.addColorStop(1, '#808080'); // Surrounding plateau

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Convert Lat/Lng on Sphere (radius R) to Vector3
export function latLngToVector3(lat, lng, radius, altitude = 0) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const r = radius + altitude;
  const x = -(r * Math.sin(phi) * Math.cos(theta));
  const z = r * Math.sin(phi) * Math.sin(theta);
  const y = r * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Convert 3D Point on Sphere back to Lat/Lng
export function vector3ToLatLng(point, radius) {
  const normalized = point.clone().normalize();
  const lat = 90 - (Math.acos(normalized.y) * 180 / Math.PI);
  const theta = Math.atan2(normalized.z, -normalized.x);
  let lng = (theta * 180 / Math.PI) - 180;
  if (lng < -180) lng += 360;
  if (lng > 180) lng -= 360;

  return {
    lat: Number(lat.toFixed(3)),
    lng: Number(lng.toFixed(3))
  };
}
