import React, { useState, useEffect } from 'react';
import {
  Layers,
  Upload,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Info,
  Maximize2,
  Columns,
  Sparkles
} from 'lucide-react';
import { photoAPI } from '../api/api';
import { useAlert } from '../context/AlertContext';

const ANGLES = ['front', 'side', 'back'];

export default function TransformationStudio() {
  const { showToast } = useAlert();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAngle, setUploadingAngle] = useState(null); // { dayNumber, angle }

  // Comparison visualizer state
  const [compareBeforeDay, setCompareBeforeDay] = useState(1);
  const [compareAfterDay, setCompareAfterDay] = useState(30);
  const [compareAngle, setCompareAngle] = useState('front');

  const fetchMilestones = async () => {
    try {
      const res = await photoAPI.getMilestones();
      if (res.data.success) {
        setMilestones(res.data.milestones);
      }
    } catch (err) {
      console.error('Milestone fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const handleAngleUpload = async (dayNumber, angle, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAngle({ dayNumber, angle });
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('dayNumber', dayNumber);
    formData.append('angle', angle);

    try {
      const res = await photoAPI.uploadMilestone(formData);
      if (res.data.success) {
        fetchMilestones();
        showToast(`Day ${dayNumber} (${angle}) photo updated!`, 'success');
      }
    } catch (err) {
      showToast('Failed to upload milestone photo', 'error');
    } finally {
      setUploadingAngle(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-lime-400 font-mono text-sm">
        <span>Loading Transformation Studio...</span>
      </div>
    );
  }

  const beforeObj = milestones.find((m) => m.dayNumber === Number(compareBeforeDay));
  const afterObj = milestones.find((m) => m.dayNumber === Number(compareAfterDay));

  const getAngleUrl = (obj, angle) => {
    if (!obj) return '';
    if (angle === 'front') return obj.frontUrl;
    if (angle === 'side') return obj.sideUrl;
    if (angle === 'back') return obj.backUrl;
    return '';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-lime-400 uppercase tracking-widest">
              <Layers className="w-4 h-4" />
              <span>90-Day Standardized Transformation Protocol</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              Transformation Check-In Studio
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Scheduled check-ins on Days 1, 15, 30, 45, 60, 75, 90 • Front, Side & Back angles
            </p>
          </div>

          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[11px] text-zinc-300 flex items-center gap-2 max-w-sm">
            <Info className="w-4 h-4 text-lime-400 shrink-0" />
            <span>Keep identical lighting, 2.5m distance, eye-level camera height and relaxed posture.</span>
          </div>
        </div>
      </div>

      {/* BEFORE & AFTER SIDE-BY-SIDE COMPARATOR */}
      <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Columns className="w-4 h-4 text-lime-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Before vs After Side-by-Side Visualizer
            </h3>
          </div>

          {/* Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-zinc-400">Before:</span>
              <select
                value={compareBeforeDay}
                onChange={(e) => setCompareBeforeDay(e.target.value)}
                className="bg-[#18181b] border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs"
              >
                {milestones.map((m) => (
                  <option key={m.dayNumber} value={m.dayNumber}>Day {m.dayNumber}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-zinc-400">After:</span>
              <select
                value={compareAfterDay}
                onChange={(e) => setCompareAfterDay(e.target.value)}
                className="bg-[#18181b] border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs"
              >
                {milestones.map((m) => (
                  <option key={m.dayNumber} value={m.dayNumber}>Day {m.dayNumber}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-zinc-400">Angle:</span>
              <select
                value={compareAngle}
                onChange={(e) => setCompareAngle(e.target.value)}
                className="bg-[#18181b] border border-zinc-700 rounded-lg px-2 py-1 text-white text-xs capitalize"
              >
                <option value="front">Front Relaxed</option>
                <option value="side">Side Relaxed</option>
                <option value="back">Back Relaxed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Side by side image cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="bg-[#18181b] border border-zinc-700/80 rounded-xl overflow-hidden flex flex-col">
            <div className="p-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white">DAY {compareBeforeDay} (Before)</span>
              <span className="text-[10px] uppercase font-mono text-lime-400">{compareAngle}</span>
            </div>
            <div className="h-80 bg-zinc-950 flex items-center justify-center p-2">
              {getAngleUrl(beforeObj, compareAngle) ? (
                <img
                  src={getAngleUrl(beforeObj, compareAngle)}
                  alt={`Day ${compareBeforeDay}`}
                  className="h-full w-auto object-contain rounded-lg"
                />
              ) : (
                <div className="text-center text-zinc-500 text-xs">
                  No {compareAngle} photo uploaded for Day {compareBeforeDay} yet.
                </div>
              )}
            </div>
          </div>

          {/* After */}
          <div className="bg-[#18181b] border border-zinc-700/80 rounded-xl overflow-hidden flex flex-col">
            <div className="p-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white">DAY {compareAfterDay} (After)</span>
              <span className="text-[10px] uppercase font-mono text-lime-400">{compareAngle}</span>
            </div>
            <div className="h-80 bg-zinc-950 flex items-center justify-center p-2">
              {getAngleUrl(afterObj, compareAngle) ? (
                <img
                  src={getAngleUrl(afterObj, compareAngle)}
                  alt={`Day ${compareAfterDay}`}
                  className="h-full w-auto object-contain rounded-lg"
                />
              ) : (
                <div className="text-center text-zinc-500 text-xs">
                  No {compareAngle} photo uploaded for Day {compareAfterDay} yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MILESTONE CHECK-IN CARDS */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">
          Milestone Photo Check-Ins (7 Sessions)
        </h3>

        {milestones.map((milestone) => (
          <div
            key={milestone.dayNumber}
            className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded bg-lime-400 text-black">
                    DAY {milestone.dayNumber}
                  </span>
                  <h4 className="text-base font-bold text-white">
                    {milestone.notes || `Milestone Check-in`}
                  </h4>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Scheduled Date: <span className="text-zinc-300 font-medium">{milestone.scheduledDate}</span>
                </p>
              </div>

              {milestone.completed && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Check-In Complete</span>
                </span>
              )}
            </div>

            {/* 3 Angles: Front, Side, Back */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ANGLES.map((angle) => {
                const url = getAngleUrl(milestone, angle);
                const isUploadingThis =
                  uploadingAngle?.dayNumber === milestone.dayNumber &&
                  uploadingAngle?.angle === angle;

                return (
                  <div
                    key={angle}
                    className="bg-[#18181b] border border-zinc-800 rounded-xl p-3 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-white uppercase tracking-wider">
                        {angle} Relaxed
                      </span>
                      {url && <span className="text-lime-400 text-[10px] font-bold">Uploaded</span>}
                    </div>

                    <div className="h-48 bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center relative mb-3">
                      {url ? (
                        <img
                          src={url}
                          alt={`${milestone.dayNumber} ${angle}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-3">
                          <Upload className="w-6 h-6 text-zinc-600 mx-auto mb-1" />
                          <p className="text-[11px] text-zinc-500">No {angle} photo</p>
                        </div>
                      )}

                      {isUploadingThis && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-xs text-lime-400 font-mono">
                          Uploading...
                        </div>
                      )}
                    </div>

                    <label className="w-full py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium rounded-lg text-center cursor-pointer transition border border-zinc-700 block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAngleUpload(milestone.dayNumber, angle, e)}
                        className="hidden"
                      />
                      <span>{url ? 'Change Photo' : `Upload ${angle}`}</span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

