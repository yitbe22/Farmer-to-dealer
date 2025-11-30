
import React, { useState, useEffect, useRef } from 'react';
import { Lock, User, ArrowRight, Sprout, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  
  const usernameRef = useRef<HTMLInputElement>(null);

  // Auto-focus username on mount
  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');
    
    // Simulate network delay for realism (Reduced for better performance)
    setTimeout(() => {
      if (username === 'admin' && password === 'password') {
        onLogin();
      } else {
        setError('Invalid credentials. Try admin / password');
        triggerShake();
        setLoading(false);
      }
    }, 400); // Faster login
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 bg-slate-100 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Abstract Luxury Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-3xl animate-pulse"></div>
      </div>

      <div className={`w-full max-w-md p-8 bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700/50 relative z-10 duration-300 transition-all ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 mb-4 shadow-sm border border-emerald-100 dark:border-emerald-800/30 ring-4 ring-emerald-50/50 dark:ring-emerald-900/10">
            <Sprout className="text-emerald-600 dark:text-emerald-400" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Dealer Portal</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium tracking-wide uppercase">AgriConnect Ethiopia</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">Username</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                <User size={20} />
              </div>
              <input 
                ref={usernameRef}
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                <Lock size={20} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 py-3 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-700/50 pt-6">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">Demo Credentials</p>
          <div className="flex justify-center gap-3 text-xs font-mono text-slate-600 dark:text-slate-300">
            <button 
              onClick={() => {setUsername('admin'); setPassword('password');}}
              className="bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              admin / password
            </button>
          </div>
        </div>
      </div>
      
      {/* Custom Keyframes for Shake Animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default Login;
