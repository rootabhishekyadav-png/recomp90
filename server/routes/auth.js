const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'recomp_secret_master_key_90days_2026_abhilx_yadav';
const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'Abhilx@Yadavji';

// In-Memory IP Brute Force Protection (5 attempts per 10 minutes)
const loginAttempts = new Map(); // ip -> { count, lockedUntil }

function checkRateLimit(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };

  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingSeconds };
  }

  // Reset if lock period expired
  if (record.lockedUntil && now >= record.lockedUntil) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0 };
  record.count += 1;

  if (record.count >= 5) {
    // Lock for 10 minutes
    record.lockedUntil = now + 10 * 60 * 1000;
  }
  loginAttempts.set(ip, record);
}

function clearAttempts(ip) {
  loginAttempts.delete(ip);
}

// Timing-safe constant-time password verification
function safeCompare(input, expected) {
  if (typeof input !== 'string' || typeof expected !== 'string') return false;
  const inputBuf = Buffer.from(input);
  const expectedBuf = Buffer.from(expected);
  if (inputBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(inputBuf, expectedBuf);
}

// Strict Master Password Unlock - Ultra Secure
router.post('/unlock', async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  try {
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Locked for ${rateCheck.remainingSeconds}s.`
      });
    }

    const { password } = req.body;

    // Minimum 14 characters requirement
    if (!password || typeof password !== 'string' || password.length < 14) {
      recordFailedAttempt(clientIp);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // STRICT TIMING-SAFE PASSWORD VERIFICATION
    const isMatch = safeCompare(password, MASTER_PASSWORD);
    if (!isMatch) {
      recordFailedAttempt(clientIp);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Password valid -> Clear failed attempts
    clearAttempts(clientIp);

    // Find or create default athlete profile
    let user = await User.findOne();
    if (!user) {
      const hashedPassword = await bcrypt.hash(MASTER_PASSWORD, 12);
      user = await User.create({
        email: 'abhilx@recomp.local',
        password: hashedPassword,
        profile: {
          name: 'Abhishek',
          age: 21,
          height: 168,
          startingWeight: 80.0,
          startingWaist: 101.0,
          startingChest: 95.0,
          startingBiceps: 30.0,
          targetCalories: 2000,
          targetProtein: 130,
          targetFat: 70,
          targetCarbs: 288,
          startDate: new Date('2026-11-13T00:00:00.000Z')
        }
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: 'owner' },
      JWT_SECRET,
      { expiresIn: '90d' }
    );

    res.json({
      success: true,
      message: 'Access granted.',
      token,
      profile: user.profile
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, message: 'Authentication error' });
  }
});

// Verify token
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: user });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
});

module.exports = router;
