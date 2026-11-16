import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Workout from './pages/Workout';
import DietTracker from './pages/DietTracker';
import GeneralFeed from './pages/GeneralFeed';
import TransformationStudio from './pages/TransformationStudio';
import Measurements from './pages/Measurements';
import { authAPI } from './api/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('recomp_token');
    if (token) {
      authAPI.checkSession()
        .then((res) => {
          if (res.data.success) {
            setIsAuthenticated(true);
            setProfile(res.data.user?.profile);
          } else {
            localStorage.removeItem('recomp_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('recomp_token');
        })
        .finally(() => {
          setCheckingAuth(false);
        });
    } else {
      setCheckingAuth(false);
    }
  }, []);

  // Smooth scroll to top when changing tabs to prevent jarring jumps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  const handleUnlock = (userProfile) => {
    setIsAuthenticated(true);
    setProfile(userProfile);
  };

  const handleLock = () => {
    localStorage.removeItem('recomp_token');
    setIsAuthenticated(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-lime-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          <span>INITIALIZING RECOMP 90 FITNESS OS...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans selection:bg-lime-400 selection:text-black">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLock={handleLock}
        dayNumber={1}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 lg:pb-12 min-h-[calc(100vh-4.5rem)] overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
            transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
            className="w-full"
          >
            {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
            {activeTab === 'workout' && <Workout />}
            {activeTab === 'diet' && <DietTracker />}
            {activeTab === 'feed' && <GeneralFeed />}
            {activeTab === 'transform' && <TransformationStudio />}
            {activeTab === 'measurements' && <Measurements />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-zinc-800/80 py-4 bg-[#09090b] text-center text-[11px] text-zinc-500 hidden md:block">
        ⚡ 90-Day Body Recomposition System • Male 21y • Baseline: 80 kg • PG/Mess Friendly Edition
      </footer>
    </div>
  );
}
