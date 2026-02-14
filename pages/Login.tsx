import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [isPending, setIsPending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    // Simulate authentication processing with a premium delay
    setTimeout(() => {
      login(email, name || email.split('@')[0]);
      setIsPending(false);
      navigate('/');
    }, 1800);
  };

  const handleGuestLogin = () => {
    setIsPending(true);
    // Simulated guest handshake
    setTimeout(() => {
      login('guest@zyro.io', 'Guest Explorer');
      setIsPending(false);
      navigate('/');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#000000] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)]"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

      <div className="w-full max-w-lg relative z-10 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-[60px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative glass-panel p-10 md:p-16 rounded-[56px] border border-white/10 shadow-[0_0_100px_rgba(59,130,246,0.1)] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          <div className="text-center mb-12">
            <div className="relative w-28 h-28 mx-auto mb-10">
              <div className="absolute inset-0 border-2 border-dashed border-blue-500/30 rounded-full animate-[spin_15s_linear_infinite]"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-transform duration-500 group-hover:scale-110">
                <i className="fas fa-compass text-white text-4xl"></i>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
              {isLogin ? 'Zyro Access' : 'New Identity'}
            </h1>
            <p className="text-slate-500 font-bold text-lg max-w-[280px] mx-auto">
              {isLogin ? 'Enter your credentials to synchronize with the Guide.' : 'Begin your journey across the global landscapes.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">Display Name</label>
                <div className="relative">
                  <i className="fas fa-user absolute left-6 top-1/2 -translate-y-1/2 text-slate-700"></i>
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Arjun Dev"
                    className="w-full bg-white/[0.03] border border-white/5 focus:border-blue-500/50 pl-14 pr-8 py-5 rounded-[24px] font-bold text-white outline-none transition-all placeholder:text-slate-800"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">Email Hash</label>
              <div className="relative">
                <i className="fas fa-at absolute left-6 top-1/2 -translate-y-1/2 text-slate-700"></i>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="explorer@zyro.guide"
                  className="w-full bg-white/[0.03] border border-white/5 focus:border-blue-500/50 pl-14 pr-8 py-5 rounded-[24px] font-bold text-white outline-none transition-all placeholder:text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">Access Key</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-6 top-1/2 -translate-y-1/2 text-slate-700"></i>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/5 focus:border-blue-500/50 pl-14 pr-16 py-5 rounded-[24px] font-bold text-white outline-none transition-all placeholder:text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 hover:text-blue-500 transition-colors focus:outline-none p-2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-lg`}></i>
                </button>
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full btn-premium py-6 rounded-[28px] text-white font-black text-xl flex items-center justify-center space-x-4 active:scale-[0.98] disabled:grayscale shadow-2xl transition-all"
              >
                {isPending ? (
                  <i className="fas fa-circle-notch animate-spin text-2xl"></i>
                ) : (
                  <>
                    <i className="fas fa-shield-halved text-xl"></i>
                    <span>{isLogin ? 'Authenticate' : 'Initialize'}</span>
                  </>
                )}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative flex justify-center text-[10px]"><span className="bg-black/20 px-4 text-slate-600 font-black tracking-[0.4em] uppercase">Quick Entry</span></div>
              </div>

              <button 
                type="button"
                onClick={handleGuestLogin}
                disabled={isPending}
                className="w-full bg-white/[0.03] border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.06] py-5 rounded-[28px] text-slate-400 hover:text-white font-black text-lg flex items-center justify-center space-x-4 active:scale-[0.98] transition-all"
              >
                <i className="fas fa-ghost text-lg"></i>
                <span>Continue as Guest</span>
              </button>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 font-bold text-base">
              {isLogin ? "Need a new link?" : "Already verified?"}{' '}
              <button 
                onClick={() => { setIsLogin(!isLogin); setShowPassword(false); }} 
                className="text-blue-500 hover:text-blue-400 font-black transition-all"
              >
                {isLogin ? 'Apply Now' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="text-[9px] font-black tracking-[0.8em] text-slate-700 uppercase">
          Zyro Intelligence Hub
        </div>
      </div>
    </div>
  );
};

export default Login;