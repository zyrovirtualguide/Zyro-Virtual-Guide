
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path 
    ? 'text-white bg-white/10 px-5 py-2.5 rounded-2xl font-bold shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]' 
    : 'text-slate-500 hover:text-white transition-all px-5 py-2.5 rounded-2xl font-bold';

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-4 ${scrolled ? 'mt-0' : 'mt-4'}`}>
      <nav className={`max-w-7xl mx-auto flex justify-between items-center px-8 py-4 rounded-[32px] transition-all duration-500 border border-white/5 ${scrolled ? 'bg-black/80 backdrop-blur-2xl shadow-2xl scale-[1.02]' : 'bg-transparent'}`}>
        <Link to="/" className="flex items-center space-x-4 group">
          <div className="w-12 h-12 logo-sphere rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
            <i className="fas fa-compass text-white text-xl"></i>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-black tracking-tighter text-white">ZYRO</span>
            <span className="text-[9px] font-black tracking-[0.4em] text-blue-500 uppercase ml-1">Virtual Guide</span>
          </div>
        </Link>
        
        <div className="hidden lg:flex items-center space-x-2 bg-white/5 rounded-3xl p-1.5 border border-white/5">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/explore" className={isActive('/explore')}>Explore</Link>
          <Link to="/suggestions" className={isActive('/suggestions')}>Personas</Link>
          <Link to="/itinerary" className={isActive('/itinerary')}>Itinerary</Link>
          <Link to="/guide" className={isActive('/guide')}>Voice Assistant</Link>
        </div>

        <div className="flex items-center space-x-6">
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 bg-white/5 hover:bg-white/10 p-1.5 pr-5 rounded-full border border-white/5 transition-all"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-500/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-white hidden sm:block">{user.name}</span>
                <i className={`fas fa-chevron-down text-[10px] text-slate-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}></i>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-4 w-60 glass-panel rounded-[24px] p-2 animate-in fade-in slide-in-from-top-4">
                  <div className="p-4 border-b border-white/5 mb-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Explorer Access</p>
                    <p className="text-sm font-bold text-white truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => { logout(); setShowProfileMenu(false); navigate('/'); }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-bold transition-all"
                  >
                    <i className="fas fa-power-off"></i>
                    <span>Terminate Session</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-premium px-8 py-3 rounded-2xl text-white font-black text-sm active:scale-95">
              Launch Guide
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
