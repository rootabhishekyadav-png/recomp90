const express = require('express');
const router = express.Router();
const BodyMeasurement = require('../models/BodyMeasurement');

const BASELINE = { weight: 80.0, waist: 101.0, chest: 95.0, biceps: 30.0 };

// GET /api/measurements - All measurements sorted by date
router.get('/', async (req, res) => {
  try {
    const measurements = await BodyMeasurement.find().sort({ date: 1 });
    res.json({ success: true, measurements, baseline: BASELINE });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch measurements' });
  }
});

// POST /api/measurements - Add or update measurement (Zero restrictions!)
router.post('/', async (req, res) => {
  try {
    const { date, weight, waist, chest, bicepsLeft, bicepsRight, thighs, hips, notes } = req.body;
    if (!date || weight === undefined || waist === undefined) {
      return res.status(400).json({ success: false, message: 'Date, weight, and waist are required' });
    }

    const w = Number(weight);
    const wst = Number(waist);
    const ch = Number(chest || 0);
    const bL = Number(bicepsLeft || 0);
    const bR = Number(bicepsRight || 0);
    const th = Number(thighs || 0);
    const hp = Number(hips || 0);

    const weightDiff = +(w - BASELINE.weight).toFixed(2);
    const waistDiff = +(wst - BASELINE.waist).toFixed(2);
    const chestDiff = ch > 0 ? +(ch - BASELINE.chest).toFixed(2) : 0;
    const avgBicep = (bL || bR) ? (bL && bR ? (bL + bR) / 2 : bL || bR) : 0;
    const bicepsDiff = avgBicep > 0 ? +(avgBicep - BASELINE.biceps).toFixed(2) : 0;

    const measurement = await BodyMeasurement.findOneAndUpdate(
      { date },
      {
        date,
        weight: w,
        waist: wst,
        chest: ch,
        bicepsLeft: bL,
        bicepsRight: bR,
        thighs: th,
        hips: hp,
        weightDiff,
        waistDiff,
        chestDiff,
        bicepsDiff,
        notes: notes || ''
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Measurement recorded!', measurement });
  } catch (error) {
    console.error('Measurement error:', error);
    res.status(500).json({ success: false, message: 'Failed to record measurement' });
  }
});

// DELETE /api/measurements/:id
router.delete('/:id', async (req, res) => {
  try {
    await BodyMeasurement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Measurement entry removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete measurement' });
  }
});

module.exports = router;
