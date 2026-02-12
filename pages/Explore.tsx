
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPlaceRecommendations, getMapMarkers } from '../services/geminiService';
import MapComponent from '../components/MapComponent';
import { Place } from '../types';

const Explore: React.FC = () => {
  const [searchParams] = useSearchParams();
  const city = searchParams.get('city') || 'Chennai';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ text: string; sources: any[] } | null>(null);
  const [markers, setMarkers] = useState<Place[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => console.warn('GPS signal blocked')
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Sequential fetching to avoid gRPC/Proxy 500 errors from parallel requests
        const mapData = await getMapMarkers(city);
        setMarkers(mapData);
        
        const recommendations = await getPlaceRecommendations(city, userLocation?.lat, userLocation?.lng);
        setData(recommendations);
      } catch (error: any) {
        console.error('Intelligence Core Error:', error);
        setError("The exploration engine is currently stabilizing. Please try again in a moment.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [city, userLocation]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
        <div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-white tracking-tighter">
            Discover <span className="text-gradient">{city}</span>
          </h1>
          <p className="text-2xl text-slate-500 font-medium max-w-2xl leading-relaxed">
            Uncovering regional heritage and local narratives using multimodal intelligence.
          </p>
        </div>
        <div className="flex items-center space-x-4 bg-white/[0.03] border border-white/5 px-8 py-4 rounded-3xl backdrop-blur-xl">
          <div className={`w-3 h-3 rounded-full ${userLocation ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-orange-500 animate-pulse'}`}></div>
          <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
            {userLocation ? 'Satellite Lock Secured' : 'Synchronizing GPS...'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-12 p-8 bg-red-500/10 border border-red-500/20 rounded-[32px] text-red-400 font-bold flex items-center space-x-4">
          <i className="fas fa-triangle-exclamation text-2xl"></i>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12">
          <div className="glass-panel p-3 rounded-[48px] h-[650px] relative overflow-hidden group">
            <div className="absolute top-10 left-10 z-[1000] flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl text-[10px] text-white font-black uppercase tracking-[0.2em] flex items-center space-x-3">
                <i className="fas fa-radar text-blue-400"></i>
                <span>Contextual Mapping Layer</span>
              </div>
            </div>
            {loading && markers.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center bg-black rounded-[40px]">
                <div className="w-20 h-20 border-t-4 border-blue-500 rounded-full animate-spin mb-8"></div>
                <p className="text-slate-500 font-black tracking-widest uppercase text-xs">Decrypting Terrain Markers...</p>
              </div>
            ) : (
              <MapComponent 
                markers={markers} 
                userLocation={userLocation}
                zoom={13}
                className="h-full w-full rounded-[40px]"
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="glass-panel p-16 rounded-[48px]">
            <div className="flex items-center space-x-6 mb-12">
              <div className="w-16 h-16 rounded-3xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                 <i className="fas fa-feather-pointed text-blue-400 text-2xl"></i>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tight">Intelligence Briefing</h2>
            </div>
            {loading ? (
              <div className="space-y-6">
                <div className="h-6 bg-white/5 rounded-full w-full animate-pulse"></div>
                <div className="h-6 bg-white/5 rounded-full w-5/6 animate-pulse"></div>
                <div className="h-6 bg-white/5 rounded-full w-4/6 animate-pulse"></div>
              </div>
            ) : (
              <div className="whitespace-pre-line text-slate-300 leading-relaxed text-2xl font-medium prose prose-invert max-w-none">
                {data?.text || "Exploration briefing not available for this sector."}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="glass-panel p-12 rounded-[48px] sticky top-32">
            <h3 className="text-xl font-black text-white mb-10 tracking-widest uppercase flex items-center">
              <i className="fas fa-diamond text-blue-500 mr-4 text-xs"></i>
              Waypoints
            </h3>
            
            <div className="space-y-4">
              {loading && markers.length === 0 ? (
                [1,2,3,4,5].map(i => <div key={i} className="h-24 bg-white/5 rounded-[28px] animate-pulse"></div>)
              ) : (
                markers.map((place, idx) => (
                  <div key={idx} className="group bg-white/5 hover:bg-white/10 p-6 rounded-[32px] border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer">
                    <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl group-hover:scale-105 transition-transform">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-black text-white group-hover:text-blue-400 transition-colors">{place.name}</h4>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{place.category}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {!loading && markers.length === 0 && (
                <p className="text-slate-600 font-bold text-center py-10">No specific waypoints identified.</p>
              )}
            </div>

            {!loading && data?.sources && data.sources.length > 0 && (
              <div className="mt-16 pt-10 border-t border-white/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Verified Sources</h3>
                <div className="space-y-3">
                  {data.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-black/40 border border-white/5 p-5 rounded-[24px] hover:border-blue-500 transition-all group"
                    >
                      <span className="text-slate-400 group-hover:text-white font-bold truncate pr-4 text-sm">{source.title || 'Navigation Data'}</span>
                      <i className="fas fa-arrow-up-right-from-square text-[10px] text-slate-700 group-hover:text-blue-400"></i>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
