const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'recomp_secret_master_key_90days_2026_abhilx_yadav';
const MASTER_PASSWORD = process.env.MASTER_PASSWORD || 'Abhilx@Yadavji';

// Strict Master Password Unlock - No bypasses!
router.post('/unlock', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // STRICT PASSWORD CHECK: No bypass allowed
    if (password !== MASTER_PASSWORD) {
      return res.status(401).json({ success: false, message: 'Incorrect master password. Access denied.' });
    }

    // Find or create default athlete profile
    let user = await User.findOne();
    if (!user) {
      const hashedPassword = await bcrypt.hash(MASTER_PASSWORD, 10);
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
          targetCalories: 2300,
          targetProtein: 130,
          targetFat: 70,
          targetCarbs: 288,
          startDate: new Date('2026-11-13T00:00:00.000Z')
        }
      });
    }

    const token = jwt.sign({ userId: user._id, role: 'owner' }, JWT_SECRET, { expiresIn: '90d' });

    res.json({
      success: true,
      message: 'Access granted! Welcome to your Fitness OS.',
      token,
      profile: user.profile
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, message: 'Server error during authentication' });
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
