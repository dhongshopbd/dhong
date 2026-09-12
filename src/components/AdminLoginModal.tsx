import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Lock, ArrowLeft, ShieldAlert } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { loginAdmin, setCurrentView } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const success = loginAdmin(username, password);
      setIsLoading(false);
      if (!success) {
        setErrorMsg('Invalid administrative credentials. Please verify username & password.');
      }
    }, 400);
  };

  const handleReturnToStore = () => {
    setCurrentView('store');
    window.history.pushState(null, '', '/');
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800/90 rounded-2xl p-8 shadow-2xl z-10 text-neutral-100">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="https://i.ibb.co.com/zVVGNSpd/bg.png"
              alt="Dhong Logo"
              className="h-16 w-auto object-contain brightness-110 drop-shadow-md"
            />
          </div>
          <h1 className="font-brand text-2xl font-bold tracking-wider text-neutral-100 mb-1">
            DHONG ADMIN PORTAL
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-red-500 font-semibold">
            Administrative Access • ঢং
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-medium">
              Admin Username
            </label>
            <input
              id="admin-username-input"
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1.5 font-medium">
              Admin Password
            </label>
            <input
              id="admin-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-all"
            />
          </div>

          <div className="pt-2">
            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#e32117] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-neutral-800 text-center">
          <button
            onClick={handleReturnToStore}
            className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-red-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </button>
        </div>

      </div>
    </div>
  );
};
