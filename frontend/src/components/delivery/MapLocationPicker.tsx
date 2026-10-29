'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

interface MapLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  areaHint?: string;
  onLocationSelect: (lat: number, lng: number) => void;
  label?: string;
  compact?: boolean;
}

const PRESET_LANDMARKS = [
  { name: 'Baner (Rohan Nilay / High St)', lat: 18.5593, lng: 73.7788 },
  { name: 'Aundh (Bremen Chowk)', lat: 18.5602, lng: 73.8031 },
  { name: 'Wakad (Datta Mandir Rd)', lat: 18.5987, lng: 73.7667 },
  { name: 'Hinjawadi (Phase 1)', lat: 18.5913, lng: 73.7389 },
  { name: 'Kothrud (Mayur Colony)', lat: 18.5074, lng: 73.8077 },
];

export default function MapLocationPicker({
  initialLat = 18.5593,
  initialLng = 73.7788,
  areaHint,
  onLocationSelect,
  label = 'Pin Delivery Location on Map',
  compact = false,
}: MapLocationPickerProps) {
  const [lat, setLat] = useState<number>(initialLat || 18.5593);
  const [lng, setLng] = useState<number>(initialLng || 73.7788);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoSuccess, setGeoSuccess] = useState<string | null>(null);

  // If areaHint matches a preset on first mount and no coords were provided
  useEffect(() => {
    if ((!initialLat || initialLat === 18.5593) && areaHint) {
      const match = PRESET_LANDMARKS.find((p) =>
        p.name.toLowerCase().includes(areaHint.toLowerCase())
      );
      if (match) {
        setLat(match.lat);
        setLng(match.lng);
        onLocationSelect(match.lat, match.lng);
      }
    }
  }, [areaHint]);

  const updateCoordinates = (newLat: number, newLng: number) => {
    // Round to 5 decimal places (~1 meter precision)
    const roundedLat = parseFloat(newLat.toFixed(5));
    const roundedLng = parseFloat(newLng.toFixed(5));
    setLat(roundedLat);
    setLng(roundedLng);
    onLocationSelect(roundedLat, roundedLng);
  };

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
        setIsLocating(false);
        setGeoSuccess('Exact GPS coordinates captured!');
        setTimeout(() => setGeoSuccess(null), 3500);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('GPS permission was denied. Select a landmark or tap on the map.');
        } else {
          setGeoError('Could not retrieve GPS signal. Using approximate position.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // OpenStreetMap Bounding Box around current pin for embed
  const delta = 0.005; // ~500m window
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const gmapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="space-y-2.5 bg-slate-50/90 rounded-2xl p-3 border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-800 leading-tight">
              {label}
            </label>
            <span className="text-[10px] text-slate-500 block">
              Helps delivery boy reach your doorstep without phone calls
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
        </button>
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

      {/* Interactive Map Frame with Pin Overlay */}
      <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-200">
        <iframe
          title="Doorstep Delivery Location Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={osmEmbedUrl}
          className="w-full h-full pointer-events-none"
        />

        {/* Center Target Marker */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex flex-col items-center -translate-y-4">
            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-extrabold shadow-lg mb-1 tracking-wider uppercase border border-slate-700">
              Doorstep Pin
            </span>
            <div className="relative">
              <MapPin className="w-8 h-8 text-rose-600 fill-rose-500 drop-shadow-md animate-bounce" />
              <div className="w-3 h-1 bg-black/40 rounded-full mx-auto -mt-1 blur-[1px]"></div>
            </div>
          </div>
        </div>

        {/* Floating Quick Controls on Map */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm text-[10px] text-slate-700 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="tabular-nums">
              {lat.toFixed(4)}, {lng.toFixed(4)}
            </span>
          </div>

          <a
            href={gmapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Preview navigation in Google Maps"
            className="px-2.5 py-1 bg-white/95 hover:bg-white text-blue-700 border border-slate-200 shadow-sm rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
          >
            <span>Preview in G-Maps</span>
            <ExternalLink className="w-3 h-3 text-blue-600" />
          </a>
        </div>
      </div>

      {/* Preset Pune Area Chips */}
      <div>
        <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Quick Society & Area Presets:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {PRESET_LANDMARKS.map((preset) => {
            const isSelected =
              Math.abs(lat - preset.lat) < 0.002 && Math.abs(lng - preset.lng) < 0.002;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => updateCoordinates(preset.lat, preset.lng)}
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

      {/* Coordinate Fine-Tuning */}
      {!compact && (
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80">
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
              Latitude
            </label>
            <input
              type="number"
              step="0.00001"
              value={lat}
              onChange={(e) => updateCoordinates(parseFloat(e.target.value) || 0, lng)}
              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
              Longitude
            </label>
            <input
              type="number"
              step="0.00001"
              value={lng}
              onChange={(e) => updateCoordinates(lat, parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
            />
          </div>
        </div>
      )}
    </div>
  );
}
