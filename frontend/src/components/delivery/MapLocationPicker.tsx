'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Crosshair,
  ExternalLink,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  ZoomIn,
  ZoomOut,
  Hand,
  Search,
} from 'lucide-react';

interface MapLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  areaHint?: string;
  onLocationSelect: (lat: number, lng: number) => void;
  label?: string;
  compact?: boolean;
}

// Preset landmarks for quick navigation
const PRESET_LANDMARKS = [
  { name: 'Baner (High St)', lat: 18.5593, lng: 73.7788 },
  { name: 'Aundh (Bremen Chowk)', lat: 18.5602, lng: 73.8031 },
  { name: 'Wakad (Datta Mandir)', lat: 18.5987, lng: 73.7667 },
  { name: 'Hinjawadi (Phase 1)', lat: 18.5913, lng: 73.7389 },
  { name: 'Kothrud (Mayur Colony)', lat: 18.5074, lng: 73.8077 },
  { name: 'Delhi (Connaught Place)', lat: 28.6315, lng: 77.2167 },
  { name: 'Mumbai (BKC)', lat: 19.0657, lng: 72.8687 },
  { name: 'Bengaluru (Indiranagar)', lat: 12.9716, lng: 77.6412 },
];

// Web Mercator EPSG:3857 math for real tile mapping
function latLngToWorld(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * n * 256;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n * 256;
  return { x, y };
}

function worldToLatLng(x: number, y: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const lng = (x / (n * 256)) * 360 - 180;
  const n2 = Math.PI - (2 * Math.PI * y) / (n * 256);
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n2) - Math.exp(-n2)));
  return { lat, lng };
}

