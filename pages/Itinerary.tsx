
import React, { useState, useEffect } from 'react';
import { generateItinerary } from '../services/geminiService';
import { ItineraryDay } from '../types';
import MapComponent from '../components/MapComponent';

const Itinerary: React.FC = () => {
  const [city, setCity] = useState('');
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<ItineraryDay[] | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => console.warn('GPS restricted')
    );
  }, []);

  const options = ['Heritage', 'Culinary', 'Nature', 'Wellness', 'Spiritual', 'Nightlife', 'Modern'];

  const toggleInterest = (interest: string) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateItinerary(city, days, interests);
      if (result && result.length > 0) {
        setPlan(result);
      } else {
        throw new Error("Empty plan generated");
      }
    } catch (err) {
      console.error('Itinerary Engine Failure:', err);
      setError("The synthesis engine encountered a temporal rift. Please refine your parameters and try again.");
    } finally {
      setLoading(false);
    }
  };

  const markers = plan?.flatMap(day => 
    day.activities.map(act => ({ name: act.activity, lat: act.lat || 0, lng: act.lng || 0, category: `Day ${day.day}` }))
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-32">
      <div className="text-center mb-24">
        <h1 className="text-7xl font-black mb-6 text-white tracking-tighter">Route <span className="text-gradient">Architect.</span></h1>
        <p className="text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Computational logic meets human curiosity. Let Zyro calculate your ideal sequence of experiences.
        </p>
      </div>

      <div className="glass-panel p-16 rounded-[60px] mb-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] -z-10"></div>
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div>
              <label className="block text-[11px] font-black text-slate-500 mb-5 uppercase tracking-[0.4em]">Target Destination</label>
              <div className="relative group">
                <i className="fas fa-location-crosshairs absolute left-6 top-1/2 -translate-y-1/2 text-blue-500"></i>
                <input 
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="E.g. Madurai, Varanasi..."
                  className="w-full bg-white/[0.03] border border-white/5 focus:border-blue-500/50 transition-all pl-16 pr-8 py-6 rounded-3xl text-white outline-none font-black text-xl"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 mb-6 uppercase tracking-[0.4em]">Temporal Range ({days} Days)</label>
              <input 
                type="range"
                min="1"
                max="10"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 mb-6 uppercase tracking-[0.4em]">Experience Vectors</label>
            <div className="flex flex-wrap gap-3">
              {options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleInterest(opt)}
                  className={`px-6 py-3.5 rounded-2xl border font-black text-sm transition-all active:scale-95 ${
                    interests.includes(opt) 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-transparent text-white shadow-xl shadow-blue-900/40' 
                    : 'bg-white/[0.03] border-white/5 text-slate-500 hover:border-slate-500'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 pt-6">
            {error && <p className="text-red-400 font-bold mb-4 text-center">{error}</p>}
            <button 
              type="submit"
              disabled={loading}
              className="w-full btn-premium py-7 rounded-[32px] text-white font-black text-2xl flex items-center justify-center space-x-4 shadow-2xl active:scale-95 disabled:opacity-50"
            >
              {loading ? <i className="fas fa-dna animate-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
              <span>{loading ? 'Synthesizing Roadmap...' : 'Generate Itinerary'}</span>
            </button>
          </div>
        </form>
      </div>

      {plan && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 space-y-20">
            {plan.map((dayPlan) => (
              <div key={dayPlan.day} className="relative pl-12 border-l-2 border-white/5">
                <div className="absolute -left-[11px] top-0 w-5 h-5 bg-blue-600 rounded-full border-4 border-black shadow-[0_0_20px_rgba(37,99,235,0.6)]"></div>
                <h2 className="text-5xl font-black mb-12 text-white tracking-tighter">Cycle {dayPlan.day}</h2>
                <div className="space-y-10">
                  {dayPlan.activities.map((act, idx) => (
                    <div key={idx} className="group glass-panel p-10 rounded-[40px] hover:border-blue-500/20 transition-all">
                      <div className="flex items-center justify-between mb-8">
                        <span className="bg-blue-600/10 text-blue-400 font-black text-[10px] px-5 py-2.5 rounded-xl tracking-widest uppercase border border-blue-500/20">
                          {act.time}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-black text-slate-500">
                          0{idx + 1}
                        </div>
                      </div>
                      <h3 className="text-3xl font-black mb-4 text-white group-hover:text-blue-400 transition-colors leading-tight">{act.activity}</h3>
                      <p className="text-slate-400 text-xl font-medium mb-10 leading-relaxed">{act.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500 font-black tracking-widest uppercase bg-black/40 px-6 py-4 rounded-2xl border border-white/5 w-fit">
                        <i className="fas fa-map-pin text-blue-500"></i>
                        <span>{act.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-7 sticky top-32 h-[calc(100vh-160px)]">
             <div className="glass-panel p-3 rounded-[50px] h-full flex flex-col relative overflow-hidden">
                <MapComponent markers={markers} userLocation={userLocation} className="h-full w-full rounded-[40px]" />
                <div className="absolute top-8 right-8 z-[1000] bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl text-[10px] text-white font-black tracking-widest uppercase">
                  Logistical Visualization
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Itinerary;
