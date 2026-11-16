import React, { useState } from 'react';
import { Lock, Zap, ArrowRight, ShieldCheck, Dumbbell } from 'lucide-react';
import { authAPI } from '../api/api';

export default function Login({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter master password');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await authAPI.unlock(password);
      if (res.data.success) {
        localStorage.setItem('recomp_token', res.data.token);
        onUnlock(res.data.profile);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect password. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#131316] border border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-lime-500/10 border border-lime-500/30 rounded-2xl flex items-center justify-center mb-4 text-lime-400 glow-lime-sm">
            <Zap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            RECOMP <span className="text-lime-400">90</span>
          </h1>
          <p className="text-xs uppercase tracking-widest text-zinc-400 mt-1">
            Personal Fitness OS & Master Tracker
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-[11px] text-zinc-300">
            <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
            <span>Private & Encrypted Personal Vault</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Master Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your master password..."
                autoFocus
                className="w-full bg-[#18181b] border border-zinc-700 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition text-sm font-medium"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-4" />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5">
              Enter authorized password to decrypt session
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-red-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-lime-400 hover:bg-lime-300 text-black font-semibold rounded-xl flex items-center justify-center gap-2 transition duration-200 glow-lime-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="text-sm">Authenticating...</span>
            ) : (
              <>
                <span className="text-sm">Unlock Fitness OS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-500 flex items-center justify-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5 text-lime-400" />
            <span>90-Day Transformation Challenge • 13 Nov 2026 to 10 Feb 2027</span>
          </p>
        </div>
      </div>
    </div>
  );
}
