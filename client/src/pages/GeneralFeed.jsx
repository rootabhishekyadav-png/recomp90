import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  Upload,
  Calendar,
  Clock,
  Trash2,
  Sparkles,
  Maximize2,
  X,
  Tag,
  Flame,
  CheckCircle2,
  Download,
  Plus,
  Loader2,
  Zap
} from 'lucide-react';
import { photoAPI, getAssetUrl } from '../api/api';
import { compressImage } from '../utils/imageCompressor';
import { useAlert } from '../context/AlertContext';

export default function GeneralFeed() {
  const { showToast, confirm } = useAlert();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Popup Modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('Gym, Pump');

  // Fullscreen photo lightbox
  const [activePhoto, setActivePhoto] = useState(null);
  const fileInputRef = useRef(null);

  // Real-time live device clock for the upload popup
  const [liveTime, setLiveTime] = useState(() => ({
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime({
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchPhotos = async () => {
    try {
      const res = await photoAPI.getGeneralFeed();
      if (res.data?.success && Array.isArray(res.data.photos)) {
        setPhotos(res.data.photos);
      }
    } catch (err) {
      console.error('Fetch feed error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Lock body scroll when upload modal or lightbox is open
  useEffect(() => {
    const isModalActive = isUploadOpen || Boolean(activePhoto);
    const prevOverflow = document.body.style.overflow;
    if (isModalActive) {
      document.body.style.overflow = 'hidden';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activePhoto) setActivePhoto(null);
        else if (isUploadOpen) setIsUploadOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUploadOpen, activePhoto]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a photo first', 'info');
      return;
    }

    setUploading(true);

    try {
      // 1. Client-Side Image Compression before network upload
      const compressedFile = await compressImage(selectedFile, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82
      });

      // 2. Accurate client device date & time (India / Local time)
      const clientDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const clientTime = new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const formData = new FormData();
      formData.append('photo', compressedFile);
      formData.append('caption', caption.trim() || 'Post-workout progress');
      formData.append('tags', tags);
      formData.append('clientDate', clientDate);
      formData.append('clientTime', clientTime);

      const res = await photoAPI.uploadGeneral(formData);
      if (res.data?.success) {
        setPhotos([res.data.photo, ...photos]);
        setSelectedFile(null);
        setPreviewUrl('');
        setCaption('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsUploadOpen(false);
        showToast('Photo uploaded with accurate timestamp!', 'success');
      } else {
        showToast(res.data?.message || 'Photo upload failed', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Photo upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Delete Photo?',
      message: 'Are you sure you want to delete this photo from your feed? This action cannot be undone.',
      confirmText: 'Delete Photo',
      danger: true
    });
    if (!ok) return;

    try {
      await photoAPI.deleteGeneral(id);
      setPhotos((prev) => prev.filter((p) => p._id !== id));
      if (activePhoto?._id === id) setActivePhoto(null);
      showToast('Photo removed from feed', 'info');
    } catch (err) {
      showToast('Failed to delete photo', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-lime-400 font-mono text-sm">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span>Loading Photo Timeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Sleek Mobile-First Header Bar (Single compact line, never wraps awkwardly) */}
      <div className="bg-[#131316]/90 backdrop-blur-md border border-zinc-800/80 rounded-2xl px-3.5 py-2.5 sm:px-5 sm:py-3.5 shadow-lg flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 shrink-0 shadow-[0_0_12px_rgba(163,230,53,0.15)]">
            <Camera className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                Photo Feed
              </h1>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-lime-400 font-mono font-bold border border-lime-400/20 shrink-0">
                {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-zinc-400 truncate hidden sm:block">
              Auto-timestamped workout timeline
            </p>
          </div>
        </div>

        {/* Compact, Ultra-clean Action Button */}
        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-extrabold text-xs flex items-center gap-1.5 transition duration-150 shadow-[0_0_16px_rgba(163,230,53,0.35)] cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.8]" />
          <span>Upload</span>
        </button>
      </div>

      {/* Grid of Feed Photos */}
      <div>
        {photos.length === 0 ? (
          <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
              <Camera className="w-8 h-8 text-zinc-600" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">No Feed Photos Uploaded Yet</h4>
            <p className="text-xs text-zinc-400 mb-5 max-w-sm">
              Capture your gym sessions, post-workout pumps, or check-ins. Every photo is automatically timestamped and compressed!
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs flex items-center gap-2 transition glow-lime-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Upload First Photo</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((item) => (
              <div
                key={item._id}
                className="bg-[#131316] border border-zinc-800 rounded-2xl overflow-hidden shadow-lg group hover:border-zinc-700 transition flex flex-col"
              >
                {/* Image Container with Date Badge Overlay */}
                <div
                  className="relative aspect-square overflow-hidden bg-zinc-950 cursor-pointer"
                  onClick={() => setActivePhoto(item)}
                >
                  <img
                    src={getAssetUrl(item.imageUrl)}
                    alt={item.caption || 'Gym progress'}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const err = document.createElement('div');
                        err.className = 'w-full h-full flex items-center justify-center text-zinc-500 text-xs text-center p-3';
                        err.innerText = 'Photo preview unavailable';
                        parent.appendChild(err);
                      }
                    }}
                  />

                  {/* Automatic Date & Day Badge */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[10px] font-mono font-bold text-lime-400 border border-lime-500/30 shadow">
                      📅 {item.date}
                    </span>
                    {item.time && (
                      <span className="px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[9px] font-mono text-zinc-300 shadow">
                        ⏰ {item.time}
                      </span>
                    )}
                  </div>

                  {/* Day Number Pill */}
                  <div className="absolute top-2 right-2 pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md bg-lime-400 text-black font-extrabold text-[10px] shadow">
                      DAY {item.dayNumber || 1}
                    </span>
                  </div>

                  {/* Hover Overlay Buttons */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhoto(item);
                      }}
                      className="p-2.5 rounded-xl bg-black/80 text-white hover:text-lime-400 transition cursor-pointer border border-white/10"
                      title="View Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item._id);
                      }}
                      className="p-2.5 rounded-xl bg-black/80 text-white hover:text-red-400 transition cursor-pointer border border-white/10"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Caption & Meta */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-white font-medium line-clamp-2">
                    {item.caption || 'Gym progress snapshot'}
                  </p>

                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    {item.tags?.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (+ Button for Mobile) - PORTAL RENDERED */}
      {!isUploadOpen &&
        !activePhoto &&
        createPortal(
          <button
            onClick={() => setIsUploadOpen(true)}
            className="fixed bottom-20 right-4 lg:hidden z-40 w-13 h-13 rounded-full bg-lime-400 hover:bg-lime-300 text-black shadow-[0_8px_25px_rgba(163,230,53,0.5)] flex items-center justify-center cursor-pointer active:scale-90 transition-all duration-200 border-2 border-black/25"
            title="Upload Gym Photo"
            aria-label="Upload Gym Photo"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>,
          document.body
        )}

      {/* ======================================================== */}
      {/* UPLOAD MODAL POPUP (RENDERED VIA PORTAL)                */}
      {/* ======================================================== */}
      {isUploadOpen &&
        createPortal(
          <div
            className="fixed inset-0 w-screen h-screen z-[99999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-150"
            onClick={() => !uploading && setIsUploadOpen(false)}
          >
            <div
              className="max-w-lg w-full bg-[#18181b] border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-150 max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Upload New Gym Photo
                    </h3>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Live Timestamp: <span className="text-lime-400 font-mono font-medium">{liveTime.date} • {liveTime.time}</span>
                  </p>
                </div>

                <button
                  disabled={uploading}
                  onClick={() => setIsUploadOpen(false)}
                  className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer border border-zinc-700 disabled:opacity-40"
                  title="Close (ESC)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleUploadSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
                {/* File Drop/Chooser Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[170px] ${
                    previewUrl
                      ? 'border-lime-500/60 bg-lime-950/20'
                      : 'border-zinc-700 hover:border-lime-400/60 bg-zinc-900/60 hover:bg-zinc-900'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {previewUrl ? (
                    <div className="relative w-full h-44">
                      <img
                        src={previewUrl}
                        alt="Upload Preview"
                        className="w-full h-full object-contain rounded-xl"
                      />
                      <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 text-[10px] text-lime-400 font-semibold border border-lime-400/30">
                        Tap to change photo
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lime-400 mb-2">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-white">Click or tap to choose photo</p>
                      <p className="text-[11px] text-zinc-400 mt-1">Gym selfies, physique updates, pump pics</p>
                      <span className="mt-2 text-[10px] text-lime-400/90 font-mono bg-lime-950/40 px-2 py-0.5 rounded border border-lime-500/20">
                        ⚡ Auto-compressed (~95% smaller & fast upload)
                      </span>
                    </>
                  )}
                </div>

                {/* Caption Input */}
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Caption / Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Hit 60kg Bench Press today! Triceps feeling pumped"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:border-lime-400 focus:outline-none"
                  />
                </div>

                {/* Tags & Timestamp Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1 font-medium">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Chest, Pump, Post-Workout"
                      className="w-full bg-[#131316] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:border-lime-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1 font-medium">Automatic Date Stamp</label>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-[11px] font-mono text-lime-400 flex items-center gap-1.5 h-[34px]">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{liveTime.date} • {liveTime.time}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 transition duration-150 glow-lime-sm disabled:opacity-50 cursor-pointer shadow-lg active:scale-98"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Compressing & Uploading Photo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 stroke-[2.5]" />
                      <span>Upload to Timeline</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ======================================================== */}
      {/* FULLSCREEN PHOTO PREVIEW MODAL (RENDERED VIA PORTAL)     */}
      {/* ======================================================== */}
      {activePhoto &&
        createPortal(
          <div
            className="fixed inset-0 w-screen h-screen z-[99999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200"
            onClick={() => setActivePhoto(null)}
          >
            <div
              className="max-w-4xl w-full bg-[#18181b] border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/80 text-zinc-300 hover:text-white transition cursor-pointer border border-zinc-700"
                title="Close (ESC)"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-h-[75vh] bg-black flex items-center justify-center overflow-hidden p-2">
                <img
                  src={getAssetUrl(activePhoto.imageUrl)}
                  alt={activePhoto.caption}
                  className="max-h-[72vh] w-auto object-contain rounded-lg"
                />
              </div>

              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-lime-400 bg-lime-950/40 border border-lime-500/30 px-2 py-0.5 rounded">
                      Day {activePhoto.dayNumber} • {activePhoto.date} at {activePhoto.time}
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium">{activePhoto.caption}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={getAssetUrl(activePhoto.imageUrl)}
                    target="_blank"
                    rel="noreferrer"
                    download="gym_progress.jpg"
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition border border-zinc-700"
                  >
                    <Download className="w-3.5 h-3.5 text-lime-400" />
                    <span>Save</span>
                  </a>
                  <button
                    onClick={() => {
                      const id = activePhoto._id;
                      setActivePhoto(null);
                      handleDelete(id);
                    }}
                    className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900 border border-red-500/40 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
