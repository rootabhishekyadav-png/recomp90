import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Flame,
  Beef,
  IndianRupee,
  Trash2,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  X
} from 'lucide-react';
import { nutritionAPI } from '../api/api';
import { useAlert } from '../context/AlertContext';

export default function DietTracker() {
  const { showToast } = useAlert();
  const [foods, setFoods] = useState([]);
  const [dayLog, setDayLog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selector state
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Custom food modal state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customForm, setCustomForm] = useState({
    name: '',
    portion: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    cost: ''
  });

  // Direct quick calorie entry modal
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [quickForm, setQuickForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    cost: ''
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    try {
      const [foodsRes, logRes] = await Promise.all([
        nutritionAPI.getFoods(),
        nutritionAPI.getDayLog(todayStr)
      ]);
      if (foodsRes.data.success) {
        setFoods(foodsRes.data.foods);
        if (foodsRes.data.foods.length > 0) {
          setSelectedFoodId(foodsRes.data.foods[0]._id);
        }
      }
      if (logRes.data.success) {
        setDayLog(logRes.data.log);
      }
    } catch (err) {
      console.error('Diet fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1-Tap Presets
  const applyPreset = async (presetType) => {
    if (!dayLog) return;
    let newItems = [];

    if (presetType === 'mess_lunch') {
      newItems = [
        { name: 'Mess Wheat Roti (3x)', portion: '3 medium', quantity: 1, calories: 270, protein: 9.0, carbs: 57.0, fat: 1.5, cost: 0 },
        { name: 'Mess Dal (1.5 bowl)', portion: '220 ml', quantity: 1, calories: 195, protein: 9.5, carbs: 27.0, fat: 4.5, cost: 0 },
        { name: 'White Rice (Cooked)', portion: '1 plate (150g)', quantity: 1, calories: 195, protein: 4.0, carbs: 42.0, fat: 0.5, cost: 0 }
      ];
    } else if (presetType === 'soya_bowl') {
      newItems = [
        { name: 'Soya Chunks Bowl (50g raw)', portion: '150g cooked', quantity: 1, calories: 172, protein: 26.0, carbs: 16.5, fat: 0.2, cost: 10 },
        { name: 'Curd / Dahi', portion: '100 g', quantity: 1, calories: 60, protein: 3.5, carbs: 4.5, fat: 3.0, cost: 10 },
        { name: 'Banana', portion: '1 medium', quantity: 1, calories: 90, protein: 1.1, carbs: 23.0, fat: 0.3, cost: 5 }
      ];
    } else if (presetType === 'egg_quota') {
      newItems = [
        { name: 'Whole Boiled Egg', portion: '2 eggs', quantity: 2, calories: 140, protein: 12.0, carbs: 1.0, fat: 10.0, cost: 14 },
        { name: 'Boiled Egg Whites', portion: '3 whites', quantity: 3, calories: 51, protein: 10.8, carbs: 0.6, fat: 0.0, cost: 15 }
      ];
    }

    const updatedMeals = [...(dayLog.meals || []), ...newItems];
    saveUpdatedMeals(updatedMeals);
  };

  // Add selected food item to meals
  const handleAddFoodItem = () => {
    const food = foods.find((f) => f._id === selectedFoodId);
    if (!food || !dayLog) return;

    const q = Number(quantity) || 1;
    const newItem = {
      name: food.name,
      portion: food.portion,
      quantity: q,
      calories: Math.round(food.calories * q),
      protein: +(food.protein * q).toFixed(1),
      carbs: +(food.carbs * q).toFixed(1),
      fat: +(food.fat * q).toFixed(1),
      cost: Math.round(food.cost * q)
    };

    const updatedMeals = [...(dayLog.meals || []), newItem];
    saveUpdatedMeals(updatedMeals);
  };

  // Remove food item
  const handleRemoveItem = (index) => {
    if (!dayLog) return;
    const updatedMeals = dayLog.meals.filter((_, idx) => idx !== index);
    saveUpdatedMeals(updatedMeals);
  };

  const saveUpdatedMeals = async (updatedMeals) => {
    const totalCal = updatedMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
    const totalProt = updatedMeals.reduce((acc, m) => acc + (m.protein || 0), 0);
    const totalCarb = updatedMeals.reduce((acc, m) => acc + (m.carbs || 0), 0);
    const totalFat = updatedMeals.reduce((acc, m) => acc + (m.fat || 0), 0);
    const totalCost = updatedMeals.reduce((acc, m) => acc + (m.cost || 0), 0);

    try {
      const res = await nutritionAPI.saveDayLog({
        date: todayStr,
        caloriesConsumed: totalCal,
        proteinConsumed: +totalProt.toFixed(1),
        carbsConsumed: +totalCarb.toFixed(1),
        fatConsumed: +totalFat.toFixed(1),
        budgetSpent: totalCost,
        meals: updatedMeals
      });
      if (res.data.success) {
        setDayLog(res.data.log);
        showToast('Diet log updated!', 'success');
      }
    } catch (err) {
      showToast('Error updating nutrition log', 'error');
    }
  };

  const handleCustomFoodSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await nutritionAPI.addCustomFood(customForm);
      if (res.data.success) {
        setFoods([res.data.food, ...foods]);
        setSelectedFoodId(res.data.food._id);
        setShowCustomModal(false);
        setCustomForm({ name: '', portion: '1 serving', calories: 150, protein: 10, carbs: 15, fat: 3, cost: 20 });
        showToast('Custom food saved to library!', 'success');
      }
    } catch (err) {
      showToast('Failed to save custom food', 'error');
    }
  };

  const handleQuickEntrySubmit = (e) => {
    e.preventDefault();
    if (!dayLog) return;
    const newItem = {
      name: quickForm.name,
      portion: 'Custom Entry',
      quantity: 1,
      calories: Number(quickForm.calories),
      protein: Number(quickForm.protein),
      carbs: Number(quickForm.carbs || 0),
      fat: Number(quickForm.fat || 0),
      cost: Number(quickForm.cost || 0)
    };
    saveUpdatedMeals([...(dayLog.meals || []), newItem]);
    setShowQuickModal(false);
  };

  if (loading || !dayLog) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-lime-400 font-mono text-sm">
        <span>Loading Diet Engine & PG Database...</span>
      </div>
    );
  }

  const caloriesTarget = 2000;
  const proteinTarget = 130;
  const currentCal = dayLog.caloriesConsumed || 0;
  const currentProt = dayLog.proteinConsumed || 0;
  const currentBudget = dayLog.budgetSpent || 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Target Progress Bar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Calories Card */}
        <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Calories</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{currentCal}</span>
            <span className="text-xs text-zinc-400">/ {caloriesTarget} kcal</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-orange-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentCal / caloriesTarget) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">
            Remaining: <span className="text-white font-semibold">{Math.max(0, caloriesTarget - currentCal)} kcal</span>
          </p>
        </div>

        {/* Protein Card */}
        <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Protein Goal</span>
            <Beef className="w-4 h-4 text-lime-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{currentProt}</span>
            <span className="text-xs text-zinc-400">/ {proteinTarget} g</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-lime-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentProt / proteinTarget) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">
            Remaining: <span className="text-white font-semibold">{Math.max(0, (proteinTarget - currentProt).toFixed(1))} g</span>
          </p>
        </div>

        {/* Extra Budget Tracker */}
        <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Daily Extra Budget</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">₹{currentBudget}</span>
            <span className="text-xs text-zinc-400">/ ₹100 max</span>
          </div>
          <div className="w-full bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentBudget / 100) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">
            Budget Left: <span className="text-white font-semibold">₹{Math.max(0, 100 - currentBudget)}</span> (Eggs, Soya, Milk)
          </p>
        </div>
      </div>

      {/* 1-Tap Quick Presets Section */}
      <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-lime-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            1-Tap PG & Mess Quick Meal Presets
          </h3>
        </div>
        <p className="text-xs text-zinc-400 mb-3">
          Instant 1-tap addition for your standard hostel mess meals and high-protein combos
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => applyPreset('mess_lunch')}
            className="p-3 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl text-left transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-lime-400">Standard Mess Lunch</span>
              <Plus className="w-3.5 h-3.5 text-zinc-400 group-hover:text-lime-400" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">3 Roti + 1.5 Dal + 1 Plate Rice</p>
            <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
              660 kcal • 22.5g Protein
            </span>
          </button>

          <button
            onClick={() => applyPreset('soya_bowl')}
            className="p-3 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl text-left transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-lime-400">Post-Workout Soya Bowl</span>
              <Plus className="w-3.5 h-3.5 text-zinc-400 group-hover:text-lime-400" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">50g Soya + 100g Curd + 1 Banana</p>
            <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-lime-500/10 text-lime-400 border border-lime-500/20">
              322 kcal • 30.6g Protein • ₹25
            </span>
          </button>

          <button
            onClick={() => applyPreset('egg_quota')}
            className="p-3 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl text-left transition group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-lime-400">Daily Egg Quota</span>
              <Plus className="w-3.5 h-3.5 text-zinc-400 group-hover:text-lime-400" />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">2 Whole Eggs + 3 Boiled Whites</p>
            <span className="inline-block mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              191 kcal • 22.8g Protein • ₹29
            </span>
          </button>
        </div>
      </div>

      {/* Add Custom / Individual Food Item */}
      <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Add Food from PG & Personal Library</h3>
            <p className="text-xs text-zinc-400">Select any food item and choose quantity to auto-calculate</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomModal(true)}
              className="px-3 py-1.5 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 text-xs font-semibold border border-lime-500/30 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Food</span>
            </button>
            <button
              onClick={() => setShowQuickModal(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition cursor-pointer"
            >
              Quick Entry
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-7">
            <label className="text-xs text-zinc-400 block mb-1">Choose Food Item</label>
            <select
              value={selectedFoodId}
              onChange={(e) => setSelectedFoodId(e.target.value)}
              className="w-full bg-[#18181b] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:border-lime-400 focus:outline-none"
            >
              {foods.map((food) => (
                <option key={food._id} value={food._id}>
                  {food.name} ({food.portion}) — {food.calories} kcal, {food.protein}g P {food.cost > 0 ? `• ₹${food.cost}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="text-xs text-zinc-400 block mb-1">Quantity</label>
            <input
              type="number"
              min="0.25"
              step="0.25"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#18181b] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              onClick={handleAddFoodItem}
              className="w-full py-2 bg-lime-400 hover:bg-lime-300 text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Meal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Meals Eaten Today Table */}
      <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-3">Today's Consumed Meals Log</h3>

        {(!dayLog.meals || dayLog.meals.length === 0) ? (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No meals logged yet today. Use the presets above or add items from the library!
          </div>
        ) : (
          <>
            {/* MOBILE CARD VIEW (md:hidden) */}
            <div className="md:hidden space-y-2.5">
              {dayLog.meals.map((item, idx) => (
                <div key={idx} className="bg-[#18181c] border border-zinc-800 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <span className="text-[11px] text-zinc-400">{item.portion} (x{item.quantity || 1})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-orange-400">{item.calories} kcal</span>
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400 transition cursor-pointer"
                        title="Remove meal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-lime-500/10 text-lime-400 border border-lime-500/20 font-bold">
                      {item.protein}g P
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {item.carbs || 0}g C
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {item.fat || 0}g F
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-auto font-bold">
                      {item.cost > 0 ? `₹${item.cost}` : 'Mess'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-semibold">
                    <th className="pb-2">Food Item</th>
                    <th className="pb-2">Portion / Qty</th>
                    <th className="pb-2 text-center">Calories</th>
                    <th className="pb-2 text-center">Protein</th>
                    <th className="pb-2 text-center">Carbs</th>
                    <th className="pb-2 text-center">Fat</th>
                    <th className="pb-2 text-center">Cost</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {dayLog.meals.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40">
                      <td className="py-2.5 font-medium text-white">{item.name}</td>
                      <td className="py-2.5 text-zinc-400">{item.portion} (x{item.quantity || 1})</td>
                      <td className="py-2.5 text-center text-orange-400 font-semibold">{item.calories} kcal</td>
                      <td className="py-2.5 text-center text-lime-400 font-semibold">{item.protein} g</td>
                      <td className="py-2.5 text-center text-zinc-300">{item.carbs || 0} g</td>
                      <td className="py-2.5 text-center text-sky-400">{item.fat || 0} g</td>
                      <td className="py-2.5 text-center text-emerald-400">{item.cost > 0 ? `₹${item.cost}` : 'Mess'}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* MODAL: CREATE CUSTOM FOOD ITEM */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCustomModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-lime-400" />
              <span>Create Custom Food Item</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Add any food not in the default list. It will permanently stay in your food library!
            </p>

            <form onSubmit={handleCustomFoodSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Food Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amul High Protein Lassi"
                  value={customForm.name}
                  onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                  className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Serving / Portion</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 pouch (200ml)"
                    value={customForm.portion}
                    onChange={(e) => setCustomForm({ ...customForm, portion: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Cost (₹)</label>
                  <input
                    type="number"
                    value={customForm.cost}
                    onChange={(e) => setCustomForm({ ...customForm, cost: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={customForm.calories}
                    onChange={(e) => setCustomForm({ ...customForm, calories: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customForm.protein}
                    onChange={(e) => setCustomForm({ ...customForm, protein: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customForm.carbs}
                    onChange={(e) => setCustomForm({ ...customForm, carbs: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customForm.fat}
                    onChange={(e) => setCustomForm({ ...customForm, fat: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Save to My Food Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUICK ENTRY FOR STREET / CHEAT FOOD */}
      {showQuickModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowQuickModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span>Quick Direct Calorie Entry</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Directly enter calories & protein for outside food or cheat snacks
            </p>

            <form onSubmit={handleQuickEntrySubmit} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Description</label>
                <input
                  type="text"
                  value={quickForm.name}
                  onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                  className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={quickForm.calories}
                    onChange={(e) => setQuickForm({ ...quickForm, calories: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={quickForm.protein}
                    onChange={(e) => setQuickForm({ ...quickForm, protein: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 bg-orange-400 hover:bg-orange-300 text-black font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Add Direct Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

