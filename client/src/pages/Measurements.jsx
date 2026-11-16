import React, { useState, useEffect } from 'react';
import {
  Ruler,
  Plus,
  Trash2,
  TrendingDown,
  Info,
  Calendar,
  CheckCircle2,
  X,
  Scale,
  Sparkles
} from 'lucide-react';
import { measurementAPI } from '../api/api';
import { useAlert } from '../context/AlertContext';

export default function Measurements() {
  const { showToast, confirm } = useAlert();
  const [measurements, setMeasurements] = useState([]);
  const [baseline, setBaseline] = useState({ weight: 80, waist: 101, chest: 95, biceps: 30 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    waist: '',
    chest: '',
    bicepsLeft: '',
    bicepsRight: '',
    thighs: '',
    hips: '',
    notes: ''
  });

  const fetchMeasurements = async () => {
    try {
      const res = await measurementAPI.getAll();
      if (res.data.success) {
        setMeasurements(res.data.measurements);
        if (res.data.baseline) setBaseline(res.data.baseline);
      }
    } catch (err) {
      console.error('Fetch measurements error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await measurementAPI.save(form);
      if (res.data.success) {
        fetchMeasurements();
        setShowModal(false);
        showToast('Body measurement recorded successfully!', 'success');
      }
    } catch (err) {
      showToast('Failed to save measurement', 'error');
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Delete Measurement?',
      message: 'Are you sure you want to remove this measurement record? The dashboard stats will update immediately.',
      confirmText: 'Delete Entry',
      danger: true
    });
    if (!ok) return;

    try {
      await measurementAPI.delete(id);
      setMeasurements(measurements.filter((m) => m._id !== id));
      showToast('Measurement entry deleted', 'info');
    } catch (err) {
      showToast('Failed to delete entry', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-lime-400 font-mono text-sm">
        <span>Loading Body Measurements...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-lime-400 uppercase tracking-widest">
              <Ruler className="w-4 h-4" />
              <span>Circumference & Weight Log</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Body Measurements (Zero Restrictions)
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Starting Baseline: <span className="text-white font-medium">80 kg Weight • 101 cm Waist • 95 cm Chest • 30 cm Biceps</span>
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-150 glow-lime-sm cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Measurement</span>
          </button>
        </div>
      </div>

      {/* Guidelines Card */}
      <div className="p-3.5 sm:p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-xs text-zinc-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Guidelines for Standardized Accuracy:</p>
          <p>• Measure in the morning, right after using the washroom and before breakfast or water.</p>
          <p>• Keep stomach relaxed across the belly button level — do not suck in.</p>
        </div>
      </div>

      {/* Empty State */}
      {measurements.length === 0 && (
        <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
          <Scale className="w-10 h-10 text-zinc-600 mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Measurements Recorded Yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-4">
            Tap the button below to log your starting baseline or current day's measurements.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-lime-400 text-black text-xs font-semibold rounded-xl hover:bg-lime-300 transition glow-lime-sm cursor-pointer"
          >
            + Record Baseline Entry
          </button>
        </div>
      )}

      {/* 1. MOBILE NATIVE CARD VIEW (md:hidden) - 100% Native App Feel */}
      {measurements.length > 0 && (
        <div className="md:hidden space-y-3">
          {measurements.map((item) => {
            const wtDiff = item.weightDiff !== undefined ? item.weightDiff : (item.weight - 80).toFixed(1);
            const wstDiff = item.waistDiff !== undefined ? item.waistDiff : (item.waist - 101).toFixed(1);

            return (
              <div
                key={item._id}
                className="bg-[#131316] border border-zinc-800 rounded-2xl p-4 shadow-md space-y-3"
              >
                {/* Card Top: Date & Action */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/70">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-lime-400" />
                    <span className="text-sm font-bold text-white font-mono">{item.date}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Body: 4-Metric Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Weight */}
                  <div className="bg-[#18181c] border border-zinc-800/80 rounded-xl p-2.5 flex flex-col">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Weight</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-black text-lime-400">{item.weight}</span>
                      <span className="text-[10px] text-zinc-400">kg</span>
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${
                          Number(wtDiff) <= 0
                            ? 'bg-lime-500/10 text-lime-400 border border-lime-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {Number(wtDiff) > 0 ? `+${wtDiff}` : wtDiff} kg
                      </span>
                    </div>
                  </div>

                  {/* Waist */}
                  <div className="bg-[#18181c] border border-zinc-800/80 rounded-xl p-2.5 flex flex-col">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Waist / Belly</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-black text-sky-400">{item.waist}</span>
                      <span className="text-[10px] text-zinc-400">cm</span>
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${
                          Number(wstDiff) <= 0
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {Number(wstDiff) > 0 ? `+${wstDiff}` : wstDiff} cm
                      </span>
                    </div>
                  </div>

                  {/* Chest */}
                  <div className="bg-[#18181c] border border-zinc-800/80 rounded-xl p-2.5 flex flex-col">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Chest</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-bold text-white">
                        {item.chest ? item.chest : '-'}
                      </span>
                      {item.chest && <span className="text-[10px] text-zinc-400">cm</span>}
                    </div>
                  </div>

                  {/* Biceps */}
                  <div className="bg-[#18181c] border border-zinc-800/80 rounded-xl p-2.5 flex flex-col">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Biceps</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-bold text-white">
                        {item.bicepsLeft || item.bicepsRight ? (item.bicepsLeft || item.bicepsRight) : '-'}
                      </span>
                      {(item.bicepsLeft || item.bicepsRight) && <span className="text-[10px] text-zinc-400">cm</span>}
                    </div>
                  </div>
                </div>

                {/* Card Notes */}
                {item.notes && (
                  <div className="text-[11px] text-zinc-400 bg-zinc-900/40 p-2 rounded-lg border border-zinc-800/50">
                    <span className="text-zinc-500 font-medium">Notes: </span>
                    {item.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. DESKTOP TABLE VIEW (hidden md:block) */}
      {measurements.length > 0 && (
        <div className="hidden md:block bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-semibold">
                <th className="pb-3">Date</th>
                <th className="pb-3 text-center">Weight (kg)</th>
                <th className="pb-3 text-center">Waist (cm)</th>
                <th className="pb-3 text-center">Chest (cm)</th>
                <th className="pb-3 text-center">Biceps (cm)</th>
                <th className="pb-3 text-center">Weight Change</th>
                <th className="pb-3 text-center">Waist Change</th>
                <th className="pb-3">Notes</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {measurements.map((item) => {
                const wtDiff = item.weightDiff !== undefined ? item.weightDiff : (item.weight - 80).toFixed(1);
                const wstDiff = item.waistDiff !== undefined ? item.waistDiff : (item.waist - 101).toFixed(1);
                return (
                  <tr key={item._id} className="hover:bg-zinc-900/40">
                    <td className="py-3 font-semibold text-white">{item.date}</td>
                    <td className="py-3 text-center font-bold text-lime-400">{item.weight} kg</td>
                    <td className="py-3 text-center font-medium text-sky-400">{item.waist} cm</td>
                    <td className="py-3 text-center text-zinc-300">{item.chest ? `${item.chest} cm` : '-'}</td>
                    <td className="py-3 text-center text-zinc-300">
                      {item.bicepsLeft || item.bicepsRight ? `${item.bicepsLeft || item.bicepsRight} cm` : '-'}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          Number(wtDiff) <= 0
                            ? 'bg-lime-500/10 text-lime-400 border border-lime-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {Number(wtDiff) > 0 ? `+${wtDiff}` : wtDiff} kg
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          Number(wstDiff) <= 0
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {Number(wstDiff) > 0 ? `+${wstDiff}` : wstDiff} cm
                      </span>
                    </td>
                    <td className="py-3 text-zinc-400 max-w-xs truncate">{item.notes || '-'}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: ADD NEW MEASUREMENT */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#18181b] border border-zinc-700 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative my-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-lime-400" />
              <span>Log Body Measurements</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Add any date without restrictions
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Weight (kg) [Base: 80]</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Waist (cm) [Base: 101]</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.waist}
                    onChange={(e) => setForm({ ...form, waist: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Chest (cm) [Base: 95]</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.chest}
                    onChange={(e) => setForm({ ...form, chest: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Biceps (cm) [Base: 30]</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.bicepsLeft}
                    onChange={(e) => setForm({ ...form, bicepsLeft: e.target.value, bicepsRight: e.target.value })}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Measured early morning relaxed"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
