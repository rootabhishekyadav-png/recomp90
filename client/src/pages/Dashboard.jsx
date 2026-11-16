import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  Flame,
  Beef,
  Scale,
  Ruler,
  Dumbbell,
  PlusCircle,
  TrendingDown,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  X,
  Activity
} from 'lucide-react';
import { dashboardAPI, nutritionAPI, measurementAPI } from '../api/api';
import { useAlert } from '../context/AlertContext';

export default function Dashboard({ setActiveTab }) {
  const { showToast } = useAlert();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showDietModal, setShowDietModal] = useState(false);
  const [showMeasureModal, setShowMeasureModal] = useState(false);

  // Diet form state (starts clean, no dummy values)
  const [dietForm, setDietForm] = useState({
    caloriesConsumed: '',
    proteinConsumed: '',
    carbsConsumed: '',
    fatConsumed: '',
    waterLiters: '',
    notes: ''
  });

  // Measure form state (starts clean, no dummy values)
  const [measureForm, setMeasureForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    waist: '',
    chest: '',
    biceps: '',
    notes: ''
  });

  const fetchDashboard = async () => {
    try {
      const res = await dashboardAPI.getSummary();
      if (res.data.success) {
        setData(res.data.data);
        if (res.data.data.todayNutrition && res.data.data.todayNutrition.caloriesConsumed > 0) {
          setDietForm({
            caloriesConsumed: res.data.data.todayNutrition.caloriesConsumed || '',
            proteinConsumed: res.data.data.todayNutrition.proteinConsumed || '',
            carbsConsumed: res.data.data.todayNutrition.carbsConsumed || '',
            fatConsumed: res.data.data.todayNutrition.fatConsumed || '',
            waterLiters: res.data.data.todayNutrition.waterLiters || '',
            notes: res.data.data.todayNutrition.notes || ''
          });
        }
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleDietSubmit = async (e) => {
    e.preventDefault();
    try {
      await nutritionAPI.saveDayLog({
        date: data?.today || new Date().toISOString().split('T')[0],
        caloriesConsumed: Number(dietForm.caloriesConsumed || 0),
        proteinConsumed: Number(dietForm.proteinConsumed || 0),
        carbsConsumed: Number(dietForm.carbsConsumed || 0),
        fatConsumed: Number(dietForm.fatConsumed || 0),
        waterLiters: Number(dietForm.waterLiters || 0),
        notes: dietForm.notes
      });
      setShowDietModal(false);
      fetchDashboard();
      showToast('Today’s nutrition updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to save diet log', 'error');
    }
  };

  const handleMeasureSubmit = async (e) => {
    e.preventDefault();
    try {
      await measurementAPI.save({
        date: measureForm.date,
        weight: Number(measureForm.weight),
        waist: Number(measureForm.waist),
        chest: Number(measureForm.chest || 0),
        bicepsLeft: Number(measureForm.biceps || 0),
        bicepsRight: Number(measureForm.biceps || 0),
        notes: measureForm.notes
      });
      setShowMeasureModal(false);
      fetchDashboard();
      showToast('Body measurement updated!', 'success');
    } catch (err) {
      showToast('Failed to save measurement', 'error');
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-lime-400 font-mono text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping" />
          <span>Loading Dashboard Engine...</span>
        </div>
      </div>
    );
  }

  // Pure REAL data - Zero dummy records
  const chartNutrition = data.nutritionHistory || [];
  const chartMeasurements = data.measurementHistory || [];

  const currentWeight = data.latestMeasurement?.weight || 80.0;
  const currentWaist = data.latestMeasurement?.waist || 101.0;
  const hasMeasured = Boolean(data.measurementHistory && data.measurementHistory.length > 0);

  const weightDelta = hasMeasured ? +(currentWeight - 80.0).toFixed(1) : 0;
  const waistDelta = hasMeasured ? +(currentWaist - 101.0).toFixed(1) : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* 90-Day Challenge Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#18181b] via-[#131316] to-[#18181b] border border-zinc-800 p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-lime-400 uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>90-Day Body Recomposition Challenge</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Day {data.dayNumber} <span className="text-zinc-500 font-light">/ 90</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Started 13 Nov 2026 • Target Finish 10 Feb 2027 • <span className="text-lime-400 font-medium">{data.daysRemaining} Days Remaining</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setShowDietModal(true)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition duration-200 glow-lime-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Today's Diet</span>
            </button>
            <button
              onClick={() => setShowMeasureModal(true)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-zinc-700 transition cursor-pointer"
            >
              <Ruler className="w-4 h-4 text-lime-400" />
              <span>Log Measurements</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Weight Card */}
        <div className="bg-[#131316] border border-zinc-800 rounded-xl p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-medium uppercase tracking-wider">Body Weight</span>
            <Scale className="w-4 h-4 text-lime-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{currentWeight}</span>
            <span className="text-xs text-zinc-400">kg</span>
          </div>
          <div className="mt-2 text-[11px] flex items-center gap-1">
            {hasMeasured ? (
              <>
                <span className={weightDelta <= 0 ? 'text-lime-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {weightDelta > 0 ? `+${weightDelta}` : weightDelta} kg
                </span>
                <span className="text-zinc-500">from 80kg start</span>
              </>
            ) : (
              <span className="text-zinc-500">Day 1 Starting Baseline</span>
            )}
          </div>
        </div>

        {/* Waist Card */}
        <div className="bg-[#131316] border border-zinc-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-medium uppercase tracking-wider">Waist / Belly</span>
            <Ruler className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{currentWaist}</span>
            <span className="text-xs text-zinc-400">cm</span>
          </div>
          <div className="mt-2 text-[11px] flex items-center gap-1">
            {hasMeasured ? (
              <>
                <span className={waistDelta <= 0 ? 'text-lime-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {waistDelta > 0 ? `+${waistDelta}` : waistDelta} cm
                </span>
                <span className="text-zinc-500">from 101cm start</span>
              </>
            ) : (
              <span className="text-zinc-500">Day 1 Starting Baseline</span>
            )}
          </div>
        </div>

        {/* Today's Calories */}
        <div className="bg-[#131316] border border-zinc-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-medium uppercase tracking-wider">Calories Today</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {data.todayNutrition?.caloriesConsumed || 0}
            </span>
            <span className="text-xs text-zinc-400">/ 2000 kcal</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-orange-400 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, ((data.todayNutrition?.caloriesConsumed || 0) / 2000) * 100)}%` }}
            />
          </div>
        </div>

        {/* Today's Protein */}
        <div className="bg-[#131316] border border-zinc-800 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-medium uppercase tracking-wider">Protein Today</span>
            <Beef className="w-4 h-4 text-lime-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {data.todayNutrition?.proteinConsumed || 0}
            </span>
            <span className="text-xs text-zinc-400">/ 130 g</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-lime-400 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, ((data.todayNutrition?.proteinConsumed || 0) / 130) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* THE TWO DEDICATED GRAPH BOXES (CLEAN REAL DATA ONLY)     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* GRAPH BOX 1: DAILY NUTRITION & MACROS */}
        <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Daily Nutrition & Macros (Calories, Protein, Fat)
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Target: 2,000 kcal • 130g Protein • Self-updated daily
              </p>
            </div>
            <button
              onClick={() => setShowDietModal(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-lime-400 border border-zinc-700 transition cursor-pointer"
            >
              + Quick Update
            </button>
          </div>

          <div className="h-72 w-full mt-2 flex items-center justify-center">
            {chartNutrition.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-zinc-800 rounded-xl w-full flex flex-col items-center justify-center">
                <Flame className="w-10 h-10 text-zinc-600 mb-2" />
                <p className="text-xs font-semibold text-zinc-300">No daily nutrition logged yet</p>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
                  Tap '+ Quick Update' to log today's food, calories, protein, and fat.
                </p>
                <button
                  onClick={() => setShowDietModal(true)}
                  className="mt-3 px-3 py-1.5 bg-lime-400 text-black text-xs font-semibold rounded-lg hover:bg-lime-300 transition"
                >
                  Log First Entry
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartNutrition} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <ReferenceLine y={2000} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Target 2000 kcal', fill: '#f97316', fontSize: 10 }} />
                  <Bar dataKey="caloriesConsumed" name="Calories (kcal)" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="proteinConsumed" name="Protein (g)" fill="#a3e635" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fatConsumed" name="Fat (g)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>Orange: Calories | Lime: Protein | Blue: Fat</span>
            <button onClick={() => setActiveTab('diet')} className="text-lime-400 hover:underline flex items-center gap-1 font-medium">
              <span>Open Mess Diet Planner</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* GRAPH BOX 2: BODY MEASUREMENTS & WEIGHT (ZERO RESTRICTIONS) */}
        <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Body Metrics & Circumference Evolution
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Weight, Waist, Chest & Biceps • Zero restrictions, log anytime
              </p>
            </div>
            <button
              onClick={() => setShowMeasureModal(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-lime-400 border border-zinc-700 transition cursor-pointer"
            >
              + Log New
            </button>
          </div>

          <div className="h-72 w-full mt-2 flex items-center justify-center">
            {chartMeasurements.length === 0 ? (
              <div className="text-center p-6 border border-dashed border-zinc-800 rounded-xl w-full flex flex-col items-center justify-center">
                <Ruler className="w-10 h-10 text-zinc-600 mb-2" />
                <p className="text-xs font-semibold text-zinc-300">No body measurements recorded yet</p>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
                  Tap '+ Log New' to record your weight, waist, chest, or biceps.
                </p>
                <button
                  onClick={() => setShowMeasureModal(true)}
                  className="mt-3 px-3 py-1.5 bg-lime-400 text-black text-xs font-semibold rounded-lg hover:bg-lime-300 transition"
                >
                  Record Baseline
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartMeasurements} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#ffffff', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#a3e635" strokeWidth={2.5} dot={{ r: 4, fill: '#a3e635' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="waist" name="Waist (cm)" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="chest" name="Chest (cm)" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="biceps" name="Biceps (cm)" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>Lime: Weight | Blue: Waist | Pink: Chest | Yellow: Biceps</span>
            <button onClick={() => setActiveTab('measurements')} className="text-lime-400 hover:underline flex items-center gap-1 font-medium">
              <span>View Full History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Workout Split Preview */}
        <div
          onClick={() => setActiveTab('workout')}
          className="bg-[#131316] hover:bg-[#18181c] border border-zinc-800 p-5 rounded-2xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400 group-hover:scale-105 transition">
              <Dumbbell className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-lime-400 transition" />
          </div>
          <h4 className="text-sm font-bold text-white mt-3">Your 6-Day Gym Split</h4>
          <p className="text-xs text-zinc-400 mt-1">
            Mon: Push | Tue: Pull | Wed: Shoulders | Thu: Chest+Back | Fri: Arms | Sat: Legs
          </p>
        </div>

        {/* General Photo Feed */}
        <div
          onClick={() => setActiveTab('feed')}
          className="bg-[#131316] hover:bg-[#18181c] border border-zinc-800 p-5 rounded-2xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition">
              <Flame className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-sky-400 transition" />
          </div>
          <h4 className="text-sm font-bold text-white mt-3">Gym Photo Feed (Auto-Date)</h4>
          <p className="text-xs text-zinc-400 mt-1">
            Upload daily pump pics & gym selfies with automatic date & timestamp
          </p>
        </div>

        {/* 90-Day Transformation Photos */}
        <div
          onClick={() => setActiveTab('transform')}
          className="bg-[#131316] hover:bg-[#18181c] border border-zinc-800 p-5 rounded-2xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
              <TrendingDown className="w-5 h-5" />
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transition" />
          </div>
          <h4 className="text-sm font-bold text-white mt-3">Transformation Milestones</h4>
          <p className="text-xs text-zinc-400 mt-1">
            Day 1, 15, 30, 45, 60, 75, 90 Front, Side & Back Before/After studio
          </p>
        </div>
      </div>

      {/* MODAL 1: QUICK DIET LOG (CLEAN FORM) */}
      {showDietModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowDietModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span>Log Today's Calories & Macros</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter your actual daily consumed food intake for {data.today}
            </p>

            <form onSubmit={handleDietSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2000"
                    value={dietForm.caloriesConsumed}
                    onChange={(e) => setDietForm({ ...dietForm, caloriesConsumed: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    placeholder="e.g. 130"
                    value={dietForm.proteinConsumed}
                    onChange={(e) => setDietForm({ ...dietForm, proteinConsumed: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Carbohydrates (g)</label>
                  <input
                    type="number"
                    placeholder="e.g. 280"
                    value={dietForm.carbsConsumed}
                    onChange={(e) => setDietForm({ ...dietForm, carbsConsumed: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    placeholder="e.g. 70"
                    value={dietForm.fatConsumed}
                    onChange={(e) => setDietForm({ ...dietForm, fatConsumed: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Water Intake (Litres)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 3.5"
                  value={dietForm.waterLiters}
                  onChange={(e) => setDietForm({ ...dietForm, waterLiters: e.target.value })}
                  className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Notes / Meals Eaten</label>
                <input
                  type="text"
                  placeholder="e.g. 4 eggs + 50g soya chunks + mess dal/rice"
                  value={dietForm.notes}
                  onChange={(e) => setDietForm({ ...dietForm, notes: e.target.value })}
                  className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Save Daily Diet Intake
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG MEASUREMENT (CLEAN FORM) */}
      {showMeasureModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowMeasureModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-lime-400" />
              <span>Log Body Measurements</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Enter your real measurements • Zero restrictions, log anytime
            </p>

            <form onSubmit={handleMeasureSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Date</label>
                <input
                  type="date"
                  value={measureForm.date}
                  onChange={(e) => setMeasureForm({ ...measureForm, date: e.target.value })}
                  className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Weight (kg) [Baseline: 80]</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 79.5"
                    value={measureForm.weight}
                    onChange={(e) => setMeasureForm({ ...measureForm, weight: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Waist (cm) [Baseline: 101]</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 100.0"
                    value={measureForm.waist}
                    onChange={(e) => setMeasureForm({ ...measureForm, waist: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Chest (cm) [Baseline: 95]</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 95.5"
                    value={measureForm.chest}
                    onChange={(e) => setMeasureForm({ ...measureForm, chest: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Biceps (cm) [Baseline: 30]</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 30.5"
                    value={measureForm.biceps}
                    onChange={(e) => setMeasureForm({ ...measureForm, biceps: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Empty stomach morning check"
                  value={measureForm.notes}
                  onChange={(e) => setMeasureForm({ ...measureForm, notes: e.target.value })}
                  className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Save Measurement
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
