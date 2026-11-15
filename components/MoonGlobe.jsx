import React, { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { createProceduralBumpMap, latLngToVector3, vector3ToLatLng } from '../utils/textureGenerator';

import moonMapUrl from '../assets/moon_map.jpg';
import earthMapUrl from '../assets/earth_map.jpg';

const projectedPlot = new THREE.Vector3();

function positionPlotLabel(object, camera, size) {
  projectedPlot.setFromMatrixPosition(object.matrixWorld).project(camera);
  const x = (projectedPlot.x + 1) * size.width / 2;
  const y = (1 - projectedPlot.y) * size.height / 2;
  const headerBottom = document.querySelector('.header-console')?.getBoundingClientRect().bottom ?? 0;
  return [
    THREE.MathUtils.clamp(x, 82, size.width - 82),
    THREE.MathUtils.clamp(y, headerBottom - size.top + 40, size.height - 14)
  ];
}

const MOON_MAP_SRC = typeof moonMapUrl === 'object' && moonMapUrl?.src ? moonMapUrl.src : (moonMapUrl || '/moon_map.jpg');
const EARTH_MAP_SRC = typeof earthMapUrl === 'object' && earthMapUrl?.src ? earthMapUrl.src : (earthMapUrl || '/earth_map.jpg');

const MOON_RADIUS = 3.5;

// Camera motion controller
function CameraController({ targetPosition }) {
  const { camera, size } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    let frame;
    if (targetPosition) {
      const pos = latLngToVector3(targetPosition.lat, targetPosition.lng, MOON_RADIUS, size.width < 700 ? 9.5 : 6.6);
      const startPos = camera.position.clone();
      let progress = 0;

      const animateCamera = () => {
        progress += 0.04;
        if (progress <= 1) {
          camera.position.lerpVectors(startPos, pos, progress);
          camera.lookAt(0, 0, 0);
          frame = requestAnimationFrame(animateCamera);
        }
      };
      animateCamera();
    }
    return () => cancelAnimationFrame(frame);
  }, [targetPosition, camera, size.width]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={4.2}
      maxDistance={15}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
    />
  );
}

// Distant Real NASA Earth Sphere
function EarthBackground() {
  const earthRef = useRef();
  const earthTexture = useTexture(EARTH_MAP_SRC);
  const { gl } = useThree();

  useEffect(() => {
    if (earthTexture) {
      earthTexture.colorSpace = THREE.SRGBColorSpace;
      earthTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
      earthTexture.needsUpdate = true;
    }
  }, [earthTexture, gl]);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <group position={[24, 11, -34]} ref={earthRef}>
      <mesh>
        <sphereGeometry args={[2.6, 96, 96]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.68, 48, 48]} />
        <meshBasicMaterial color="#38bdf8" side={THREE.BackSide} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

// 3D Square Foot Sector Grid Division Wireframe Overlay
function SqFtGridOverlay({ showGrid }) {
  const gridRef = useRef();

  useFrame((_, delta) => {
    if (gridRef.current) {
      gridRef.current.rotation.y += delta * 0.008;
    }
  });

  if (!showGrid) return null;

  return (
    <mesh ref={gridRef}>
      <sphereGeometry args={[MOON_RADIUS * 1.004, 64, 32]} />
      <meshBasicMaterial
        color="#00f3ff"
        wireframe
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

// Photorealistic NASA Moon Mesh with Grid Division
function PhotorealisticMoonMesh({
  onSelectPoint,
  activeCoordinates,
  presetRegions,
  claimedPlots,
  onOpenDeed,
  selectedRegion,
  showGrid
}) {
  const sphereRef = useRef();
  const { gl } = useThree();

  // Load NASA photo texture map
  const moonTexture = useTexture(MOON_MAP_SRC);

  // Generate procedural elevation bump map
  const bumpMap = useMemo(() => createProceduralBumpMap(), []);

  useEffect(() => {
    if (moonTexture) {
      moonTexture.colorSpace = THREE.SRGBColorSpace;
      moonTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
      moonTexture.minFilter = THREE.LinearMipmapLinearFilter;
      moonTexture.magFilter = THREE.LinearFilter;
      moonTexture.needsUpdate = true;
    }
    if (bumpMap) {
      bumpMap.anisotropy = gl.capabilities.getMaxAnisotropy();
      bumpMap.needsUpdate = true;
    }
  }, [moonTexture, bumpMap, gl]);

  // Natural axial rotation
  useFrame((_, delta) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += delta * 0.008;
    }
  });

  // Click detector for custom coordinates
  const handleSphereClick = (e) => {
    e.stopPropagation();
    if (!e.point) return;

    const latLng = vector3ToLatLng(e.point, MOON_RADIUS);
    onSelectPoint({ lat: latLng.lat, lng: latLng.lng });
  };

  return (
    <group>
      {/* 3D Moon Globe Surface */}
      <mesh
        ref={sphereRef}
        onClick={handleSphereClick}
        rotation={[0.1, 0.4, 0]}
      >
        <sphereGeometry args={[MOON_RADIUS, 256, 256]} />
        <meshStandardMaterial
          map={moonTexture}
          bumpMap={bumpMap}
          bumpScale={0.12}
          roughness={0.88}
          metalness={0.03}
        />

        {/* Claimed Plot Flag Markers */}
        {claimedPlots.map((plot) => {
          const pos = latLngToVector3(plot.lat, plot.lng, MOON_RADIUS, 0.05);


          return (
            <group
              key={plot.id}
              position={[pos.x, pos.y, pos.z]}
            >
              <mesh onClick={(event) => { event.stopPropagation(); onOpenDeed(plot); }}>
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshBasicMaterial color="#3b82f6" />
              </mesh>
              <Html
                position={pos.clone().normalize().multiplyScalar(0.06)}
                calculatePosition={positionPlotLabel}
                center
                occlude={[sphereRef]}
                zIndexRange={[5, 0]}
              >
                <button
                  type="button"
                  className="moon-plot-label"
                  aria-label={`View deed for ${plot.title}`}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenDeed(plot);
                  }}
                >
                  {plot.title}
                </button>
              </Html>
            </group>
          );
        })}

        {/* Preset Landmark Region Beacons */}
        {presetRegions.map((region) => {
          const pos = latLngToVector3(region.lat, region.lng, MOON_RADIUS, 0.05);
          const isSelected = selectedRegion?.id === region.id;

          return (
            <group
              key={region.id}
              position={[pos.x, pos.y, pos.z]}
            >
              <mesh
                onClick={(evt) => {
                  evt.stopPropagation();
                  onSelectPoint({ lat: region.lat, lng: region.lng, region });
                }}
              >
                <sphereGeometry args={[isSelected ? 0.06 : 0.035, 16, 16]} />
                <meshBasicMaterial color={isSelected ? '#60a5fa' : '#94a3b8'} />
              </mesh>
            </group>
          );
        })}

        {/* Active Clicked Location Pin */}
        {activeCoordinates && (
          <group position={latLngToVector3(activeCoordinates.lat, activeCoordinates.lng, MOON_RADIUS, 0.08)}>
            <mesh>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#ffb700" />
            </mesh>
          </group>
        )}
      </mesh>

      {/* Sq Ft Division Overlay */}
      <SqFtGridOverlay showGrid={showGrid} />

      {/* Outer Rim Glow Ring */}
      <mesh>
        <sphereGeometry args={[MOON_RADIUS * 1.008, 64, 64]} />
        <meshBasicMaterial
          color="#a0c4ff"
          side={THREE.BackSide}
          transparent
          opacity={0.05}
        />
      </mesh>
    </group>
  );
}

