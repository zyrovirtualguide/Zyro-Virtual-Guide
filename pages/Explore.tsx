import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPlaceRecommendations, getMapMarkers } from '../services/geminiService.ts';
import MapComponent from '../components/MapComponent.tsx';
import { Place } from '../types.ts';

interface DossierEntry {
  placeName: string;
  intelLevel: string;
  significance: string;
  logistics: string;
  recommendedDays: string;
  dayByDayStrategy: string[];
  hospitality: {
    stays: string[];
    dining: string[];
  };
  operativesNotes: string;
}

const Explore: React.FC = () => {
  const [searchParams] = useSearchParams();
  const city = searchParams.get('city') || 'Tokyo';
  const [loading, setLoading] = useState(true);
  const [dossiers, setDossiers] = useState<DossierEntry[]>([]);
  const [markers, setMarkers] = useState<Place[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const systemMetadata = useMemo(() => ({
    timestamp: new Date().toISOString().slice(11, 19),
    packetID: 'REF-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
    encryption: 'RSA-8192-BIT'
  }), [city]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => console.warn('GPS Signal Blocked')
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [mapData, intelData] = await Promise.all([
          getMapMarkers(city),
          getPlaceRecommendations(city)
        ]);
        setMarkers(mapData);
        setDossiers(intelData);
      } catch (err) {
        console.error('Data Uplink Error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [city]);

  const getGoogleMapsUrl = (targetName: string) => {
    const query = `${targetName} ${city}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-32">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-blue-600/50"></div>
          <h1 className="text-6xl md:text-8xl font-black mb-4 text-white tracking-tighter uppercase">
            Sector <span className="text-gradient">{city}</span>
          </h1>
          <p className="text-sm font-mono text-slate-500 uppercase tracking-[0.5em]">
            Reconnaissance Level: Global Priority
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2 font-mono text-[10px] text-slate-400 uppercase">
          <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Uplink Secure: {systemMetadata.encryption}</span>
          </div>
          <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            <i className="fas fa-clock text-blue-500"></i>
            <span>Local Sync: {systemMetadata.timestamp}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12">
          <div className="glass-panel p-2 rounded-[48px] h-[500px] relative overflow-hidden group border border-white/10 shadow-2xl">
            {loading && markers.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center bg-[#050505] rounded-[42px]">
                <i className="fas fa-satellite animate-bounce text-4xl text-blue-500 mb-6"></i>
                <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">Scanning Terrain Grids...</p>
              </div>
            ) : (
              <MapComponent 
                markers={markers} 
                userLocation={userLocation}
                className="h-full w-full rounded-[42px]"
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-12">
          <div className="flex items-center space-x-6 mb-4">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight font-mono">Tactical Dossiers</h2>
            <div className="h-px flex-grow bg-gradient-to-r from-blue-500/50 to-transparent"></div>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-white/5 rounded-[40px] animate-pulse"></div>
              ))}
            </div>
          ) : dossiers.length > 0 ? (
            dossiers.map((packet, idx) => (
              <div key={idx} className="relative glass-panel corner-cut overflow-hidden border border-white/5 hover:border-blue-500/20 transition-all duration-500 group/packet">
                <div className="scanline"></div>
                
                <div className="px-10 py-8 bg-white/[0.02] border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center space-x-6">
                    <div className="w-12 h-12 rounded-xl bg-black border border-blue-500/20 flex items-center justify-center text-blue-400 font-mono font-bold">
                      0{idx + 1}
                    </div>
                    <div>
                      <a 
                        href={getGoogleMapsUrl(packet.placeName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl font-black text-white uppercase tracking-tight hover:text-blue-400 transition-colors flex items-center group/title"
                      >
                        {packet.placeName}
                        <i className="fas fa-arrow-up-right-from-square text-[10px] ml-3 opacity-0 group-hover/title:opacity-100 transition-all"></i>
                      </a>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                          packet.intelLevel.includes('TOP SECRET') ? 'border-red-500/50 text-red-400 bg-red-500/5' : 'border-blue-500/30 text-blue-400 bg-blue-500/5'
                        } uppercase font-mono tracking-widest`}>
                          {packet.intelLevel}
                        </span>
                        <div className="flex items-center space-x-2 text-[9px] font-mono text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-widest">
                          <i className="fas fa-hourglass-half text-[8px]"></i>
                          <span>Duration: {packet.recommendedDays}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                     <i className="fas fa-fingerprint text-slate-700 text-2xl group-hover/packet:text-blue-500/50 transition-colors"></i>
                  </div>
                </div>

                <div className="p-10 space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono text-blue-500/50 uppercase tracking-[0.3em] font-bold flex items-center">
                        <i className="fas fa-info-circle mr-2"></i> Strategic Significance
                      </label>
                      <p className="text-slate-300 font-medium leading-relaxed">{packet.significance}</p>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-[0.3em] font-bold flex items-center">
                        <i className="fas fa-map-marked-alt mr-2"></i> Logistical Parameters
                      </label>
                      <p className="text-slate-300 font-medium leading-relaxed">{packet.logistics}</p>
                    </div>
                  </div>

                  {/* Expansion Strategy: Day-by-Day */}
                  <div className="p-8 bg-blue-500/5 rounded-[32px] border border-blue-500/10 relative overflow-hidden group/strategy">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/strategy:opacity-20 transition-opacity">
                      <i className="fas fa-chess text-4xl"></i>
                    </div>
                    <label className="text-[10px] font-mono text-blue-400 uppercase tracking-[0.3em] font-bold mb-6 block flex items-center">
                      <i className="fas fa-route mr-3 text-blue-500"></i> 
                      Phase Planning (Strategy Breakdown)
                    </label>
                    <div className="space-y-4">
                      {packet.dayByDayStrategy.map((step, sIdx) => (
                        <div key={sIdx} className="relative pl-8 pb-4 last:pb-0">
                          {/* Tactical Timeline UI */}
                          <div className="absolute left-0 top-0 bottom-0 w-px bg-blue-500/20"></div>
                          <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-blue-500 border border-white/20 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                          
                          <div className="flex flex-col">
                            <span className="text-[9px] font-mono font-black text-blue-500/60 uppercase tracking-widest mb-1">
                              Phase {sIdx + 1}
                            </span>
                            <p className="text-slate-300 text-sm font-medium leading-relaxed">{step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-mono text-indigo-400 uppercase tracking-[0.3em] font-bold flex items-center">
                        <i className="fas fa-hotel mr-2"></i> Base of Operations
                      </label>
                      <div className="space-y-2">
                        {packet.hospitality.stays.map((stay, sIdx) => (
                          <a 
                            key={sIdx} 
                            href={getGoogleMapsUrl(stay)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between bg-white/5 hover:bg-indigo-500/10 p-4 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group/asset"
                          >
                            <div className="flex items-center space-x-3">
                              <i className="fas fa-bed text-[10px] text-indigo-500"></i>
                              <span className="text-slate-400 text-sm font-bold group-hover/asset:text-white transition-colors">{stay}</span>
                            </div>
                            <i className="fas fa-location-arrow text-[10px] text-slate-700 group-hover/asset:text-indigo-400 transition-colors"></i>
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-mono text-orange-400 uppercase tracking-[0.3em] font-bold flex items-center">
                        <i className="fas fa-utensils mr-2"></i> Refueling Stations
                      </label>
                      <div className="space-y-2">
                        {packet.hospitality.dining.map((eat, eIdx) => (
                          <a 
                            key={eIdx} 
                            href={getGoogleMapsUrl(eat)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between bg-white/5 hover:bg-orange-500/10 p-4 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-all group/asset"
                          >
                            <div className="flex items-center space-x-3">
                              <i className="fas fa-fire-burner text-[10px] text-orange-500"></i>
                              <span className="text-slate-400 text-sm font-bold group-hover/asset:text-white transition-colors">{eat}</span>
                            </div>
                            <i className="fas fa-location-arrow text-[10px] text-slate-700 group-hover/asset:text-orange-400 transition-colors"></i>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-black/40 rounded-3xl border border-white/5 relative group/notes overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/notes:opacity-40 transition-opacity">
                      <i className="fas fa-user-secret text-2xl"></i>
                    </div>
                    <label className="text-[10px] font-mono text-orange-500/50 uppercase tracking-[0.3em] font-bold mb-4 block">Operative's Field Notes</label>
                    <p className="text-slate-400 font-mono text-sm leading-relaxed italic">
                      "{packet.operativesNotes}"
                    </p>
                  </div>
                </div>

                <div className="px-10 py-3 bg-black/60 border-t border-white/5 flex justify-between items-center text-[8px] font-mono text-slate-600 uppercase tracking-widest">
                  <span>Packet ID: {systemMetadata.packetID}-0{idx+1}</span>
                  <span>Decryption State: Complete</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-[48px] border border-dashed border-white/10">
              <p className="text-slate-500 font-mono uppercase tracking-widest">No intelligence found for this sector.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="glass-panel p-10 rounded-[40px] sticky top-32 border border-white/10 space-y-12">
            <div>
              <h3 className="text-[11px] font-black text-white mb-8 tracking-[0.3em] uppercase flex items-center font-mono">
                <i className="fas fa-crosshairs text-blue-500 mr-4"></i>
                Sector Waypoints
              </h3>
              <div className="space-y-3">
                {loading ? [1,2,3,4].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse"></div>) : 
                  markers.map((place, idx) => (
                    <a 
                      key={idx} 
                      href={getGoogleMapsUrl(place.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer block"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="font-mono text-[10px] text-slate-600">{String(idx+1).padStart(2,'0')}</span>
                        <div className="overflow-hidden flex-grow">
                          <h4 className="font-bold text-white text-sm truncate group-hover:text-blue-400 transition-colors">{place.name}</h4>
                          <span className="text-[8px] text-slate-500 font-mono uppercase tracking-tighter">{place.category}</span>
                        </div>
                        <i className="fas fa-map text-[10px] text-slate-700 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"></i>
                      </div>
                    </a>
                  ))
                }
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <div className="p-6 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-3xl border border-blue-500/20">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Signal Status</h4>
                <div className="space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-[9px] text-slate-500 font-mono uppercase">Satellite Lock</span>
                     <span className="text-[9px] text-emerald-500 font-mono">100%</span>
                   </div>
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[100%]"></div>
                   </div>
                   <div className="flex justify-between items-center pt-2">
                     <span className="text-[9px] text-slate-500 font-mono uppercase">Neural Stream</span>
                     <span className="text-[9px] text-blue-500 font-mono animate-pulse">OPTIMIZED</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;