const express = require('express');
const router = express.Router();
const upload = require('../utils/uploader');
const { uploadToImageKit } = require('../utils/imagekit');
const GeneralPhoto = require('../models/GeneralPhoto');
const TransformationPhoto = require('../models/TransformationPhoto');

function getDayNumber(startDateStr) {
  const start = new Date(startDateStr || '2026-11-13');
  const now = new Date();
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(diffDays, 1), 90);
}

// Seed default transformation milestones (Days 1, 15, 30, 45, 60, 75, 90)
async function initMilestones() {
  const count = await TransformationPhoto.countDocuments();
  if (count === 0) {
    const milestones = [
      { dayNumber: 1, scheduledDate: '2026-11-13', notes: 'Baseline Starting Condition' },
      { dayNumber: 15, scheduledDate: '2026-11-27', notes: 'First 2-Week Check-in' },
      { dayNumber: 30, scheduledDate: '2026-12-12', notes: '1-Month Recomp Milestone' },
      { dayNumber: 45, scheduledDate: '2026-12-27', notes: 'Midway Check-in' },
      { dayNumber: 60, scheduledDate: '2027-01-11', notes: '2-Month Recomp Milestone' },
      { dayNumber: 75, scheduledDate: '2027-01-26', notes: 'Final Phase Check-in' },
      { dayNumber: 90, scheduledDate: '2027-02-10', notes: 'Final 90-Day Transformation Result' }
    ];
    await TransformationPhoto.insertMany(milestones);
  }
}
initMilestones().catch(err => console.error('Milestone init error:', err));

// ==========================================
// 1. GENERAL PHOTO FEED (AUTO-DATE & TIME)
// ==========================================

// GET /api/photos/general - Get all feed photos sorted by date desc
router.get('/general', async (req, res) => {
  try {
    const photos = await GeneralPhoto.find().sort({ createdAt: -1 });
    res.json({ success: true, photos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch photos' });
  }
});

// POST /api/photos/general/upload - Upload general photo with auto-timestamp & ImageKit CDN
router.post('/general/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo uploaded' });
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const dayNumber = getDayNumber('2026-11-13');

    // Default local path
    let imageUrl = `/uploads/${req.file.filename}`;

    // Upload to ImageKit Cloud CDN if configured
    const cloudUrl = await uploadToImageKit(req.file.path, req.file.filename, '/gym_feed');
    if (cloudUrl) {
      imageUrl = cloudUrl;
    }

    const caption = req.body.caption || 'Gym Progress';
    const tags = req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : ['Gym', 'Recomp'];

    const newPhoto = await GeneralPhoto.create({
      imageUrl,
      caption,
      date: dateStr,
      time: timeStr,
      dayNumber,
      tags
    });

    res.json({
      success: true,
      message: 'Photo uploaded with auto-date stamp!',
      photo: newPhoto,
      storage: cloudUrl ? 'ImageKit CDN' : 'Local Storage'
    });
  } catch (error) {
    console.error('General photo upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

// DELETE /api/photos/general/:id
router.delete('/general/:id', async (req, res) => {
  try {
    await GeneralPhoto.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Photo deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete photo' });
  }
});

// ==========================================
// 2. TRANSFORMATION PHOTOS (DAY 1, 15, 30...)
// ==========================================

// GET /api/photos/transformation
router.get('/transformation', async (req, res) => {
  try {
    const milestones = await TransformationPhoto.find().sort({ dayNumber: 1 });
    res.json({ success: true, milestones });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch milestones' });
  }
});

// POST /api/photos/transformation/upload - Upload milestone photo (angle: front, side, or back)
router.post('/transformation/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo provided' });
    }

    const { dayNumber, angle, notes } = req.body;
    if (!dayNumber || !angle) {
      return res.status(400).json({ success: false, message: 'Day number and angle (front/side/back) are required' });
    }

    // Default local path
    let imageUrl = `/uploads/${req.file.filename}`;

    // Upload to ImageKit Cloud CDN if configured
    const cloudUrl = await uploadToImageKit(req.file.path, req.file.filename, `/transformations/day_${dayNumber}`);
    if (cloudUrl) {
      imageUrl = cloudUrl;
    }

    const updateField = {};
    if (angle === 'front') updateField.frontUrl = imageUrl;
    if (angle === 'side') updateField.sideUrl = imageUrl;
    if (angle === 'back') updateField.backUrl = imageUrl;
    if (notes) updateField.notes = notes;

    const milestone = await TransformationPhoto.findOneAndUpdate(
      { dayNumber: Number(dayNumber) },
      { $set: updateField, completed: true },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `${angle.toUpperCase()} photo uploaded for Day ${dayNumber}!`,
      milestone,
      storage: cloudUrl ? 'ImageKit CDN' : 'Local Storage'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Transformation photo upload failed' });
  }
});

module.exports = router;
