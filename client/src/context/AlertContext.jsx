import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Trash2,
  AlertCircle
} from 'lucide-react';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null); // { isOpen, title, message, confirmText, cancelText, danger, resolve }

  // Show Toast
  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Show Confirmation Modal (returns Promise<boolean>)
  const confirm = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    danger = true
  } = {}) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        danger,
        resolve
      });
    });
  }, []);

  const handleConfirm = () => {
    if (confirmDialog?.resolve) confirmDialog.resolve(true);
    setConfirmDialog(null);
  };

  const handleCancel = () => {
    if (confirmDialog?.resolve) confirmDialog.resolve(false);
    setConfirmDialog(null);
  };

  return (
    <AlertContext.Provider value={{ showToast, confirm }}>
      {children}

      {/* TOAST NOTIFICATION CONTAINER (TOP-CENTER ON MOBILE, TOP-RIGHT ON DESKTOP) */}
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 pointer-events-none flex flex-col gap-2.5">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isInfo = toast.type === 'info';

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto rounded-2xl p-4 shadow-2xl border backdrop-blur-xl flex items-start gap-3 relative overflow-hidden ${
                  isSuccess
                    ? 'bg-[#121812]/95 border-lime-500/40 text-white shadow-[0_8px_30px_rgba(163,230,53,0.18)]'
                    : isError
                    ? 'bg-[#1c1214]/95 border-red-500/40 text-white shadow-[0_8px_30px_rgba(239,68,68,0.2)]'
                    : 'bg-[#13161c]/95 border-sky-500/40 text-white shadow-[0_8px_30px_rgba(56,189,248,0.18)]'
                }`}
              >
                {/* Left Icon */}
                <div className="shrink-0 mt-0.5">
                  {isSuccess && (
                    <div className="w-7 h-7 rounded-xl bg-lime-400/20 border border-lime-400/40 flex items-center justify-center text-lime-400">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  )}
                  {isError && (
                    <div className="w-7 h-7 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                      <AlertCircle className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  )}
                  {isInfo && (
                    <div className="w-7 h-7 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                      <Info className="w-4 h-4 stroke-[2.5]" />
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-xs font-semibold leading-relaxed tracking-wide">
                    {toast.message}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 p-1 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* CUSTOM CONFIRMATION MODAL (REPLACES BROWSER window.confirm) */}
      <AnimatePresence>
        {confirmDialog && confirmDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
              className="bg-[#15151a] border border-zinc-800 rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative"
            >
              <div className="flex items-start gap-3.5 mb-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                  confirmDialog.danger
                    ? 'bg-red-500/15 border-red-500/30 text-red-400'
                    : 'bg-lime-400/15 border-lime-400/30 text-lime-400'
                }`}>
                  {confirmDialog.danger ? (
                    <Trash2 className="w-5 h-5 stroke-[2.2]" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {confirmDialog.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {confirmDialog.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1f1f26] hover:bg-[#282832] text-zinc-300 border border-zinc-700/80 transition cursor-pointer"
                >
                  {confirmDialog.cancelText}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    confirmDialog.danger
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                      : 'bg-lime-400 hover:bg-lime-300 text-black shadow-lg shadow-lime-400/30'
                  }`}
                >
                  {confirmDialog.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

