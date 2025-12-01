
import React, { useState, useEffect, useRef } from 'react';
import { Lock, User, ArrowRight, Sprout, Eye, EyeOff, Loader2, Store, ArrowLeft, CheckCircle } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface LoginProps {
  onLogin: () => void;
  language?: Language;
}

const Login: React.FC<LoginProps> = ({ onLogin, language = 'en' }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  
  const usernameRef = useRef<HTMLInputElement>(null);
  const regNameRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];

  // Auto-focus logic
  useEffect(() => {
    if (!isRegistering) {
      usernameRef.current?.focus();
    } else {
      regNameRef.current?.focus();
    }
    setError('');
    setSuccessMsg('');
  }, [isRegistering]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError(t.fields_required);
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');
    
    setTimeout(() => {
      // Allow the demo admin OR the newly created user (mock persistence)
      if ((username === 'admin' && password === 'password') || 
          (username === regUsername && password === regPassword && regUsername !== '')) {
        onLogin();
      } else {
        setError(t.invalid_creds);
        triggerShake();
        setLoading(false);
      }
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim() || !storeName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setError(t.fields_required);
      triggerShake();
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
        setLoading(false);
        setSuccessMsg(t.success);
        // Pre-fill login with new credentials
        setUsername(regUsername);
        setPassword(regPassword);
        
        // Switch back to login after short delay
        setTimeout(() => {
            setIsRegistering(false);
            setSuccessMsg('');
        }, 1500);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 bg-slate-100 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Abstract Luxury Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-3xl animate-pulse"></div>
      </div>

      <div className={`w-full max-w-md p-8 bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700/50 relative z-10 duration-300 transition-all ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 mb-4 shadow-sm border border-emerald-100 dark:border-emerald-800/30 ring-4 ring-emerald-50/50 dark:ring-emerald-900/10 transition-transform duration-500 hover:rotate-12">
            <Sprout className="text-emerald-600 dark:text-emerald-400" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t.login_title}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium tracking-wide uppercase">{t.login_subtitle}</p>
        </div>

        {/* Success Message Overlay */}
        {successMsg && (
             <div className="absolute inset-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-3xl animate-in fade-in zoom-in-95">
                 <CheckCircle size={64} className="text-emerald-500 mb-4 animate-bounce" />
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t.success}</h3>
                 <p className="text-slate-500 dark:text-slate-400 mt-2">{t.redirecting}</p>
             </div>
        )}

        {/* LOGIN FORM */}
        {!isRegistering ? (
          <form onSubmit={handleLogin} className="space-y-5 animate-in slide-in-from-left-4 fade-in duration-300">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">{t.username}</label>
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
                  placeholder={language === 'en' ? "Enter your username" : "መጠቀሚያ ስም ያስገቡ"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">{t.password}</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                  <Lock size={20} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium"
                  placeholder={language === 'en' ? "Enter your password" : "የይለፍ ቃል ያስገቡ"}
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
                  <span>{t.signing_in}</span>
                </>
              ) : (
                <>
                  <span>{t.sign_in}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
            
            <div className="pt-4 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {t.dont_have_account}{' '}
                    <button 
                        type="button" 
                        onClick={() => setIsRegistering(true)}
                        className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                        {t.create_account}
                    </button>
                </p>
            </div>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegister} className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
             <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">{t.full_name}</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                        <User size={20} />
                        </div>
                        <input 
                        ref={regNameRef}
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium"
                        placeholder={language === 'en' ? "e.g. Abebe Kebede" : "ምሳሌ: አበበ ከበደ"}
                        />
                    </div>
                 </div>
                 
                 <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">{t.store_name}</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                        <Store size={20} />
                        </div>
                        <input 
                        type="text" 
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium"
                        placeholder={language === 'en' ? "e.g. Green Valley Inputs" : "ምሳሌ: ግሪን ቫሊ ግብዓቶች"}
                        />
                    </div>
                 </div>

                 <div className="space-y-2 col-span-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">{t.username}</label>
                    <input 
                    type="text" 
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium"
                    placeholder="User"
                    />
                 </div>

                 <div className="space-y-2 col-span-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">{t.password}</label>
                    <input 
                    type="password" 
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium"
                    placeholder="Pass"
                    />
                 </div>
             </div>

             {error && (
              <div className="text-red-600 dark:text-red-400 text-xs text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-xl border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : t.create_account}
            </button>

            <div className="pt-2 text-center">
                <button 
                    type="button" 
                    onClick={() => setIsRegistering(false)}
                    className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center gap-1 mx-auto"
                >
                    <ArrowLeft size={16} /> {t.back_login}
                </button>
            </div>
          </form>
        )}
        
        {/* Footer */}
        {!isRegistering && (
            <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-700/50 pt-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">{t.demo_creds}</p>
            <div className="flex justify-center gap-3 text-xs font-mono text-slate-600 dark:text-slate-300">
                <button 
                onClick={() => {setUsername('admin'); setPassword('password');}}
                className="bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                admin / password
                </button>
            </div>
            </div>
        )}
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
