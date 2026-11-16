import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Plus,
  Flame,
  Info,
  Calendar,
  Save,
  Check,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { workoutAPI } from '../api/api';
import { useAlert } from '../context/AlertContext';

// Days matching user's exact uploaded 6-Day split
const DAYS_CONFIG = [
  { day: 'Monday', title: 'Monday – Chest + Triceps', subtitle: 'Push day', tag: 'Push day', iconColor: 'text-amber-400', bgClass: 'from-amber-500/10' },
  { day: 'Tuesday', title: 'Tuesday – Back + Biceps', subtitle: 'Pull day', tag: 'Pull day', iconColor: 'text-blue-400', bgClass: 'from-blue-500/10' },
  { day: 'Wednesday', title: 'Wednesday – Shoulders + Abs', subtitle: 'Deltoids & Core', tag: 'Shoulders', iconColor: 'text-purple-400', bgClass: 'from-purple-500/10' },
  { day: 'Thursday', title: 'Thursday – Chest + Back', subtitle: 'Upper Body Thickness', tag: 'Upper Body', iconColor: 'text-cyan-400', bgClass: 'from-cyan-500/10' },
  { day: 'Friday', title: 'Friday – Biceps + Triceps', subtitle: 'Arm Hypertrophy', tag: 'Arms Day', iconColor: 'text-lime-400', bgClass: 'from-lime-500/10' },
  { day: 'Saturday', title: 'Saturday – Legs + Abs', subtitle: 'Leg Day', tag: 'Leg Day', isLegDay: true, iconColor: 'text-emerald-400', bgClass: 'from-emerald-500/10' },
  { day: 'Sunday', title: 'Sunday – Rest & Recovery', subtitle: 'Active Restoration', tag: 'Rest Day', iconColor: 'text-zinc-400', bgClass: 'from-zinc-500/10' }
];

