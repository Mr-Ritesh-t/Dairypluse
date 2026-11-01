'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  MapPin,
  Truck,
  Users,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Clock,
  Sparkles,
  Building2,
  Navigation,
  Gauge,
  AlertTriangle,
  Send,
  Plus,
  Trash2,
  ChevronRight,
  Maximize2,
  Compass,
  Phone,
  ZoomIn,
  ZoomOut,
  Layers,
  Crosshair,
  ExternalLink,
  Search,
  Filter,
  Route,
  Zap,
} from 'lucide-react';
import { Customer, StaffMember, RouteInfo, RouteBuildPayload, RouteCustomerStop, Subscription, DairyInfo } from '@/types';

interface RouteBuilderStudioProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  subscriptions: Subscription[];
  staff: StaffMember[];
  routes: RouteInfo[];
  dairies?: DairyInfo[];
  onDispatch: (payload: RouteBuildPayload) => Promise<boolean>;
}

// Default Dairy Plant / Central Depot Coordinates (Pune Central Depot)
const DEPOT_COORDS = { lat: 18.5520, lng: 73.7880, name: 'DairyPulse Central Hub & Chilling Plant' };

// Map tile layers
type TileLayerType = 'streets' | 'clean' | 'satellite';

const TILE_SERVERS: Record<TileLayerType, { url: string; subdomains?: string[]; attribution: string; name: string }> = {
  streets: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    name: 'Real Streets (OSM)',
  },
  clean: {
    url: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    attribution: '© CartoDB & OpenStreetMap',
    name: 'Clean Dispatch',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri, Maxar, Earthstar Geographics',
    name: 'Satellite Imagery',
  },
};

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