export default function MoonGlobe({
  onSelectPoint,
  activeCoordinates,
  presetRegions,
  claimedPlots,
  onOpenDeed,
  selectedRegion,
  showGrid
}) {
  return (
    <div className="moon-canvas-wrapper">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 11], fov: 45 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.25,
          powerPreference: 'high-performance'
        }}
      >
        <ambientLight intensity={0.22} />
        <directionalLight position={[16, 12, 14]} intensity={2.0} color="#ffffff" />
        <directionalLight position={[-16, -8, -10]} intensity={0.25} color="#38bdf8" />
        
        <Stars radius={140} depth={60} count={2200} factor={4} saturation={0} fade speed={1} />
        
        <Suspense fallback={null}>
          <EarthBackground />
          <PhotorealisticMoonMesh
            onSelectPoint={onSelectPoint}
            activeCoordinates={activeCoordinates}
            presetRegions={presetRegions}
            claimedPlots={claimedPlots}
            onOpenDeed={onOpenDeed}
            selectedRegion={selectedRegion}
            showGrid={showGrid}
          />
        </Suspense>
        
        <CameraController targetPosition={activeCoordinates} />
      </Canvas>

      <style>{`
        .moon-plot-label {
          transform: translateY(-75%);
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          border: 1px solid #60a5fa;
          border-radius: 5px;
          background: #0f172a;
          color: #fff;
          cursor: pointer;
          padding: 4px 8px;
          font-size: 12px;
        }

        .moon-plot-label:hover,
        .moon-plot-label:focus-visible {
          background: #1d4ed8;
        }

        .moon-canvas-wrapper {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
        }

        .claimed-flag-pin {
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translate(-50%, -100%);
          pointer-events: auto;
          cursor: pointer;
        }

        .flag-banner {
          background: rgba(0, 0, 0, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 2px 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .flag-icon {
          font-size: 14px;
        }

        .flag-title {
          font-family: var(--font-sans);
          font-size: 10px;
          color: #f8fafc;
          font-weight: 600;
        }

        .flag-pole {
          width: 2px;
          height: 18px;
          background: rgba(255, 255, 255, 0.3);
        }

        .region-beacon-tag {
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #f8fafc;
          padding: 3px 8px;
          border-radius: 12px;
          font-family: var(--font-sans);
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          cursor: pointer;
          transform: translate(-50%, -50%);
          transition: all 0.2s ease;
        }

        .region-beacon-tag:hover, .region-beacon-tag.active {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          font-weight: 700;
          transform: translate(-50%, -50%) scale(1.1);
        }

        .beacon-icon {
          animation: pulse 1.5s infinite;
        }

        .active-pin-callout {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.9);
          color: #000000;
          padding: 4px 10px;
          border-radius: 4px;
          font-family: var(--font-sans);
          font-weight: 700;
          font-size: 11px;
          white-space: nowrap;
          transform: translate(-50%, -100%);
        }
        .pin-icon {
          color: #000000;
        }
      `}</style>
    </div>
  );
}