export default function MapLocationPicker({
  initialLat = 18.5593,
  initialLng = 73.7788,
  areaHint,
  onLocationSelect,
  label = 'Pin Delivery Location on Map',
  compact = false,
}: MapLocationPickerProps) {
  const [pinLat, setPinLat] = useState<number>(initialLat || 18.5593);
  const [pinLng, setPinLng] = useState<number>(initialLng || 73.7788);

  // Map viewport center and zoom state
  const [centerLat, setCenterLat] = useState<number>(initialLat || 18.5593);
  const [centerLng, setCenterLng] = useState<number>(initialLng || 73.7788);
  const [zoom, setZoom] = useState<number>(15);

  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoSuccess, setGeoSuccess] = useState<string | null>(null);
  const [isDraggingPin, setIsDraggingPin] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const mapViewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportDimensions, setViewportDimensions] = useState({ width: 500, height: 260 });

  // Refs for tracking interaction (mouse or touch / hand)
  const isDraggingPinRef = useRef(false);
  const isPanningMapRef = useRef(false);
  const dragStartRef = useRef({
    clientX: 0,
    clientY: 0,
    centerWorldX: 0,
    centerWorldY: 0,
    totalMoved: 0,
  });

  // Keep internal coordinates synchronized with initial props
  useEffect(() => {
    if (initialLat && initialLng && (initialLat !== pinLat || initialLng !== pinLng)) {
      setPinLat(initialLat);
      setPinLng(initialLng);
      setCenterLat(initialLat);
      setCenterLng(initialLng);
    }
  }, [initialLat, initialLng]);

  // Handle area hint
  useEffect(() => {
    if ((!initialLat || initialLat === 18.5593) && areaHint) {
      const match = PRESET_LANDMARKS.find((p) =>
        p.name.toLowerCase().includes(areaHint.toLowerCase())
      );
      if (match) {
        updateCoordinates(match.lat, match.lng);
        setCenterLat(match.lat);
        setCenterLng(match.lng);
      }
    }
  }, [areaHint]);

  // Responsive viewport measurement
  useEffect(() => {
    if (!mapViewportRef.current) return;
    const updateSize = () => {
      if (mapViewportRef.current) {
        setViewportDimensions({
          width: mapViewportRef.current.clientWidth || 500,
          height: mapViewportRef.current.clientHeight || 260,
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(mapViewportRef.current);
    return () => observer.disconnect();
  }, []);

  const updateCoordinates = useCallback(
    (newLat: number, newLng: number) => {
      const roundedLat = parseFloat(newLat.toFixed(5));
      const roundedLng = parseFloat(newLng.toFixed(5));
      setPinLat(roundedLat);
      setPinLng(roundedLng);
      onLocationSelect(roundedLat, roundedLng);
    },
    [onLocationSelect]
  );

  // Compute visible OpenStreetMap tiles based on centerLat, centerLng and zoom
  const visibleTiles = useMemo(() => {
    const { width, height } = viewportDimensions;
    const centerWorld = latLngToWorld(centerLat, centerLng, zoom);
    const minTileX = Math.floor((centerWorld.x - width / 2) / 256);
    const maxTileX = Math.floor((centerWorld.x + width / 2) / 256);
    const minTileY = Math.floor((centerWorld.y - height / 2) / 256);
    const maxTileY = Math.floor((centerWorld.y + height / 2) / 256);

    const tiles = [];
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        const left = tx * 256 - (centerWorld.x - width / 2);
        const top = ty * 256 - (centerWorld.y - height / 2);
        const url = `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`;
        tiles.push({ key: `${zoom}-${tx}-${ty}`, left, top, url });
      }
    }
    return tiles;
  }, [centerLat, centerLng, zoom, viewportDimensions]);

  // Compute screen pixel position of the pin
  const pinScreenPos = useMemo(() => {
    const { width, height } = viewportDimensions;
    const centerWorld = latLngToWorld(centerLat, centerLng, zoom);
    const pinWorld = latLngToWorld(pinLat, pinLng, zoom);
    return {
      x: pinWorld.x - centerWorld.x + width / 2,
      y: pinWorld.y - centerWorld.y + height / 2,
    };
  }, [centerLat, centerLng, pinLat, pinLng, zoom, viewportDimensions]);

  const centerLatRef = useRef(centerLat);
  const centerLngRef = useRef(centerLng);
  const zoomRef = useRef(zoom);
  const viewportDimensionsRef = useRef(viewportDimensions);

  useEffect(() => {
    centerLatRef.current = centerLat;
    centerLngRef.current = centerLng;
    zoomRef.current = zoom;
    viewportDimensionsRef.current = viewportDimensions;
  }, [centerLat, centerLng, zoom, viewportDimensions]);

  // Convert viewport clientX/clientY to LatLng
  const clientPosToLatLng = useCallback(
    (clientX: number, clientY: number) => {
      if (!mapViewportRef.current) return null;
      const rect = mapViewportRef.current.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      const currentZoom = zoomRef.current;
      const centerWorld = latLngToWorld(centerLatRef.current, centerLngRef.current, currentZoom);
      const worldX = centerWorld.x - viewportDimensionsRef.current.width / 2 + localX;
      const worldY = centerWorld.y - viewportDimensionsRef.current.height / 2 + localY;
      return worldToLatLng(worldX, worldY, currentZoom);
    },
    []
  );

  // -------------------------------------------------------------
  // INTERACTION ENGINE: DRAG PIN OR PAN MAP (MOUSE + HAND/TOUCH)
  // -------------------------------------------------------------
  const handlePointerStart = (clientX: number, clientY: number, isDirectPinTarget: boolean) => {
    const centerWorld = latLngToWorld(centerLatRef.current, centerLngRef.current, zoomRef.current);
    dragStartRef.current = {
      clientX,
      clientY,
      centerWorldX: centerWorld.x,
      centerWorldY: centerWorld.y,
      totalMoved: 0,
    };

    if (isDirectPinTarget) {
      isDraggingPinRef.current = true;
      setIsDraggingPin(true);
      isPanningMapRef.current = false;
    } else {
      isDraggingPinRef.current = false;
      isPanningMapRef.current = true;
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    const dx = clientX - dragStartRef.current.clientX;
    const dy = clientY - dragStartRef.current.clientY;
    dragStartRef.current.totalMoved += Math.sqrt(dx * dx + dy * dy);

    if (isDraggingPinRef.current) {
      // User is dragging the pin directly with hand or mouse
      const coords = clientPosToLatLng(clientX, clientY);
      if (coords) {
        updateCoordinates(coords.lat, coords.lng);
      }
    } else if (isPanningMapRef.current) {
      // User is panning the map canvas
      const newWorldX = dragStartRef.current.centerWorldX - dx;
      const newWorldY = dragStartRef.current.centerWorldY - dy;
      const newCenter = worldToLatLng(newWorldX, newWorldY, zoomRef.current);
      setCenterLat(newCenter.lat);
      setCenterLng(newCenter.lng);
      centerLatRef.current = newCenter.lat;
      centerLngRef.current = newCenter.lng;
    }
  };

  const handlePointerEnd = (clientX: number, clientY: number) => {
    if (isDraggingPinRef.current) {
      isDraggingPinRef.current = false;
      setIsDraggingPin(false);
      setActionNotice('📍 Doorstep pin placed!');
      setTimeout(() => setActionNotice(null), 2500);
    } else if (isPanningMapRef.current) {
      isPanningMapRef.current = false;
      // If the pointer barely moved (< 8px), it was a direct tap/click on the map
      if (dragStartRef.current.totalMoved < 8) {
        const coords = clientPosToLatLng(clientX, clientY);
        if (coords) {
          updateCoordinates(coords.lat, coords.lng);
          setActionNotice('📍 Pin moved to tapped location!');
          setTimeout(() => setActionNotice(null), 2500);
        }
      }
    }
  };

  // Global window listeners for drag gestures so dragging continues smoothly even outside map borders
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDraggingPinRef.current || isPanningMapRef.current) {
        handlePointerMove(e.clientX, e.clientY);
      }
    };
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDraggingPinRef.current || isPanningMapRef.current) {
        handlePointerEnd(e.clientX, e.clientY);
      }
    };
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if ((isDraggingPinRef.current || isPanningMapRef.current) && e.touches.length === 1) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (isDraggingPinRef.current || isPanningMapRef.current) {
        if (e.changedTouches.length > 0) {
          handlePointerEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
    window.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [clientPosToLatLng, updateCoordinates]);

  // Mouse event handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const isPin = (e.target as HTMLElement).closest('.doorstep-pin-target') !== null;
    handlePointerStart(e.clientX, e.clientY, isPin);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDraggingPinRef.current || isPanningMapRef.current) {
      handlePointerMove(e.clientX, e.clientY);
    }
  };

  const onMouseUp = (e: React.MouseEvent) => {
    handlePointerEnd(e.clientX, e.clientY);
  };

  // Touch event handlers for hand/finger gestures on mobile & tablets
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const isPin = (e.target as HTMLElement).closest('.doorstep-pin-target') !== null;
    handlePointerStart(touch.clientX, touch.clientY, isPin);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (isDraggingPinRef.current || isPanningMapRef.current) {
      handlePointerMove(touch.clientX, touch.clientY);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (touch) {
      handlePointerEnd(touch.clientX, touch.clientY);
    }
  };

  // Mouse wheel zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(z + 1, 19));
    } else if (e.deltaY > 0) {
      setZoom((z) => Math.max(z - 1, 11));
    }
  };

  // Center view on current pin
  const centerOnPin = () => {
    setCenterLat(pinLat);
    setCenterLng(pinLng);
    setZoom(16);
    setActionNotice('🎯 Centered on pin');
    setTimeout(() => setActionNotice(null), 2000);
  };

  // GPS Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);
    setGeoSuccess(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        updateCoordinates(userLat, userLng);
        setCenterLat(userLat);
        setCenterLng(userLng);
        setZoom(17);
        setIsLocating(false);
        setGeoSuccess('Exact GPS coordinates captured! You can now fine-tune the pin.');
        setTimeout(() => setGeoSuccess(null), 3500);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('GPS permission was denied. Tap or drag the pin manually on the map.');
        } else {
          setGeoError('Could not retrieve GPS signal. Using current position.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const gmapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${pinLat},${pinLng}`;

  return (
    <div className="space-y-2.5 bg-slate-50/95 rounded-2xl p-3 border border-slate-200">
      {/* Header bar with GPS and Recenter */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-800 leading-tight truncate">
              {label}
            </label>
            <span className="text-[10px] text-slate-500 block truncate">
              Touch/drag pin with hand or mouse to your doorstep
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={centerOnPin}
            title="Recenter map on your pin"
            className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 shadow-2xs transition cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5 text-slate-600" />
          </button>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
          </button>
        </div>
      </div>

      {/* Geolocation feedback alerts */}
      {geoSuccess && (
        <div className="px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in duration-150">
          <Check className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
          <span>{geoSuccess}</span>
        </div>
      )}
      {geoError && (
        <div className="px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-semibold flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 text-amber-700" />
          <span>{geoError}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* REAL INTERACTIVE MAP CANVAS WITH DRAGGABLE PIN           */}
      {/* ======================================================== */}
      <div
        ref={mapViewportRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
        className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-900 select-none cursor-grab active:cursor-grabbing touch-none"
      >
        {/* OpenStreetMap Tile Layer Canvas */}
        <div className="absolute inset-0 pointer-events-none">
          {visibleTiles.map((t) => (
            <img
              key={t.key}
              src={t.url}
              alt=""
              loading="eager"
              className="absolute w-[256px] h-[256px] pointer-events-none select-none max-w-none"
              style={{
                left: `${t.left}px`,
                top: `${t.top}px`,
              }}
              onError={(e) => {
                // Fallback to carto voyager tile if OSM tile is busy
                const img = e.currentTarget;
                if (!img.dataset.fallback) {
                  img.dataset.fallback = 'true';
                  const parts = t.url.split('/');
                  const z = parts[parts.length - 3];
                  const x = parts[parts.length - 2];
                  const y = parts[parts.length - 1];
                  img.src = `https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}`;
                }
              }}
            />
          ))}
        </div>

        {/* Hand Drag & Tap Helper Ribbon */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
          <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-white shadow-lg text-[10px] font-medium flex items-center gap-1.5 pointer-events-auto">
            <Hand className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Drag pin or tap map to set doorstep</span>
          </div>

          {actionNotice && (
            <div className="bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-md animate-in fade-in duration-150">
              {actionNotice}
            </div>
          )}
        </div>

        {/* Floating Zoom Controls (+ / -) */}
        <div className="absolute top-10 right-2 z-20 flex flex-col gap-1 pointer-events-auto shadow-md">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.min(z + 1, 19));
            }}
            title="Zoom In"
            className="w-7 h-7 bg-white/95 hover:bg-white text-slate-800 rounded-lg flex items-center justify-center font-bold text-xs border border-slate-300 shadow-2xs hover:scale-105 transition cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.max(z - 1, 11));
            }}
            title="Zoom Out"
            className="w-7 h-7 bg-white/95 hover:bg-white text-slate-800 rounded-lg flex items-center justify-center font-bold text-xs border border-slate-300 shadow-2xs hover:scale-105 transition cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* DRAGGABLE DOORSTEP PIN MARKER (HAND / MOUSE MOVABLE)    */}
        {/* ======================================================== */}
        <div
          className="doorstep-pin-target absolute z-30 cursor-move pointer-events-auto"
          style={{
            left: `${pinScreenPos.x}px`,
            top: `${pinScreenPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          title="Click and drag with mouse or finger to move pin"
        >
          <div className="relative flex flex-col items-center group">
            {/* Pin Tooltip / Coordinate Pill */}
            <div
              className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold shadow-xl mb-1 tracking-wider uppercase transition-all duration-150 border ${
                isDraggingPin
                  ? 'bg-emerald-600 text-white border-emerald-400 scale-110 shadow-emerald-900/50'
                  : 'bg-slate-900/90 text-white border-slate-700'
              }`}
            >
              {isDraggingPin ? 'Dragging...' : 'Doorstep Pin'}
            </div>

            {/* Glowing Map Pin Icon */}
            <div className="relative">
              <MapPin
                className={`w-9 h-9 text-rose-600 fill-rose-500 drop-shadow-xl transition-transform duration-100 ${
                  isDraggingPin ? 'scale-125 -translate-y-2 text-rose-500' : 'hover:scale-110'
                }`}
              />

              {/* Pulse ripple when dragging */}
              {isDraggingPin && (
                <div className="absolute inset-0 rounded-full bg-rose-400/40 animate-ping -z-10" />
              )}
            </div>

            {/* Ground shadow spot */}
            <div
              className={`w-4 h-1.5 bg-black/50 rounded-full mx-auto -mt-1 blur-[1px] transition-all duration-150 ${
                isDraggingPin ? 'scale-75 opacity-40' : 'scale-100 opacity-80'
              }`}
            />
          </div>
        </div>

        {/* Floating Quick Footer Coordinates & G-Maps Link */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-auto z-20">
          <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-white shadow-lg text-[10px] font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="tabular-nums">
              {pinLat.toFixed(5)}, {pinLng.toFixed(5)}
            </span>
          </div>

          <a
            href={gmapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Preview navigation in Google Maps"
            className="px-2.5 py-1 bg-white/95 hover:bg-white text-blue-700 border border-slate-200 shadow-md rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <span>Preview in G-Maps</span>
            <ExternalLink className="w-3 h-3 text-blue-600" />
          </a>
        </div>
      </div>

      {/* Preset Landmark Chips */}
      <div>
        <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Quick Society & Landmark Presets:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {PRESET_LANDMARKS.map((preset) => {
            const isSelected =
              Math.abs(pinLat - preset.lat) < 0.002 && Math.abs(pinLng - preset.lng) < 0.002;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  updateCoordinates(preset.lat, preset.lng);
                  setCenterLat(preset.lat);
                  setCenterLng(preset.lng);
                  setZoom(16);
                }}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Coordinate Fine-Tuning Inputs */}
      {!compact && (
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
              Latitude
            </label>
            <input
              type="number"
              step="0.00001"
              value={pinLat}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                updateCoordinates(val, pinLng);
                setCenterLat(val);
              }}
              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
              Longitude
            </label>
            <input
              type="number"
              step="0.00001"
              value={pinLng}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                updateCoordinates(pinLat, val);
                setCenterLng(val);
              }}
              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
