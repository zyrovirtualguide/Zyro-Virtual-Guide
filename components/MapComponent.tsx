
import React, { useEffect, useRef, useState } from 'react';

declare const L: any;

interface MarkerData {
  name: string;
  lat: number;
  lng: number;
  category?: string;
}

interface MapComponentProps {
  markers?: MarkerData[];
  userLocation?: { lat: number; lng: number } | null;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  markers = [], 
  userLocation = null, 
  center = { lat: 20.5937, lng: 78.9629 }, 
  zoom = 5,
  className = "h-96 w-full"
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);

  const handleRecenter = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, {
        duration: 2,
        easeLinearity: 0.1
      });
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map with optimized settings
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        fadeAnimation: true,
        markerZoomAnimation: true,
        doubleClickZoom: true,
        keyboard: true,
        keyboardPanDelta: 80,
        scrollWheelZoom: 'center'
      }).setView([center.lat, center.lng], zoom);
      
      // Use Google Hybrid (Satellite + Labels)
      L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps Intelligence'
      }).addTo(mapInstanceRef.current);

      // Add Scale Control
      L.control.scale({ position: 'bottomleft', imperial: true, metric: true }).addTo(mapInstanceRef.current);

      // Re-add zoom control to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstanceRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);

      // Track zoom level for HUD
      mapInstanceRef.current.on('zoomend', () => {
        setCurrentZoom(mapInstanceRef.current.getZoom());
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // High-visibility User Location Marker (Blue Pulse)
    if (userLocation) {
      const userIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 bg-blue-500/20 rounded-full animate-ping"></div>
            <div class="absolute w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_20px_#3b82f6]"></div>
            <div class="absolute -bottom-6 bg-black/80 px-2 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-tighter border border-white/10">You</div>
          </div>
        `,
        className: 'user-marker',
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(markersLayerRef.current)
        .bindPopup(`
          <div class="p-2 text-center">
            <span class="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-1">Your Location</span>
            <p class="text-slate-900 font-bold text-xs">${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}</p>
          </div>
        `);
    }

    // High-contrast Place Markers (Indigo Glow)
    markers.forEach(marker => {
      const placeIcon = L.divIcon({
        html: `
          <div class="group relative flex flex-col items-center">
            <div class="bg-indigo-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-[0_10px_25px_rgba(0,0,0,0.5)] transform hover:scale-125 hover:-translate-y-2 transition-all duration-300">
              <i class="fas fa-location-dot"></i>
            </div>
            <div class="mt-2 bg-black/90 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-2xl">
              <span class="text-[10px] font-black text-white uppercase tracking-tighter">${marker.name}</span>
            </div>
          </div>
        `,
        className: 'custom-marker',
        iconSize: [40, 60],
        iconAnchor: [20, 50],
        popupAnchor: [0, -45]
      });

      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(marker.name)}`;

      const popupContent = document.createElement('div');
      popupContent.className = 'p-4 min-w-[180px]';
      popupContent.innerHTML = `
        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest block mb-2">${marker.category || 'POI'}</span>
        <h3 class="text-slate-900 font-black text-xl leading-tight mb-4">${marker.name}</h3>
        <div class="grid grid-cols-2 gap-2">
          <button class="teleport-btn py-2.5 bg-indigo-600 text-white text-[9px] font-black rounded-xl uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2">
            <i class="fas fa-bolt"></i><span>Teleport</span>
          </button>
          <a href="${mapsUrl}" target="_blank" class="py-2.5 bg-blue-100 text-blue-600 text-[9px] font-black rounded-xl uppercase tracking-widest hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2 no-underline">
            <i class="fas fa-map"></i><span>Maps</span>
          </a>
        </div>
      `;

      const m = L.marker([marker.lat, marker.lng], { icon: placeIcon })
        .addTo(markersLayerRef.current)
        .bindPopup(popupContent);

      m.on('popupopen', () => {
        const btn = popupContent.querySelector('.teleport-btn');
        btn?.addEventListener('click', () => {
          mapInstanceRef.current.flyTo([marker.lat, marker.lng], 18, { duration: 1.5 });
        });
      });
    });

    // Smart Auto-fitting
    if (markers.length > 0) {
      const allCoords = markers.map(m => [m.lat, m.lng]);
      if (userLocation) allCoords.push([userLocation.lat, userLocation.lng]);
      mapInstanceRef.current.flyToBounds(allCoords, { 
        padding: [80, 80],
        duration: 1.5,
        easeLinearity: 0.25
      });
    } else if (userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14);
    }
  }, [markers, userLocation]);

  return (
    <div className={`relative overflow-hidden group/map focus:outline-none ${className}`} tabIndex={0}>
      <div ref={mapContainerRef} className="h-full w-full z-0" />
      
      {/* Real-time Status HUD */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col space-y-3">
        <div className="bg-black/70 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl flex items-center space-x-3 shadow-2xl">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
          <span className="text-[10px] text-white font-black tracking-widest uppercase">Orbital Sync: Active</span>
        </div>
        
        <div className="flex space-x-2">
          <div className="bg-white/5 backdrop-blur-md border border-white/5 px-4 py-2 rounded-2xl flex items-center space-x-3">
            <i className="fas fa-search-plus text-blue-400 text-[10px]"></i>
            <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Zoom: {currentZoom}x</span>
          </div>

          {userLocation && (
            <button 
              onClick={handleRecenter}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-2xl border border-white/10 flex items-center space-x-3 shadow-xl transition-all active:scale-95"
            >
              <i className="fas fa-location-crosshairs text-[10px]"></i>
              <span className="text-[10px] font-black tracking-widest uppercase">Recenter</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Compass */}
      <div className="absolute bottom-10 right-10 z-[1000] opacity-40 group-hover/map:opacity-100 transition-opacity">
        <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-black/60 backdrop-blur-md shadow-2xl">
          <i className="fas fa-compass text-2xl text-white animate-[spin_30s_linear_infinite]"></i>
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-black text-white uppercase tracking-widest">N</span>
        </div>
      </div>

      {/* Keyboard Controls Legend (Visible on Focus) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] opacity-0 group-focus:opacity-60 transition-opacity pointer-events-none">
        <div className="bg-black/80 px-6 py-2 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center space-x-6 border border-white/10">
          <span><i className="fas fa-arrow-right-long mr-2"></i>Pan</span>
          <span><i className="fas fa-plus mr-2"></i>Zoom</span>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
