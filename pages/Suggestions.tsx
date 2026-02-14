
import React, { useState } from 'react';
import { getTravelSuggestions } from '../services/geminiService';

interface ExtendedSuggestion {
  location: string;
  region: string;
  why: string;
  highlight: string;
  bestTime: string;
  logistics: string;
  recommendedDays: string;
  baseOfOperations: string;
}

const Suggestions: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ExtendedSuggestion[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const personas = [
    { id: 'epicurean', name: 'The Epicurean', icon: 'fa-utensils', color: 'from-orange-500 to-red-600', mood: 'A focused journey through authentic regional flavors and ancient culinary arts.' },
    { id: 'ascetic', name: 'The Ascetic', icon: 'fa-om', color: 'from-indigo-600 to-purple-700', mood: 'Spiritual depth, silent temples, and timeless rituals in sacred geographies.' },
    { id: 'adrenaline', name: 'The Adrenaline Seeker', icon: 'fa-mountain', color: 'from-emerald-600 to-teal-800', mood: 'Rugged terrain, high-altitude treks, and heart-racing raw nature.' },
    { id: 'sovereign', name: 'The Sovereign', icon: 'fa-crown', color: 'from-yellow-500 to-orange-700', mood: 'Palatial luxury, royal history, and the gold-standard of Indian hospitality.' },
    { id: 'bohemian', name: 'The Bohemian', icon: 'fa-paint-brush', color: 'from-pink-500 to-rose-700', mood: 'Artistic enclaves, hidden cafes, and independent cultural movements.' },
  ];

  const handleFetch = async (persona: string) => {
    setSelectedPersona(persona);
    setLoading(true);
    setError(null);
    try {
      const data = await getTravelSuggestions(persona);
      if (data && data.length > 0) {
        setResults(data);
      } else {
        throw new Error("No suggestions returned");
      }
    } catch (err) {
      console.error("Suggestion Error:", err);
      setError("The persona engine is currently recalibrating. Please try again soon.");
    } finally {
      setLoading(false);
    }
  };

  const getGoogleMapsUrl = (targetName: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetName)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-32">
      <div className="text-center mb-20">
        <h1 className="text-7xl font-black mb-6 text-white tracking-tighter">Travel <span className="text-gradient">Personas.</span></h1>
        <p className="text-2xl text-slate-500 font-medium max-w-2xl mx-auto">
          Discard the generic. Choose a mood and let Zyro reveal destinations that resonate with your specific frequency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-24">
        {personas.map((p) => (
          <button
            key={p.id}
            onClick={() => handleFetch(p.name)}
            className={`group relative glass-panel p-8 rounded-[40px] text-center transition-all duration-500 border-2 ${
              selectedPersona === p.name ? 'border-blue-500 bg-white/5' : 'border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${p.color} mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
              <i className={`fas ${p.icon} text-white text-2xl`}></i>
            </div>
            <h3 className="text-xl font-black text-white mb-4">{p.name}</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              {p.mood}
            </p>
          </button>
        ))}
      </div>

      {error && (
        <div className="text-center py-10">
          <p className="text-red-400 font-bold mb-4">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-t-2 border-blue-500 rounded-full animate-spin mb-8"></div>
          <p className="text-slate-500 font-black tracking-[0.4em] uppercase text-xs">Synthesizing Curated Map...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          {results.map((item, idx) => (
            <div key={idx} className="glass-panel p-12 rounded-[56px] relative overflow-hidden group hover:border-blue-500/20 transition-all flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] -z-10 group-hover:bg-blue-500/10 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-10">
                <div>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2 block">{item.region}</span>
                  <h2 className="text-4xl font-black text-white tracking-tighter">{item.location}</h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-white/5 px-4 py-1.5 rounded-full border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Peak: {item.bestTime}
                  </div>
                  <div className="bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <i className="fas fa-hourglass-half text-[8px]"></i>
                    {item.recommendedDays}
                  </div>
                </div>
              </div>

              <div className="space-y-8 flex-grow">
                <div className="p-8 bg-black/40 rounded-[32px] border border-white/5">
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Contextual Relevance</h4>
                  <p className="text-slate-300 font-medium text-lg leading-relaxed">{item.why}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Key Highlight</h4>
                    <p className="text-white font-bold">{item.highlight}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Logistical Lock</h4>
                    <p className="text-white font-bold">{item.logistics}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center">
                    <i className="fas fa-hotel mr-3"></i> Base of Operations
                  </h4>
                  <a 
                    href={getGoogleMapsUrl(`${item.baseOfOperations} ${item.location}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-white/5 hover:bg-indigo-500/10 p-5 rounded-[28px] border border-white/5 hover:border-indigo-500/30 transition-all group/asset"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                        <i className="fas fa-bed text-indigo-500"></i>
                      </div>
                      <span className="text-slate-300 font-bold group-hover/asset:text-white transition-colors">{item.baseOfOperations}</span>
                    </div>
                    <i className="fas fa-location-arrow text-xs text-slate-700 group-hover/asset:text-indigo-400 transition-colors"></i>
                  </a>
                </div>
              </div>

              <a 
                href={getGoogleMapsUrl(item.location)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-12 w-full py-6 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-widest uppercase shadow-xl transition-all text-center flex items-center justify-center gap-4"
              >
                Plan Discovery <i className="fas fa-satellite text-xs"></i>
              </a>
            </div>
          ))}
        </div>
      ) : selectedPersona ? (
        <div className="text-center py-20 text-slate-700 font-black tracking-widest uppercase text-sm">
          Select a persona above to begin synthesis.
        </div>
      ) : null}
    </div>
  );
};

export default Suggestions;
