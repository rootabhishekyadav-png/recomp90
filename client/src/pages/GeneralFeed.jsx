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
  Download
} from 'lucide-react';
import { photoAPI, getAssetUrl } from '../api/api';
import { useAlert } from '../context/AlertContext';

export default function GeneralFeed() {
  const { showToast, confirm } = useAlert();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('Gym, Pump');

  // Fullscreen preview
  const [activePhoto, setActivePhoto] = useState(null);
  const fileInputRef = useRef(null);

  const fetchPhotos = async () => {
    try {
      const res = await photoAPI.getGeneralFeed();
      if (res.data.success) {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
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
    const formData = new FormData();
    formData.append('photo', selectedFile);
    formData.append('caption', caption || 'Post-workout progress');
    formData.append('tags', tags);

    try {
      const res = await photoAPI.uploadGeneral(formData);
      if (res.data.success) {
        setPhotos([res.data.photo, ...photos]);
        setSelectedFile(null);
        setPreviewUrl('');
        setCaption('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        showToast('Photo uploaded to personal feed!', 'success');
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
      setPhotos(photos.filter((p) => p._id !== id));
      if (activePhoto?._id === id) setActivePhoto(null);
      showToast('Photo removed from feed', 'info');
    } catch (err) {
      showToast('Failed to delete photo', 'error');
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeFormatted = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-lime-400 uppercase tracking-widest">
              <Camera className="w-4 h-4" />
              <span>Personal Gym Feed & Visual Timeline</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              General Fitness Diary & Pump Snaps
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Upload anytime • <span className="text-lime-400 font-semibold">Automatic date & timestamp</span> attached to every photo
            </p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-lime-400" />
            <span>Today: {todayFormatted} • {timeFormatted}</span>
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Upload className="w-4 h-4 text-lime-400" />
          <span>Upload New Gym Photo</span>
        </h3>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            
            {/* File Drag/Click Area */}
            <div className="md:col-span-5">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[160px] ${
                  previewUrl
                    ? 'border-lime-500/50 bg-lime-950/10'
                    : 'border-zinc-700 hover:border-lime-400/60 bg-zinc-900/50 hover:bg-zinc-900'
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
                  <div className="relative w-full h-36">
                    <img
                      src={previewUrl}
                      alt="Upload Preview"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-lime-400 font-medium">
                      Click to change
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 mb-2">
                      <Camera className="w-5 h-5 text-lime-400" />
                    </div>
                    <p className="text-xs font-semibold text-white">Click or tap to choose photo</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Camera snaps, gym selfies, pump pics</p>
                  </>
                )}
              </div>
            </div>

            {/* Inputs: Caption, Tags, Auto-Date Preview */}
            <div className="md:col-span-7 space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Caption / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Hit 60kg Bench Press today! Triceps feeling pumped"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-[#18181b] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Chest, Pump, Post-Workout"
                    className="w-full bg-[#18181b] border border-zinc-700 rounded-xl px-3 py-2 text-white text-xs focus:border-lime-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Automatic Timestamp Preview</label>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-[11px] font-mono text-lime-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{todayFormatted} • {timeFormatted}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-150 glow-lime-sm disabled:opacity-50 cursor-pointer"
              >
                {uploading ? (
                  <span>Uploading with auto timestamp...</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload to Personal Feed</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* Grid of Feed Photos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Uploaded Photos Timeline</span>
            <span className="text-xs font-normal text-zinc-400">({photos.length} photos)</span>
          </h3>
        </div>

        {photos.length === 0 ? (
          <div className="bg-[#131316] border border-zinc-800 rounded-2xl p-12 text-center">
            <Camera className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white">No feed photos uploaded yet</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Whenever you workout or see progress, snap a photo and upload it here. The system will automatically tag it with the exact date and time!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((item) => (
              <div
                key={item._id}
                className="bg-[#131316] border border-zinc-800 rounded-2xl overflow-hidden shadow-lg group hover:border-zinc-700 transition flex flex-col"
              >
                {/* Image Container with Date Badge Overlay */}
                <div className="relative aspect-square overflow-hidden bg-zinc-950">
                  <img
                    src={getAssetUrl(item.imageUrl)}
                    alt={item.caption || 'Gym progress'}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  
                  {/* Automatic Date & Day Badge */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-lime-400 border border-lime-500/30">
                      📅 {item.date}
                    </span>
                    {item.time && (
                      <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[9px] font-mono text-zinc-300">
                        ⏰ {item.time}
                      </span>
                    )}
                  </div>

                  {/* Day Number Pill */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded-md bg-lime-400 text-black font-extrabold text-[10px] shadow">
                      DAY {item.dayNumber || 1}
                    </span>
                  </div>

                  {/* Hover Overlay Buttons */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => setActivePhoto(item)}
                      className="p-2 rounded-xl bg-black/80 text-white hover:text-lime-400 transition cursor-pointer"
                      title="View Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 rounded-xl bg-black/80 text-white hover:text-red-400 transition cursor-pointer"
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

      {/* FULLSCREEN PHOTO PREVIEW MODAL (RENDERED VIA PORTAL) */}
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