// Haversine distance in kilometers
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function RouteBuilderStudio({
  isOpen,
  onClose,
  customers,
  subscriptions,
  staff,
  routes,
  dairies,
  onDispatch,
}: RouteBuilderStudioProps) {
  const activeDairy = dairies && dairies.length > 0 ? dairies[0] : null;
  const centralDepot = useMemo(() => {
    if (activeDairy && activeDairy.latitude && activeDairy.longitude) {
      return {
        lat: activeDairy.latitude,
        lng: activeDairy.longitude,
        name: `${activeDairy.name} (Hub & Chilling Plant)`,
      };
    }
    return DEPOT_COORDS;
  }, [activeDairy]);

  // Only delivery partners / riders
  const deliveryRiders = useMemo(() => {
    return staff.filter((s) => s.role === 'Delivery Rider');
  }, [staff]);

  // Route metadata
  const [routeCode, setRouteCode] = useState('R-05');
  const [routeName, setRouteName] = useState('Baner Morning Express');
  const [selectedArea, setSelectedArea] = useState('Baner');
  const [assignedRider, setAssignedRider] = useState(deliveryRiders[0]?.name || 'Rahul Deshmukh');
  const [routeSlot, setRouteSlot] = useState('Morning (6:00 AM - 7:30 AM)');
  const [maxCapacity, setMaxCapacity] = useState(60.0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stop entries: [{ customerId: string, customerName?: string, customSlot: string }]
  const [selectedStops, setSelectedStops] = useState<
    Array<{ customerId: string; customerName?: string; customSlot: string }>
  >([]);

  // Auto-initialize with customers once loaded
  const hasInitializedStops = useRef(false);
  useEffect(() => {
    if (customers.length > 0 && (!hasInitializedStops.current || selectedStops.length === 0)) {
      const initialCusts = customers.slice(0, Math.min(3, customers.length));
      if (initialCusts.length > 0) {
        setSelectedStops(
          initialCusts.map((c) => ({
            customerId: c.id,
            customerName: c.name,
            customSlot: c.preferredTime || '6:00 AM - 7:30 AM',
          }))
        );
        hasInitializedStops.current = true;
      }
    }
  }, [customers]);

  // Inspected customer (selected on real map or from list)
  const [selectedPinCustomer, setSelectedPinCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // -------------------------------------------------------------
  // REAL MAP ENGINE STATE (Pan, Zoom, Tiles)
  // -------------------------------------------------------------
  const [centerLat, setCenterLat] = useState(18.5593);
  const [centerLng, setCenterLng] = useState(73.7788);
  const [zoom, setZoom] = useState(14);
  const [tileLayer, setTileLayer] = useState<TileLayerType>('streets');
  const mapViewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportDimensions, setViewportDimensions] = useState({ width: 680, height: 480 });

  // Dynamically extract all available delivery areas from active customers and routes
  const availableAreas = useMemo(() => {
    const areas = new Set<string>();
    customers.forEach((c) => {
      if (c.area && c.area.trim()) areas.add(c.area.trim());
    });
    routes.forEach((r) => {
      if (r.area && r.area.trim()) areas.add(r.area.trim());
    });
    return Array.from(areas);
  }, [customers, routes]);

  // Center map on active dairy location or first valid customer pin (universal for any city/country)
  useEffect(() => {
    if (activeDairy?.latitude && activeDairy?.longitude) {
      setCenterLat(activeDairy.latitude);
      setCenterLng(activeDairy.longitude);
    } else {
      const valid = customers.find((c) => c.latitude && c.longitude);
      if (valid && valid.latitude && valid.longitude) {
        setCenterLat(valid.latitude);
        setCenterLng(valid.longitude);
      }
    }
  }, [activeDairy, customers]);

  // Dragging state for real map panning
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startWorldX: 0, startWorldY: 0 });

  // Update viewport dimensions on mount or resize
  useEffect(() => {
    if (!mapViewportRef.current) return;
    const updateSize = () => {
      if (mapViewportRef.current) {
        setViewportDimensions({
          width: mapViewportRef.current.clientWidth || 680,
          height: mapViewportRef.current.clientHeight || 480,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isOpen]);

  // Map of customer ID -> subscription detail
  const custSubMap = useMemo(() => {
    const map = new Map<string, { variant: string; quantity: number }>();
    subscriptions.forEach((sub) => {
      if (sub.status === 'Active') {
        map.set(sub.customerId, {
          variant: sub.productVariant,
          quantity: sub.quantityLiters,
        });
      }
    });
    return map;
  }, [subscriptions]);

  // Filter customers by selected area and search query
  const areaCustomers = useMemo(() => {
    let list = customers;
    if (selectedArea !== 'ALL') {
      list = list.filter((c) => c.area === selectedArea);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }
    return list;
  }, [customers, selectedArea, searchQuery]);

  // Automatically center real map dynamically on selected area or fit all pins
  const centerOnArea = (area: string) => {
    setSelectedArea(area);
    if (area === 'ALL' || !area) {
      fitAllPins();
      return;
    }
    const matchingCusts = customers.filter(
      (c) => c.area?.toLowerCase() === area.toLowerCase() && c.latitude && c.longitude
    );
    if (matchingCusts.length > 0) {
      const avgLat = matchingCusts.reduce((sum, c) => sum + c.latitude!, 0) / matchingCusts.length;
      const avgLng = matchingCusts.reduce((sum, c) => sum + c.longitude!, 0) / matchingCusts.length;
      setCenterLat(avgLat);
      setCenterLng(avgLng);
      setZoom(14);
    } else {
      fitAllPins();
    }
  };

  // Center on specific customer's doorstep
  const centerOnCustomer = (cust: Customer) => {
    setSelectedPinCustomer(cust);
    if (cust.latitude && cust.longitude) {
      setCenterLat(cust.latitude);
      setCenterLng(cust.longitude);
      setZoom(16); // High zoom to see exact street & building
    }
  };

  // Fit all active customer pins on real map
  const fitAllPins = () => {
    const valid = customers.filter((c) => c.latitude && c.longitude);
    if (valid.length === 0) return;
    const avgLat = valid.reduce((sum, c) => sum + c.latitude!, 0) / valid.length;
    const avgLng = valid.reduce((sum, c) => sum + c.longitude!, 0) / valid.length;
    setCenterLat(avgLat);
    setCenterLng(avgLng);
    setZoom(13);
  };

  // Real Map Pan/Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left mouse click on map canvas
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    const centerWorld = latLngToWorld(centerLat, centerLng, zoom);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startWorldX: centerWorld.x,
      startWorldY: centerWorld.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;
    const newWorldX = dragStartRef.current.startWorldX - dx;
    const newWorldY = dragStartRef.current.startWorldY - dy;
    const newLatLng = worldToLatLng(newWorldX, newWorldY, zoom);
    setCenterLat(newLatLng.lat);
    setCenterLng(newLatLng.lng);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(z + 1, 18));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 1, 11));

  // Compute visible OpenStreetMap tiles
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
        const url = TILE_SERVERS[tileLayer].url
          .replace('{z}', zoom.toString())
          .replace('{x}', tx.toString())
          .replace('{y}', ty.toString());
        tiles.push({ key: `${zoom}-${tx}-${ty}`, left, top, url });
      }
    }
    return tiles;
  }, [centerLat, centerLng, zoom, viewportDimensions, tileLayer]);

  // Compute pixel positions of all customers on the real map
  const customerPixelPositions = useMemo(() => {
    const { width, height } = viewportDimensions;
    const centerWorld = latLngToWorld(centerLat, centerLng, zoom);
    const posMap = new Map<string, { x: number; y: number; isVisible: boolean }>();

    customers.forEach((c) => {
      if (c.latitude && c.longitude) {
        const world = latLngToWorld(c.latitude, c.longitude, zoom);
        const px = world.x - (centerWorld.x - width / 2);
        const py = world.y - (centerWorld.y - height / 2);
        const isVisible = px >= -50 && px <= width + 50 && py >= -50 && py <= height + 50;
        posMap.set(c.id, { x: px, y: py, isVisible });
      }
    });

    // Depot position
    const depotWorld = latLngToWorld(centralDepot.lat, centralDepot.lng, zoom);
    const depotPx = depotWorld.x - (centerWorld.x - width / 2);
    const depotPy = depotWorld.y - (centerWorld.y - height / 2);
    posMap.set('depot', {
      x: depotPx,
      y: depotPy,
      isVisible: depotPx >= -50 && depotPx <= width + 50 && depotPy >= -50 && depotPy <= height + 50,
    });

    return posMap;
  }, [customers, centralDepot, centerLat, centerLng, zoom, viewportDimensions]);

  // Total liters
  const totalLiters = useMemo(() => {
    return selectedStops.reduce((sum, stop) => {
      const sub = custSubMap.get(stop.customerId);
      const qty = sub ? sub.quantity : 1.5;
      return sum + qty;
    }, 0);
  }, [selectedStops, custSubMap]);

  const capacityPct = Math.min(Math.round((totalLiters / maxCapacity) * 100), 100);
  const isOverCapacity = totalLiters > maxCapacity;

  // Real route distance and time estimates
  const routeMetrics = useMemo(() => {
    let totalDistKm = 0;
    let prevCoords = { lat: centralDepot.lat, lng: centralDepot.lng };

    selectedStops.forEach((stop) => {
      const cust = customers.find((c) => c.id === stop.customerId);
      if (cust?.latitude && cust?.longitude) {
        const dist = calculateHaversineDistanceKm(
          prevCoords.lat,
          prevCoords.lng,
          cust.latitude,
          cust.longitude
        );
        totalDistKm += dist;
        prevCoords = { lat: cust.latitude, lng: cust.longitude };
      }
    });

    // ~3 mins driving per km + 3 mins per doorstep delivery stop
    const estTimeMins = Math.round(totalDistKm * 3.2 + selectedStops.length * 2.8);

    return {
      totalDistanceKm: totalDistKm.toFixed(1),
      estimatedTimeMins: estTimeMins || 15,
    };
  }, [selectedStops, customers]);

  // Add stop to route
  const handleAddStop = (customerId: string) => {
    if (selectedStops.some((s) => s.customerId === customerId)) return;
    const cust = customers.find((c) => c.id === customerId);
    setSelectedStops((prev) => [
      ...prev,
      {
        customerId,
        customerName: cust?.name,
        customSlot: cust?.preferredTime || routeSlot,
      },
    ]);
  };

  // Remove stop
  const handleRemoveStop = (customerId: string) => {
    setSelectedStops((prev) => prev.filter((s) => s.customerId !== customerId));
  };

  // Move stop UP in sequence
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setSelectedStops((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Move stop DOWN in sequence
  const handleMoveDown = (index: number) => {
    if (index >= selectedStops.length - 1) return;
    setSelectedStops((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  // Make customer first stop (#1)
  const handleSetFirstStop = (customerId: string) => {
    setSelectedStops((prev) => {
      const target = prev.find((s) => s.customerId === customerId);
      if (!target) return prev;
      const rest = prev.filter((s) => s.customerId !== customerId);
      return [target, ...rest];
    });
  };

  // Auto-optimize route order using Nearest-Neighbor TSP algorithm
  const handleAutoOptimizeSequence = () => {
    if (selectedStops.length <= 1) return;

    let unvisited = [...selectedStops];
    const optimized = [];
    let currentPoint = { lat: centralDepot.lat, lng: centralDepot.lng };

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;

      unvisited.forEach((item, index) => {
        const cust = customers.find((c) => c.id === item.customerId);
        if (cust?.latitude && cust?.longitude) {
          const dist = calculateHaversineDistanceKm(
            currentPoint.lat,
            currentPoint.lng,
            cust.latitude,
            cust.longitude
          );
          if (dist < minDistance) {
            minDistance = dist;
            nearestIndex = index;
          }
        }
      });

      const nextStop = unvisited[nearestIndex];
      optimized.push(nextStop);
      const nextCust = customers.find((c) => c.id === nextStop.customerId);
      if (nextCust?.latitude && nextCust?.longitude) {
        currentPoint = { lat: nextCust.latitude, lng: nextCust.longitude };
      }
      unvisited.splice(nearestIndex, 1);
    }

    setSelectedStops(optimized);
  };

  // Build and dispatch route
  const handleSaveAndDispatch = async () => {
    if (selectedStops.length === 0) {
      alert('Please add at least one customer delivery stop to the route.');
      return;
    }
    if (!assignedRider) {
      alert('Please select a delivery partner for this route.');
      return;
    }

    setIsSubmitting(true);
    try {
      const stops: RouteCustomerStop[] = selectedStops.map((s, idx) => ({
        customerId: s.customerId,
        sequenceOrder: idx + 1,
        customSlot: s.customSlot,
      }));

      const societiesArr = Array.from(
        new Set(
          selectedStops
            .map((s) => {
              const c = customers.find((cust) => cust.id === s.customerId);
              return c?.address ? c.address.split(',')[1]?.trim() || c.address.split(' ')[0] : '';
            })
            .filter(Boolean)
        )
      );

      const payload: RouteBuildPayload = {
        routeCode: routeCode.trim() || 'R-05',
        name: routeName.trim() || `${selectedArea} Morning Express`,
        area: selectedArea,
        assignedRider,
        slot: routeSlot,
        societies: societiesArr.join(', ') || selectedArea,
        maxCapacityLiters: maxCapacity,
        stops,
      };

      const success = await onDispatch(payload);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      alert('Error building route: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // SVG route polyline connecting Depot -> Stop 1 -> Stop 2 -> Stop 3...
  const polylineCoords = useMemo(() => {
    const coords: Array<{ x: number; y: number; label: string }> = [];
    const depotPos = customerPixelPositions.get('depot');
    if (depotPos) {
      coords.push({ x: depotPos.x, y: depotPos.y, label: 'Hub' });
    }

    selectedStops.forEach((stop, idx) => {
      const pos = customerPixelPositions.get(stop.customerId);
      if (pos) {
        coords.push({ x: pos.x, y: pos.y, label: `#${idx + 1}` });
      }
    });

    return coords;
  }, [selectedStops, customerPixelPositions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-7xl max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* ======================================================== */}
        {/* HEADER                                                   */}
        {/* ======================================================== */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Interactive Route Selection on Real Map</h2>
                <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Street Map
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Click any customer to inspect their exact doorstep GPS location, select who gets delivered 1st & 2nd, and create optimal delivery routes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* TOP CONFIGURATION & STATS BAR                            */}
        {/* ======================================================== */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 shrink-0 text-xs items-center">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Route Code</label>
            <input
              type="text"
              value={routeCode}
              onChange={(e) => setRouteCode(e.target.value)}
              className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold uppercase text-slate-800 focus:ring-1 focus:ring-emerald-500"
              placeholder="R-05"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Route Name</label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500"
              placeholder="Baner Morning Express"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Delivery Area / Route</label>
            <select
              value={selectedArea}
              onChange={(e) => centerOnArea(e.target.value)}
              className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Delivery Areas</option>
              {availableAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Assigned Rider</label>
            <select
              value={assignedRider}
              onChange={(e) => setAssignedRider(e.target.value)}
              className="w-full px-2.5 py-1 bg-white border border-emerald-300 rounded-lg font-bold text-emerald-800 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {deliveryRiders.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Delivery Shift</label>
            <select
              value={routeSlot}
              onChange={(e) => setRouteSlot(e.target.value)}
              className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="Morning (6:00 AM - 7:30 AM)">Morning (6:00 - 7:30 AM)</option>
              <option value="Evening (5:30 PM - 7:00 PM)">Evening (5:30 - 7:00 PM)</option>
            </select>
          </div>

          {/* Quick Route Summary Metrics */}
          <div className="bg-emerald-50 p-1.5 rounded-xl border border-emerald-200 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
              <span>{selectedStops.length} Drops</span>
              <span>{totalLiters.toFixed(1)} L</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-emerald-700">
              <span>~{routeMetrics.totalDistanceKm} km</span>
              <span>~{routeMetrics.estimatedTimeMins} mins</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN BODY: REAL MAP + STOP SEQUENCING PANEL              */}
        {/* ======================================================== */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* ------------------------------------------------------ */}
          {/* LEFT: REAL INTERACTIVE OPENSTREETMAP CANVAS (7 COLS)   */}
          {/* ------------------------------------------------------ */}
          <div className="lg:col-span-7 flex flex-col border-r border-slate-200 bg-slate-900 relative min-h-[380px] lg:min-h-0 overflow-hidden select-none">
            
            {/* Real Map Floating Controls Header */}
            <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
              {/* Map Layer Switcher & Area Status */}
              <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-white shadow-lg text-xs">
                <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{selectedArea === 'ALL' || !selectedArea ? 'All Delivery Locations' : selectedArea}</span>
                </span>
                <span className="text-slate-600">|</span>
                {/* Tile Layer Selector */}
                <select
                  value={tileLayer}
                  onChange={(e) => setTileLayer(e.target.value as TileLayerType)}
                  className="bg-slate-800 text-slate-200 text-[11px] font-semibold px-2 py-0.5 rounded border border-slate-600 focus:outline-none cursor-pointer"
                >
                  <option value="streets">🗺️ OSM Real Streets</option>
                  <option value="clean">🧭 Clean Dispatch</option>
                  <option value="satellite">🛰️ Real Satellite</option>
                </select>
              </div>

              {/* Zoom & Fit All Controls */}
              <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 text-white shadow-lg">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200 hover:text-white transition cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200 hover:text-white transition cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={fitAllPins}
                  title="Center All Customer Pins"
                  className="p-1.5 hover:bg-emerald-700 rounded-lg text-emerald-400 hover:text-white transition cursor-pointer"
                >
                  <Crosshair className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Real Map Canvas Viewport with Drag-to-Pan */}
            <div
              ref={mapViewportRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="flex-1 w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing bg-slate-950"
            >
              {/* REAL MAP TILES LAYER */}
              <div className="absolute inset-0 pointer-events-none">
                {visibleTiles.map((tile) => (
                  <img
                    key={tile.key}
                    src={tile.url}
                    alt="Map Tile"
                    loading="eager"
                    className="absolute select-none pointer-events-none"
                    style={{
                      left: tile.left,
                      top: tile.top,
                      width: 256,
                      height: 256,
                    }}
                    onError={(e) => {
                      // Fallback tile background if offline or network glitch
                      (e.target as HTMLElement).style.backgroundColor = '#1e293b';
                    }}
                  />
                ))}
              </div>

              {/* REAL SVG DISPATCH ROUTE POLYLINE (Depot -> Stop 1 -> Stop 2 -> ...) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {polylineCoords.length > 1 && (
                  <>
                    {/* Glowing outer route line */}
                    <polyline
                      points={polylineCoords.map((p) => `${p.x},${p.y}`).join(' ')}
                      fill="none"
                      stroke="#059669"
                      strokeWidth="8"
                      strokeOpacity="0.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Vibrant core route line */}
                    <polyline
                      points={polylineCoords.map((p) => `${p.x},${p.y}`).join(' ')}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="8 6"
                    />
                  </>
                )}
              </svg>

              {/* CENTRAL DAIRY DEPOT / PLANT PIN */}
              {customerPixelPositions.get('depot')?.isVisible && (
                <div
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
                  style={{
                    left: `${customerPixelPositions.get('depot')?.x}px`,
                    top: `${customerPixelPositions.get('depot')?.y}px`,
                  }}
                  onClick={() => {
                    setCenterLat(centralDepot.lat);
                    setCenterLng(centralDepot.lng);
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-amber-400/40">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded shadow border border-amber-500/40 pointer-events-none">
                    {centralDepot.name || 'Dairy Depot (Start)'}
                  </div>
                </div>
              )}

              {/* REAL CUSTOMER DOORSTEP PINS */}
              {customers.map((cust) => {
                const pos = customerPixelPositions.get(cust.id);
                if (!pos || !pos.isVisible) return null;

                const stopIndex = selectedStops.findIndex((s) => s.customerId === cust.id);
                const isSelected = stopIndex !== -1;
                const sequenceNum = stopIndex + 1;
                const isInspected = selectedPinCustomer?.id === cust.id;
                const sub = custSubMap.get(cust.id);

                return (
                  <div
                    key={cust.id}
                    className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer transition-transform ${
                      isInspected ? 'scale-125 z-30' : 'hover:scale-115'
                    }`}
                    style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      centerOnCustomer(cust);
                    }}
                  >
                    {isSelected ? (
                      // Sequenced Stop Pin (#1, #2, #3...)
                      <div className="relative group flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full text-white font-black text-xs flex items-center justify-center shadow-xl border-2 border-white transition-all ${
                            sequenceNum === 1
                              ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 ring-4 ring-emerald-400/60'
                              : sequenceNum === 2
                              ? 'bg-gradient-to-tr from-teal-600 to-cyan-500 ring-4 ring-teal-400/40'
                              : 'bg-emerald-700 ring-2 ring-emerald-500/40'
                          } ${isInspected ? 'ring-4 ring-amber-400 scale-110 transition-transform' : ''}`}
                        >
                          #{sequenceNum}
                        </div>
                        <div className="absolute -bottom-5 whitespace-nowrap bg-emerald-950/95 text-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded shadow border border-emerald-500/40">
                          {cust.name.split(' ')[0]} ({sub?.quantity || 1.5}L)
                        </div>
                      </div>
                    ) : (
                      // Available Customer Pin (Unselected)
                      <div className="relative group flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] flex items-center justify-center shadow-md border-2 border-white ring-2 ring-slate-400/40 ${
                            isInspected ? 'ring-4 ring-amber-400 bg-blue-600 scale-110' : ''
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-300" />
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 whitespace-nowrap bg-slate-900 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow pointer-events-none">
                          {cust.name} ({cust.area})
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Map Footer Attribution */}
              <div className="absolute bottom-1 right-2 z-20 text-[9px] font-mono text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-xs pointer-events-none">
                {TILE_SERVERS[tileLayer].attribution}
              </div>
            </div>

            {/* CUSTOMER DOORSTEP LOCATION INSPECTOR CARD OVERLAY */}
            {selectedPinCustomer && (
              <div className="absolute bottom-3 left-3 right-3 z-30 bg-slate-900/95 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-500/40 text-white shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{selectedPinCustomer.name}</h4>
                      <span className="text-[10px] bg-emerald-900/60 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-700/50">
                        {selectedPinCustomer.area}
                      </span>
                      {selectedStops.some((s) => s.customerId === selectedPinCustomer.id) && (
                        <span className="text-[10px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                          Stop #{selectedStops.findIndex((s) => s.customerId === selectedPinCustomer.id) + 1}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                      📍 {selectedPinCustomer.address}
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5 mt-1 text-[10px]">
                      <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                        GPS: {selectedPinCustomer.latitude?.toFixed(4)}, {selectedPinCustomer.longitude?.toFixed(4)}
                      </span>
                      <span className="text-slate-500">&bull;</span>
                      <span className="text-amber-300 font-semibold">
                        Quota: {custSubMap.get(selectedPinCustomer.id)?.quantity || 1.5}L{' '}
                        {custSubMap.get(selectedPinCustomer.id)?.variant || 'Cow Milk'}
                      </span>
                      <span className="text-slate-500">&bull;</span>
                      <span className="text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {selectedPinCustomer.preferredTime || '6:00 AM - 7:30 AM'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Doorstep Card Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPinCustomer.latitude},${selectedPinCustomer.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition flex items-center gap-1"
                    title="Open in Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {selectedStops.some((s) => s.customerId === selectedPinCustomer.id) ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSetFirstStop(selectedPinCustomer.id)}
                        className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Set this customer as Stop #1"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Make Stop #1</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(selectedPinCustomer.id)}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/40 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Remove Stop
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddStop(selectedPinCustomer.id)}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Route as Stop #{selectedStops.length + 1}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedPinCustomer(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------ */}
          {/* RIGHT: INTERACTIVE SEQUENCING & CUSTOMER LIST (5 COLS) */}
          {/* ------------------------------------------------------ */}
          <div className="lg:col-span-5 flex flex-col bg-white overflow-hidden">
            
            {/* Vehicle Load Gauge & Auto-Optimize Action */}
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-emerald-600" />
                  Vehicle Load Capacity
                </span>
                <span className="font-black text-slate-900 tabular-nums">
                  {totalLiters.toFixed(1)}L / {maxCapacity.toFixed(0)}L
                  <span className="text-slate-400 font-normal ml-1">({capacityPct}%)</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOverCapacity
                      ? 'bg-rose-500'
                      : capacityPct > 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(capacityPct, 100)}%` }}
                />
              </div>

              {isOverCapacity && (
                <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Warning: Milk exceeds {maxCapacity}L vehicle capacity!</span>
                </div>
              )}

              {/* Quick Sequence Optimization Button */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-slate-500 font-medium">
                  {selectedStops.length} stops sequenced
                </div>
                <button
                  type="button"
                  onClick={handleAutoOptimizeSequence}
                  title="Automatically arrange stops by shortest real road distance from depot"
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Auto-Optimize Driving Route</span>
                </button>
              </div>
            </div>

            {/* Scrollable Sequenced Stops and Available Customers */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* SECTION A: SEQUENCED STOPS LIST */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-0.5">
                  <span className="flex items-center gap-1.5">
                    <Route className="w-4 h-4 text-emerald-600" />
                    <span>Sequenced Delivery Order (1st, 2nd, 3rd...)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Use ▲ ▼ to adjust order
                  </span>
                </div>

                {selectedStops.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-1.5">
                    <MapPin className="w-7 h-7 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">No stops added yet</p>
                    <p className="text-[11px] text-slate-400">
                      Click pins on the real map or choose from available customers below.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedStops.map((stop, index) => {
                      const cust =
                        customers.find((c) => c.id === stop.customerId) ||
                        customers.find((c) => c.name === stop.customerName);
                      const sub = custSubMap.get(stop.customerId) || (cust ? custSubMap.get(cust.id) : undefined);
                      const isFirst = index === 0;
                      const isSelectedPin = selectedPinCustomer?.id === stop.customerId || (cust && selectedPinCustomer?.id === cust.id);

                      return (
                        <div
                          key={stop.customerId}
                          onClick={() => cust && centerOnCustomer(cust)}
                          className={`p-2.5 bg-white border rounded-2xl shadow-xs transition space-y-1.5 cursor-pointer ${
                            isSelectedPin
                              ? 'border-emerald-500 ring-2 ring-emerald-400/20 bg-emerald-50/20'
                              : 'border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            {/* Sequence Number Badge */}
                            <div className="flex items-start gap-2">
                              <span
                                className={`w-6 h-6 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs mt-0.5 ${
                                  isFirst
                                    ? 'bg-emerald-600 ring-2 ring-emerald-400/40'
                                    : index === 1
                                    ? 'bg-teal-600'
                                    : 'bg-slate-700'
                                }`}
                              >
                                #{index + 1}
                              </span>

                              <div>
                                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{cust?.name || stop.customerName || 'Customer'}</span>
                                  {isFirst && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">
                                      START
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 line-clamp-1">
                                  {cust?.address || 'Doorstep Pinned Delivery Location'}
                                </p>
                                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1.5">
                                  <span>{sub?.quantity || 1.5}L {sub?.variant || 'Cow Milk'}</span>
                                  <span className="text-slate-400">&bull;</span>
                                  <span className="font-mono text-slate-500">
                                    GPS: {cust?.latitude ? `${cust.latitude.toFixed(4)}, ${cust.longitude?.toFixed(4)}` : '18.5593, 73.7788'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Up, Down, Remove Controls */}
                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                title="Deliver Earlier"
                                className="p-1 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-20 cursor-pointer"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === selectedStops.length - 1}
                                title="Deliver Later"
                                className="p-1 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-20 cursor-pointer"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveStop(stop.customerId)}
                                title="Remove stop"
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION B: SEARCH & ADD AVAILABLE CUSTOMERS */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Available Customers in {selectedArea}</span>
                  <span className="text-[11px] text-slate-400">
                    {areaCustomers.filter((c) => !selectedStops.some((s) => s.customerId === c.id)).length} unselected
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by customer name, address, society..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Available Customers List */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {areaCustomers
                    .filter((c) => !selectedStops.some((s) => s.customerId === c.id))
                    .map((c) => {
                      const sub = custSubMap.get(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => centerOnCustomer(c)}
                          className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs transition cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{c.name}</span>
                              <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
                                📍 {c.area}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 line-clamp-1">{c.address}</div>
                            <div className="text-[9px] text-slate-400 font-mono">
                              GPS: {c.latitude?.toFixed(4)}, {c.longitude?.toFixed(4)} &bull; {sub?.quantity || 1.5}L
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddStop(c.id);
                              centerOnCustomer(c);
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-emerald-600 hover:text-white border border-slate-300 hover:border-emerald-600 rounded-lg text-slate-700 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>

            </div>

            {/* Bottom Dispatch Action */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Selected: <strong>{selectedStops.length} Stops</strong> ({totalLiters.toFixed(1)} L)</span>
                <span>Rider: <strong>{assignedRider}</strong></span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndDispatch}
                  disabled={isSubmitting || selectedStops.length === 0}
                  className="w-2/3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Building Route & Dispatching...' : 'Save Route & Dispatch to Rider'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
