import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  Camera,
  Layers,
  Ruler,
  FileSpreadsheet,
  Lock,
  Zap
} from 'lucide-react';
import { excelAPI } from '../api/api';

export default function Navbar({ activeTab, setActiveTab, onLock, dayNumber = 1 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard },
    { id: 'workout', label: 'Daily Workout', shortLabel: 'Workout', icon: Dumbbell },
    { id: 'diet', label: 'Diet & Macros', shortLabel: 'Diet', icon: UtensilsCrossed },
    { id: 'feed', label: 'Photo Feed', shortLabel: 'Feed', icon: Camera, badge: 'New' },
    { id: 'transform', label: 'Transformation', shortLabel: 'Transform', icon: Layers },
    { id: 'measurements', label: 'Measurements', shortLabel: 'Metrics', icon: Ruler }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <>
      {/* TOP NAVBAR (STICKY GLASSMORPHIC - STREAMLINED FOR APP EXPERIENCE) */}
      <header className="sticky top-0 z-40 bg-[#09090c]/90 backdrop-blur-xl border-b border-white/[0.08] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand Logo & Day Badge */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => handleTabClick('dashboard')}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-lime-400 to-lime-500 text-black flex items-center justify-center font-black shadow-[0_0_16px_rgba(163,230,53,0.35)] group-hover:scale-105 transition-transform duration-200">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
              </div>
              <div className="flex flex-col">
                <span className="font-black tracking-tight text-white text-sm sm:text-base leading-none">
                  RECOMP <span className="text-lime-400">90</span>
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase font-mono tracking-widest text-zinc-400 mt-0.5">
                  Fitness OS
                </span>
              </div>
            </div>

            {/* Day Counter Pill */}
            <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-[10px] sm:text-[11px] font-bold font-mono tracking-wider whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              <span>DAY {String(dayNumber).padStart(2, '0')}<span className="hidden sm:inline"> / 90</span></span>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs with Smooth Gliding Indicator (lg+ screens) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#131318]/90 border border-white/[0.08] p-1 rounded-2xl shadow-inner shadow-black/50 relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors duration-200 cursor-pointer z-10 ${
                    isActive
                      ? 'text-black font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Gliding Active Pill */}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-lime-400 rounded-xl shadow-[0_2px_14px_rgba(163,230,53,0.35)] -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}

                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black stroke-[2.5]' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-lime-400/20 text-lime-400 border border-lime-400/30 rounded-full font-bold ml-0.5">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Quick Actions (Excel Download + Master Vault Lock) - Clean on Mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href={excelAPI.downloadUrl}
              download="90_Day_Body_Recomposition_Tracker.xlsx"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#131318] hover:bg-[#1a1a22] border border-zinc-700/80 hover:border-emerald-500/40 text-zinc-200 text-xs font-semibold rounded-xl transition duration-150 shadow-sm"
              title="Download 90-Day Excel Workbook (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Excel (.xlsx)</span>
            </a>

            <button
              onClick={onLock}
              className="p-1.5 sm:p-2 rounded-xl bg-[#131318] hover:bg-red-950/30 border border-zinc-700/80 hover:border-red-500/40 text-zinc-400 hover:text-red-400 transition cursor-pointer"
              title="Lock Master Vault"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION DOCK (100% NATIVE FITNESS APP FEEL) */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-2.5 left-2.5 right-2.5 z-40 lg:hidden"
      >
        <div className="bg-[#121217]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl px-1 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex-1 min-w-0 relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-lime-400 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'stroke-[2.5] text-lime-400' : 'stroke-[1.8]'}`} />
                  {item.badge && !isActive && (
                    <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-lime-400" />
                  )}
                </div>
                <span className="text-[10px] tracking-tight truncate max-w-full leading-tight">
                  {item.shortLabel}
                </span>

                {isActive && (
                  <motion.span
                    layoutId="activeBottomNavDot"
                    className="w-1.5 h-1.5 rounded-full bg-lime-400 mt-0.5 shadow-[0_0_8px_rgba(163,230,53,0.8)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
