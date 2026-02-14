import React from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import Navbar from './components/Navbar.tsx';
import Hero from './components/Hero.tsx';
import Explore from './pages/Explore.tsx';
import Suggestions from './pages/Suggestions.tsx';
import Itinerary from './pages/Itinerary.tsx';
import LiveGuide from './components/LiveGuide.tsx';
import Login from './pages/Login.tsx';

const Footer: React.FC = () => (
  <footer className="border-t border-white/5 pb-24 pt-40 px-12 bg-black">
    <div className="max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-24 mb-40">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center space-x-4 mb-10">
            <div className="w-14 h-14 logo-sphere rounded-2xl flex items-center justify-center shadow-2xl">
              <i className="fas fa-globe text-white text-2xl relative z-10"></i>
            </div>
            <span className="text-4xl font-black text-white tracking-tighter">ZYRO <span className="text-blue-600">WORLD</span></span>
          </div>
          <p className="text-slate-500 text-2xl font-medium max-w-md leading-relaxed">Synthesizing global planetary intelligence with hyper-local cultural depth. Your world concierge.</p>
        </div>
        <div>
          <h4 className="font-black text-white mb-10 uppercase text-xs tracking-[0.4em]">Services</h4>
          <ul className="space-y-7 text-slate-500 font-bold text-lg">
            <li><a href="#" className="hover:text-blue-500 transition-colors">Satellite Mapping</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Culinary Intelligence</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Global Transit AI</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Safety Protocols</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black text-white mb-10 uppercase text-xs tracking-[0.4em]">Company</h4>
          <ul className="space-y-7 text-slate-500 font-bold text-lg">
            <li><a href="#" className="hover:text-blue-500 transition-colors">Developer Core</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">AI Safety</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Global Network</a></li>
            <li><a href="#" className="hover:text-blue-500 transition-colors">Support Hub</a></li>
          </ul>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center text-slate-700 text-sm pt-14 border-t border-white/5">
        <div className="flex space-x-12 mb-10 md:mb-0">
          <p>&copy; 2024 ZYRO GLOBAL GUIDE. ALL RIGHTS RESERVED.</p>
          <p className="font-black text-slate-800">CRAFTED FOR EARTH EXPLORERS</p>
        </div>
        <div className="flex space-x-12 text-2xl">
          <a href="#" className="hover:text-white transition-all"><i className="fab fa-instagram"></i></a>
          <a href="#" className="hover:text-white transition-all"><i className="fab fa-twitter"></i></a>
          <a href="#" className="hover:text-white transition-all"><i className="fab fa-discord"></i></a>
        </div>
      </div>
    </div>
  </footer>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  const featuredRegions = [
    { name: 'Kyoto, Japan', desc: 'Serene Zen gardens, traditional tea ceremonies, and neon-lit streetscapes.', icon: 'fa-torii-gate', color: 'from-red-600 via-rose-600 to-orange-700', link: '/explore?city=Kyoto' },
    { name: 'Tuscany, Italy', desc: 'Rolling vineyards, Renaissance architecture, and the pinnacle of culinary art.', icon: 'fa-wine-glass', color: 'from-emerald-500 via-teal-600 to-blue-700', link: '/explore?city=Tuscany' },
    { name: 'Machu Picchu, Peru', desc: 'Mystical Incan ruins perched high in the Andes under silver celestial skies.', icon: 'fa-mountain-sun', color: 'from-yellow-500 via-orange-600 to-amber-700', link: '/explore?city=Machu%20Picchu' }
  ];

  return (
    <>
      <Hero />
      <section className="py-40 px-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20">
          <div className="max-w-2xl">
            <h2 className="text-6xl font-black mb-8 tracking-tighter text-white leading-none">The Future of <br/><span className="text-gradient">World Travel.</span></h2>
            <p className="text-2xl text-slate-500 font-medium">Unlocking the planet's vast cultural heritage through the lens of multi-agent orbital intelligence.</p>
          </div>
          <div className="flex space-x-4 mt-10 md:mt-0">
            <button 
              onClick={() => navigate('/suggestions')}
              className="px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-700 transition-all font-black text-white flex items-center group shadow-xl"
            >
              World Personas <i className="fas fa-earth-americas ml-3 opacity-60"></i>
            </button>
            <button 
              onClick={() => navigate('/explore')}
              className="px-10 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all font-black text-blue-500 flex items-center group"
            >
              Orbital Live Map <i className="fas fa-satellite-dish ml-3 group-hover:rotate-45 transition-transform"></i>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-56">
          {featuredRegions.map((region, i) => (
            <div 
              key={i} 
              onClick={() => navigate(region.link)}
              className="group cursor-pointer bg-white/[0.02] border border-white/5 rounded-[48px] p-12 hover:border-white/20 transition-all relative overflow-hidden flex flex-col h-full hover:bg-white/[0.04]"
            >
              <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${region.color} opacity-0 group-hover:opacity-[0.08] transition-opacity blur-[100px]`}></div>
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${region.color} flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 transition-transform`}>
                <i className={`fas ${region.icon} text-white text-4xl`}></i>
              </div>
              <h3 className="text-4xl font-black mb-6 text-white tracking-tight">{region.name}</h3>
              <p className="text-slate-500 text-xl leading-relaxed mb-10 flex-grow font-medium">{region.desc}</p>
              <div className="inline-flex items-center text-white font-black group-hover:translate-x-3 transition-transform text-lg">
                Enter Destination Core <i className="fas fa-chevron-right ml-4 text-xs opacity-40"></i>
              </div>
            </div>
          ))}
        </div>

        <div className="relative rounded-[80px] overflow-hidden bg-white/[0.01] border border-white/5 p-24 text-center">
           <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_70%)]"></div>
           <div className="max-w-4xl mx-auto">
             <div className="inline-flex items-center space-x-3 bg-blue-500/10 px-5 py-2 rounded-full mb-10 border border-blue-500/20 text-blue-400 font-black text-xs tracking-widest uppercase">
               <i className="fas fa-sparkles"></i>
               <span>Advanced Neural Voice Link</span>
             </div>
             <h2 className="text-6xl md:text-8xl font-black mb-10 text-white tracking-tighter">Planetary <span className="text-gradient">Assistant.</span></h2>
             <p className="text-2xl text-slate-500 mb-20 font-medium leading-relaxed">A zero-latency voice conversation engine trained on the collective history and logistics of our planet.</p>
             <div className="flex justify-center scale-110 md:scale-125">
                <LiveGuide />
             </div>
           </div>
        </div>
      </section>
    </>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (user && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {user && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/suggestions" element={<Suggestions />} />
          <Route path="/itinerary" element={<Itinerary />} />
          <Route path="/guide" element={<div className="max-w-4xl mx-auto py-32 px-8"><LiveGuide /></div>} />
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
      </main>
      {user && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;