export default function Workout() {
  const { showToast } = useAlert();
  const [selectedDay, setSelectedDay] = useState('Friday'); // default today
  const [todayDayName, setTodayDayName] = useState('Friday');
  const [workoutData, setWorkoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 15-Min Cardio Timer State
  const [timerSeconds, setTimerSeconds] = useState(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [cardioDone, setCardioDone] = useState(false);

  // Custom exercise modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [customEx, setCustomEx] = useState({
    name: '',
    targetMuscle: '',
    prescribedSets: 3,
    prescribedReps: '10-12',
    instructions: '',
    alternative: ''
  });

  // Fetch workout for selected day
  const loadDayWorkout = async (day) => {
    if (!workoutData) setLoading(true);
    try {
      const res = await workoutAPI.getDayPlan(day);
      if (res.data.success) {
        setWorkoutData(res.data.workout);
        setSelectedDay(day);
        setCardioDone(res.data.workout?.cardioCompleted || false);
      }
    } catch (err) {
      console.error('Fetch workout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load: get today's day of week
  useEffect(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];
    setTodayDayName(currentDay);
    loadDayWorkout(currentDay);
  }, []);

  // Timer tick
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      setCardioDone(true);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSetChange = (exerciseIdx, setIdx, field, value) => {
    if (!workoutData) return;
    const updatedExercises = [...workoutData.exercises];
    const targetSet = updatedExercises[exerciseIdx].sets[setIdx];
    targetSet[field] = field === 'completed' ? value : Number(value);
    setWorkoutData({ ...workoutData, exercises: updatedExercises });
  };

  const handleAddSet = (exerciseIdx) => {
    if (!workoutData) return;
    const updatedExercises = [...workoutData.exercises];
    const sets = updatedExercises[exerciseIdx].sets || [];
    sets.push({
      setNumber: sets.length + 1,
      weight: sets.length > 0 ? sets[sets.length - 1].weight : 0,
      reps: sets.length > 0 ? sets[sets.length - 1].reps : 10,
      completed: false
    });
    updatedExercises[exerciseIdx].sets = sets;
    setWorkoutData({ ...workoutData, exercises: updatedExercises });
  };

  const handleAddCustomExercise = (e) => {
    e.preventDefault();
    if (!customEx.name || !workoutData) return;

    const newSets = [];
    for (let i = 1; i <= Number(customEx.prescribedSets || 3); i++) {
      newSets.push({ setNumber: i, weight: 0, reps: 10, completed: false });
    }

    const newExercise = {
      name: customEx.name,
      targetMuscle: customEx.targetMuscle || 'Muscle Group',
      prescribedSets: Number(customEx.prescribedSets || 3),
      prescribedReps: customEx.prescribedReps || '10-12',
      instructions: customEx.instructions || 'Standard controlled tempo.',
      alternative: customEx.alternative || '',
      sets: newSets
    };

    setWorkoutData({
      ...workoutData,
      exercises: [...workoutData.exercises, newExercise]
    });
    setShowAddModal(false);
    setCustomEx({ name: '', targetMuscle: '', prescribedSets: 3, prescribedReps: '10-12', instructions: '', alternative: '' });
  };

  const handleSaveWorkout = async () => {
    try {
      await workoutAPI.saveLog({
        date: workoutData.date || new Date().toISOString().split('T')[0],
        dayOfWeek: selectedDay,
        focusArea: workoutData.focusArea,
        completed: true,
        cardioMinutes: 15,
        cardioCompleted: cardioDone,
        exercises: workoutData.exercises,
        rating: 4
      });
      setSavedSuccess(true);
      showToast(`${selectedDay} workout session saved!`, 'success');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      showToast('Failed to save workout log', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* ========================================================================= */}
      {/* 1. YOUR 6-DAY GYM SPLIT SECTION (EXACTLY MATCHING USER SCREENSHOT)       */}
      {/* ========================================================================= */}
      <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Your 6-Day Gym Split</span>
              <span className="text-2xl">💪</span>
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono hidden sm:inline-block">
            Tap any day to view & log workout
          </span>
        </div>

        {/* 6-Day Split Card List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DAYS_CONFIG.map((cfg) => {
            const isSelected = selectedDay === cfg.day;
            const isToday = todayDayName === cfg.day;

            return (
              <div
                key={cfg.day}
                onClick={() => loadDayWorkout(cfg.day)}
                className={`group relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-3.5 ${
                  isSelected
                    ? 'bg-[#1c1c22] border-lime-400 shadow-md glow-lime-sm'
                    : 'bg-[#18181c] hover:bg-[#1f1f26] border-zinc-800/90 hover:border-zinc-700'
                }`}
              >
                {/* Left Slate Blue Square Box (matching screenshot) */}
                <div className={`w-13 h-13 rounded-xl flex items-center justify-center shrink-0 border transition ${
                  isSelected
                    ? 'bg-lime-400/15 border-lime-400/40 text-lime-400'
                    : 'bg-[#252b36] border-[#313948] text-zinc-300 group-hover:text-white'
                }`}>
                  <Dumbbell className="w-6 h-6" />
                </div>

                {/* Center: Title & Subtitle */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className={`text-sm font-bold truncate ${isSelected ? 'text-lime-300' : 'text-white'}`}>
                      {cfg.title}
                    </h3>
                  </div>

                  {/* Subtitle / Badge */}
                  <div className="mt-1 flex items-center gap-2">
                    {cfg.isLegDay ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                        {cfg.tag}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400 font-medium">
                        {cfg.subtitle}
                      </span>
                    )}

                    {isToday && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-lime-400 text-black">
                        <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                        Today
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Arrow */}
                <ChevronRight className={`w-4 h-4 shrink-0 transition ${
                  isSelected ? 'text-lime-400 translate-x-0.5' : 'text-zinc-600 group-hover:text-zinc-400'
                }`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ACTIVE DAY WORKOUT LOGGER (SETS, REPS, WEIGHTS, CARDIO)                */}
      {/* ========================================================================= */}
      {loading || !workoutData ? (
        <div className="flex items-center justify-center min-h-[30vh] text-lime-400 font-mono text-sm">
          <span>Loading {selectedDay}'s Routine...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Workout Header */}
          <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-lime-400 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Active Workout Session</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                <span>{selectedDay}:</span>
                <span className="text-lime-400">{workoutData.focusArea}</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Target RPE 8 (keep 1-2 reps in reserve) • Record weights to achieve progressive overload
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-lime-400" />
                <span>Add Custom Exercise</span>
              </button>
              <button
                onClick={handleSaveWorkout}
                className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  savedSuccess ? 'bg-emerald-500 text-white' : 'bg-lime-400 hover:bg-lime-300 text-black glow-lime-sm'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Workout Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save {selectedDay}'s Workout</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 15-Minute Cardio Card */}
          <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>15-Minute Moderate Cardio Protocol</span>
                  {cardioDone && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                      Completed
                    </span>
                  )}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Incline Treadmill Walk (Speed 4.8 km/h, Incline 6-8%) or Stationary Cycling
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full md:w-auto">
              <span className="font-mono text-xl sm:text-2xl font-bold text-white tracking-widest bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-800">
                {formatTimer(timerSeconds)}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-2 sm:p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition cursor-pointer"
                >
                  {isTimerRunning ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-lime-400" />}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(15 * 60);
                  }}
                  className="p-2 sm:p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCardioDone(!cardioDone)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    cardioDone ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{cardioDone ? 'Done' : 'Mark Done'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Exercise Cards */}
          <div className="space-y-4">
            {workoutData.exercises?.map((ex, exIdx) => (
              <div key={exIdx} className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-lime-500/10 text-lime-400 border border-lime-500/20">
                        {ex.targetMuscle}
                      </span>
                      <h3 className="text-base font-bold text-white">{ex.name}</h3>
                    </div>
                    {ex.alternative && (
                      <p className="text-[11px] text-zinc-400 mt-1">
                        <span className="text-zinc-500">Alternative:</span> {ex.alternative}
                      </p>
                    )}
                  </div>

                  <div className="text-xs text-zinc-400 sm:text-right">
                    <span className="font-semibold text-white">{ex.prescribedSets} Sets</span> • {ex.prescribedReps} Reps
                  </div>
                </div>

                {ex.instructions && (
                  <div className="my-2.5 p-2.5 bg-zinc-900/60 rounded-xl border border-zinc-800/60 text-[11px] text-zinc-400 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-lime-400 shrink-0 mt-0.5" />
                    <span>{ex.instructions}</span>
                  </div>
                )}

                {/* Set Logger Rows */}
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-12 text-[10px] sm:text-[11px] font-semibold text-zinc-400 px-2 uppercase tracking-wider">
                    <span className="col-span-2">Set</span>
                    <span className="col-span-4">Weight (kg)</span>
                    <span className="col-span-4">Reps</span>
                    <span className="col-span-2 text-center">Done</span>
                  </div>

                  {ex.sets?.map((set, setIdx) => (
                    <div
                      key={setIdx}
                      className={`grid grid-cols-12 items-center gap-2 p-2 rounded-xl border transition ${
                        set.completed ? 'bg-lime-950/20 border-lime-500/30' : 'bg-zinc-900/50 border-zinc-800'
                      }`}
                    >
                      <span className="col-span-2 text-xs font-bold text-zinc-300 pl-1">
                        SET {set.setNumber}
                      </span>
                      <div className="col-span-4">
                        <input
                          type="number"
                          step="0.5"
                          placeholder="kg"
                          value={set.weight || ''}
                          onChange={(e) => handleSetChange(exIdx, setIdx, 'weight', e.target.value)}
                          className="w-full bg-[#18181b] border border-zinc-700 rounded-lg px-2.5 py-1 text-white text-xs focus:border-lime-400 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="number"
                          placeholder="reps"
                          value={set.reps || ''}
                          onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', e.target.value)}
                          className="w-full bg-[#18181b] border border-zinc-700 rounded-lg px-2.5 py-1 text-white text-xs focus:border-lime-400 focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <button
                          onClick={() => handleSetChange(exIdx, setIdx, 'completed', !set.completed)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition cursor-pointer ${
                            set.completed ? 'bg-lime-400 text-black' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2.5 flex justify-end">
                  <button
                    onClick={() => handleAddSet(exIdx)}
                    className="text-[11px] text-lime-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Another Set</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM EXERCISE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-lime-400" />
              <span>Add Custom Exercise to {selectedDay}</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Add any gym exercise or machine to this workout
            </p>

            <form onSubmit={handleAddCustomExercise} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Exercise Name</label>
                <input
                  type="text"
                  placeholder="e.g. Incline Cable Flyes"
                  value={customEx.name}
                  onChange={(e) => setCustomEx({ ...customEx, name: e.target.value })}
                  className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Target Muscle</label>
                  <input
                    type="text"
                    placeholder="e.g. Chest / Arms"
                    value={customEx.targetMuscle}
                    onChange={(e) => setCustomEx({ ...customEx, targetMuscle: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Sets</label>
                  <input
                    type="number"
                    value={customEx.prescribedSets}
                    onChange={(e) => setCustomEx({ ...customEx, prescribedSets: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Form Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Slow negative, squeeze at top"
                  value={customEx.instructions}
                  onChange={(e) => setCustomEx({ ...customEx, instructions: e.target.value })}
                  className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Add Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
