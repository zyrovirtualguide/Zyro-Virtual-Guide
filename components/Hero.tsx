
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/explore?city=${encodeURIComponent(query)}`);
    }
  };

  const trending = ['Tokyo', 'Paris', 'New York', 'Rio de Janeiro', 'Cairo', 'Kyoto'];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-6xl w-full">
        <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-full mb-10">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
          <span className="text-blue-300 font-black text-[10px] tracking-widest uppercase">Global Context Engine v3.0</span>
        </div>
        
        <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.85] text-white">
          Explore <br />
          <span className="text-gradient">The Known World.</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
          The ultimate digital concierge for planetary heritage, global storytelling, and cross-border travel logistics.
        </p>

        <form onSubmit={handleSearch} className="relative max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[36px] shadow-2xl focus-within:border-blue-500/50 transition-all">
            <div className="relative flex-grow">
              <i className="fas fa-globe absolute left-8 top-1/2 -translate-y-1/2 text-blue-500 text-xl"></i>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter any city or coordinate..."
                className="w-full bg-transparent text-white pl-16 pr-8 py-7 rounded-2xl focus:outline-none text-2xl placeholder:text-slate-600 font-bold"
              />
            </div>
            <button 
              type="submit"
              className="btn-premium text-white px-14 py-6 rounded-[28px] flex items-center justify-center space-x-3 font-black text-lg"
            >
              <span>Discover</span>
              <i className="fas fa-satellite"></i>
            </button>
          </div>
        </form>

        <div className="mt-20 flex flex-wrap justify-center items-center gap-6">
          <span className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">Global Hotspots</span>
          {trending.map(city => (
            <button 
              key={city}
              onClick={() => navigate(`/explore?city=${city}`)}
              className="text-slate-400 hover:text-white hover:bg-white/10 transition-all bg-white/[0.03] px-6 py-3 rounded-2xl border border-white/5 font-bold text-sm"
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;
