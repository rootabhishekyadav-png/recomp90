import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { authAPI } from '../api/api';

export default function Login({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isError, setIsError] = useState(false); // Triggers the 2x red blink
  const [isSuccess, setIsSuccess] = useState(false);
  const [lockedCooldown, setLockedCooldown] = useState(0);

  const inputRef = useRef(null);
  const failCountRef = useRef(0);

  // Auto focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (lockedCooldown > 0) {
      const timer = setInterval(() => {
        setLockedCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockedCooldown]);

  // Handle password verification
  const verifyPassword = async (passToVerify) => {
    if (isVerifying || lockedCooldown > 0) return;
    setIsVerifying(true);

    try {
      const res = await authAPI.unlock(passToVerify);
      if (res.data.success) {
        setIsSuccess(true);
        localStorage.setItem('recomp_token', res.data.token);
        if (res.data.profile) {
          localStorage.setItem('recomp_profile', JSON.stringify(res.data.profile));
        }
        setTimeout(() => {
          onUnlock(res.data.profile);
        }, 350);
      } else {
        triggerRedBlink();
      }
    } catch (err) {
      triggerRedBlink();
    } finally {
      setIsVerifying(false);
    }
  };

  // Trigger 2x Red Blink + Shake, then clear input
  const triggerRedBlink = () => {
    setIsError(true);
    failCountRef.current += 1;

    // After 2 red blinks (~700ms), clear input & re-focus
    setTimeout(() => {
      setIsError(false);
      setPassword('');

      // If failed 5 times, lock for 30s
      if (failCountRef.current >= 5) {
        setLockedCooldown(30);
        failCountRef.current = 0;
      } else {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }, 700);
  };

  const handleInputChange = (e) => {
    if (isVerifying || lockedCooldown > 0 || isError) return;
    const value = e.target.value;
    setPassword(value);

    // EXACT REQUIREMENT: Minimum 14 characters entered -> immediately check!
    if (value.length >= 14) {
      verifyPassword(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (password.length >= 14) {
        verifyPassword(password);
      } else if (password.length > 0) {
        // Less than 14 characters entered -> instant red blink reject
        triggerRedBlink();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#000000] flex items-center justify-center select-none overflow-hidden"
      onClick={() => inputRef.current && inputRef.current.focus()}
    >
      {/* 
        PURE STEALTH BLACK VAULT
        Zero logos, Zero headers, Zero buttons, Zero labels, Zero clutter.
        Fully locked aesthetic.
      */}
      <motion.div
        animate={
          isError
            ? {
                x: [0, -10, 10, -8, 8, -4, 4, 0],
                transition: { duration: 0.65 }
              }
            : {}
        }
        className="w-full flex flex-col items-center justify-center px-4"
      >
        <motion.div
          animate={
            isError
              ? {
                  borderColor: [
                    '#27272a',
                    '#ef4444',
                    '#18181b',
                    '#ef4444',
                    '#27272a'
                  ],
                  boxShadow: [
                    '0 0 0px rgba(0,0,0,0)',
                    '0 0 25px rgba(239,68,68,0.7)',
                    '0 0 0px rgba(0,0,0,0)',
                    '0 0 25px rgba(239,68,68,0.7)',
                    '0 0 0px rgba(0,0,0,0)'
                  ],
                  transition: { duration: 0.65 }
                }
              : isSuccess
              ? {
                  borderColor: '#a3e635',
                  boxShadow: '0 0 30px rgba(163,230,53,0.5)',
                  transition: { duration: 0.3 }
                }
              : {}
          }
          className={`w-64 sm:w-72 bg-[#09090c] border rounded-2xl transition-all duration-200 relative ${
            isError
              ? 'border-red-500'
              : isSuccess
              ? 'border-lime-400'
              : 'border-zinc-800/80 focus-within:border-zinc-600 focus-within:shadow-[0_0_15px_rgba(255,255,255,0.05)]'
          }`}
        >
          <input
            ref={inputRef}
            type="password"
            autoComplete="off"
            spellCheck="false"
            autoFocus
            disabled={isVerifying || lockedCooldown > 0}
            value={password}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={lockedCooldown > 0 ? `LOCKED (${lockedCooldown}s)` : ''}
            className="w-full bg-transparent text-center text-white text-base tracking-[0.35em] py-3.5 px-4 focus:outline-none placeholder-zinc-700 disabled:opacity-40 font-mono"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
