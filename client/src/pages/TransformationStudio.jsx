import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Layers,
  Upload,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Info,
  Maximize2,
  Columns,
  Sparkles,
  X,
  Eye,
  Download,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { photoAPI, getAssetUrl } from '../api/api';
import { compressImage } from '../utils/imageCompressor';
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

  // Fullscreen photo lightbox state (rendered via React Portal)
  const [activePhoto, setActivePhoto] = useState(null); // { url, title, dayNumber, angle, date }
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  const fetchMilestones = async () => {
    try {
      const res = await photoAPI.getMilestones();
      if (res.data?.success && Array.isArray(res.data.milestones)) {
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

  // Lock body scroll and listen for Escape key when lightbox is open
  useEffect(() => {
    if (!activePhoto) return;

    setPhotoLoading(true);
    setPhotoError(false);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActivePhoto(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePhoto]);

  const handleAngleUpload = async (dayNumber, angle, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAngle({ dayNumber, angle });

    try {
      // Compress image on client-side before network upload
      const compressedFile = await compressImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
      const formData = new FormData();
      formData.append('photo', compressedFile);
      formData.append('dayNumber', dayNumber);
      formData.append('angle', angle);

      const res = await photoAPI.uploadMilestone(formData);
      if (res.data?.success) {
        await fetchMilestones();
        showToast(`Day ${dayNumber} (${angle}) photo updated!`, 'success');
      } else {
        showToast(res.data?.message || 'Failed to upload milestone photo', 'error');
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
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span>Loading Transformation Studio...</span>
      </div>
    );
  }

  const beforeObj = milestones.find((m) => m.dayNumber === Number(compareBeforeDay));
  const afterObj = milestones.find((m) => m.dayNumber === Number(compareAfterDay));

  const getAngleUrl = (obj, angle) => {
    if (!obj) return '';
    let raw = '';
    if (angle === 'front') raw = obj.frontUrl;
    else if (angle === 'side') raw = obj.sideUrl;
    else if (angle === 'back') raw = obj.backUrl;
    return getAssetUrl(raw);
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

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-lime-400/10 text-lime-400 border border-lime-400/30 font-semibold font-mono">
              7 Check-In Milestones
            </span>
          </div>
        </div>
      </div>

      {/* Guidelines Box */}
      <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-xs text-zinc-400 flex items-start gap-3">
        <Info className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Guidelines for Standardized Photos:</p>
          <p>• Wear identical clothing, relaxed posture, same distance and camera height.</p>
          <p>• Take photos in the morning after using the bathroom and before breakfast or water.</p>
          <p>• <span className="text-lime-300 font-medium">Tip:</span> Tap any uploaded photo to view in high-resolution full screen without cropping.</p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. BEFORE & AFTER COMPARISON VISUALIZER                   */}
      {/* ======================================================== */}
      <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80 mb-4">
          <div className="flex items-center gap-2">
            <Columns className="w-5 h-5 text-lime-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Before & After Visualizer
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
            <div
              className={`h-80 bg-zinc-950 flex items-center justify-center p-2 relative group ${
                getAngleUrl(beforeObj, compareAngle) ? 'cursor-pointer' : ''
              }`}
              onClick={() => {
                const url = getAngleUrl(beforeObj, compareAngle);
                if (url) {
                  setActivePhoto({
                    url,
                    title: `Day ${compareBeforeDay} • ${compareAngle.toUpperCase()} RELAXED (Before)`,
                    dayNumber: compareBeforeDay,
                    angle: compareAngle,
                    date: beforeObj?.scheduledDate
                  });
                }
              }}
            >
              {getAngleUrl(beforeObj, compareAngle) ? (
                <>
                  <img
                    src={getAngleUrl(beforeObj, compareAngle)}
                    alt={`Day ${compareBeforeDay}`}
                    className="h-full w-auto object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
                    <div className="p-2.5 rounded-xl bg-black/80 border border-white/20 text-lime-400 shadow-xl flex items-center gap-1.5 text-xs font-semibold">
                      <Maximize2 className="w-4 h-4" />
                      <span>View Full Photo</span>
                    </div>
                  </div>
                </>
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
            <div
              className={`h-80 bg-zinc-950 flex items-center justify-center p-2 relative group ${
                getAngleUrl(afterObj, compareAngle) ? 'cursor-pointer' : ''
              }`}
              onClick={() => {
                const url = getAngleUrl(afterObj, compareAngle);
                if (url) {
                  setActivePhoto({
                    url,
                    title: `Day ${compareAfterDay} • ${compareAngle.toUpperCase()} RELAXED (After)`,
                    dayNumber: compareAfterDay,
                    angle: compareAngle,
                    date: afterObj?.scheduledDate
                  });
                }
              }}
            >
              {getAngleUrl(afterObj, compareAngle) ? (
                <>
                  <img
                    src={getAngleUrl(afterObj, compareAngle)}
                    alt={`Day ${compareAfterDay}`}
                    className="h-full w-auto object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
                    <div className="p-2.5 rounded-xl bg-black/80 border border-white/20 text-lime-400 shadow-xl flex items-center gap-1.5 text-xs font-semibold">
                      <Maximize2 className="w-4 h-4" />
                      <span>View Full Photo</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-zinc-500 text-xs">
                  No {compareAngle} photo uploaded for Day {compareAfterDay} yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MILESTONE CHECK-IN CARDS (7 SESSIONS)                 */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Milestone Photo Check-Ins (7 Sessions)</span>
          </h3>
          <span className="text-xs text-lime-400 font-mono">
            Click any photo to open full uncropped view
          </span>
        </div>

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
                    className="bg-[#18181c] border border-zinc-800 rounded-xl p-3 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-white uppercase tracking-wider">
                        {angle} Relaxed
                      </span>
                      {url && (
                        <span className="text-lime-400 text-[10px] font-bold px-1.5 py-0.5 rounded bg-lime-400/10 border border-lime-400/20">
                          Uploaded
                        </span>
                      )}
                    </div>

                    {/* Image Preview Box - Uncropped object-contain with full view trigger */}
                    <div
                      className={`h-64 sm:h-72 bg-gradient-to-b from-zinc-950 to-zinc-900 border border-zinc-800/80 rounded-xl overflow-hidden flex items-center justify-center relative mb-3 group ${
                        url ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => {
                        if (url) {
                          setActivePhoto({
                            url,
                            title: `Day ${milestone.dayNumber} • ${angle.toUpperCase()} RELAXED`,
                            dayNumber: milestone.dayNumber,
                            angle,
                            date: milestone.scheduledDate
                          });
                        }
                      }}
                    >
                      {url ? (
                        <>
                          <img
                            src={url}
                            alt={`${milestone.dayNumber} ${angle}`}
                            className="h-full w-full object-contain p-1 transition-transform duration-200 group-hover:scale-102"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const errDiv = document.createElement('div');
                                errDiv.className = 'text-center p-3 text-red-400 text-xs';
                                errDiv.innerHTML = 'Photo failed to load.<br/><span class="text-zinc-500 text-[10px]">Tap to retry</span>';
                                parent.appendChild(errDiv);
                              }
                            }}
                          />

                          {/* Hover Overlay with Maximize icon */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col items-center justify-center gap-2 text-white">
                            <div className="p-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-lime-400 shadow-xl flex items-center gap-1.5">
                              <Maximize2 className="w-4 h-4 stroke-[2.2]" />
                              <span className="text-xs font-bold tracking-wide">
                                Open Full Photo
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-300 font-mono">
                              Click to see uncropped
                            </span>
                          </div>

                          {/* Top-right zoom pill always visible */}
                          <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-lime-400 border border-white/10 flex items-center gap-1 text-[10px] font-semibold">
                            <Maximize2 className="w-3 h-3" />
                            <span>Full View</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-3">
                          <Upload className="w-6 h-6 text-zinc-600 mx-auto mb-1" />
                          <p className="text-[11px] text-zinc-500">No {angle} photo</p>
                        </div>
                      )}

                      {isUploadingThis && (
                        <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-xs text-lime-400 font-mono gap-2">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Uploading to CDN...</span>
                        </div>
                      )}
                    </div>

                    <label className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold rounded-lg text-center cursor-pointer transition border border-zinc-700 block">
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

      {/* ======================================================== */}
      {/* 3. FULLSCREEN LIGHTBOX MODAL (RENDERED VIA PORTAL)       */}
      {/* ======================================================== */}
      {activePhoto &&
        createPortal(
          <div
            className="fixed inset-0 w-screen h-screen z-[99999] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-6 select-none animate-in fade-in duration-200"
            onClick={() => setActivePhoto(null)}
          >
            {/* Top Navigation & Info Bar */}
            <div
              className="w-full max-w-6xl mx-auto flex items-center justify-between pb-3 border-b border-zinc-800/80 px-2 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="px-3 py-1 rounded-lg bg-lime-400 text-black font-black text-xs font-mono uppercase tracking-wider">
                  DAY {activePhoto.dayNumber}
                </span>
                <span className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                  {activePhoto.angle} RELAXED
                </span>
                {activePhoto.date && (
                  <span className="text-xs text-zinc-400 hidden sm:inline font-mono">
                    • Date: {activePhoto.date}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Download original button */}
                <a
                  href={activePhoto.url}
                  target="_blank"
                  rel="noreferrer"
                  download={`recomp90_day${activePhoto.dayNumber}_${activePhoto.angle}.jpg`}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-zinc-700"
                  title="Open Original High-Res Photo"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4 text-lime-400" />
                  <span className="hidden sm:inline">Save Image</span>
                </a>

                {/* Close Button */}
                <button
                  onClick={() => setActivePhoto(null)}
                  className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition cursor-pointer border border-red-500/30 flex items-center gap-1.5 text-xs font-bold"
                  title="Close (ESC)"
                >
                  <X className="w-4 h-4" />
                  <span>Close (ESC)</span>
                </button>
              </div>
            </div>

            {/* Main Center Image Display */}
            <div
              className="flex-1 w-full max-w-6xl mx-auto flex items-center justify-center p-2 sm:p-4 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Spinner while loading */}
              {photoLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-lime-400 font-mono text-sm gap-2">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span>Loading full resolution photo...</span>
                </div>
              )}

              {/* Error fallback */}
              {photoError ? (
                <div className="text-center p-8 bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md">
                  <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                  <h4 className="text-white font-bold text-base mb-1">Photo Failed to Display</h4>
                  <p className="text-xs text-zinc-400 mb-4">
                    The photo URL could not be loaded. Check your network connection or verify ImageKit CDN settings.
                  </p>
                  <a
                    href={activePhoto.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-4 py-2 bg-lime-400 text-black text-xs font-bold rounded-xl"
                  >
                    Open URL in New Tab
                  </a>
                </div>
              ) : (
                <img
                  src={activePhoto.url}
                  alt={activePhoto.title}
                  onLoad={() => setPhotoLoading(false)}
                  onError={() => {
                    setPhotoLoading(false);
                    setPhotoError(true);
                  }}
                  className={`max-h-[82vh] max-w-full w-auto object-contain rounded-2xl shadow-2xl transition-opacity duration-200 ${
                    photoLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              )}
            </div>

            {/* Bottom Footer Info */}
            <div
              className="w-full max-w-6xl mx-auto pt-2 border-t border-zinc-800/80 px-2 flex items-center justify-between text-[11px] text-zinc-500 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Tap anywhere outside the photo or press ESC to return</span>
              <span className="font-mono text-lime-400/80">RECOMP 90 TRANSFORMATION STUDIO</span>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
