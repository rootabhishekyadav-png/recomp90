const express = require('express');
const router = express.Router();
const DailyNutrition = require('../models/DailyNutrition');
const BodyMeasurement = require('../models/BodyMeasurement');
const WorkoutLog = require('../models/WorkoutLog');
const GeneralPhoto = require('../models/GeneralPhoto');

function getDayNumber(startDateStr) {
  const start = new Date(startDateStr || '2026-11-13');
  const now = new Date();
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.min(Math.max(diffDays, 1), 90);
}

function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

router.get('/summary', async (req, res) => {
  try {
    const todayStr = getTodayString();
    const dayNumber = getDayNumber('2026-11-13');

    // 1. Today's nutrition
    let todayNutrition = await DailyNutrition.findOne({ date: todayStr });
    if (!todayNutrition) {
      todayNutrition = {
        date: todayStr,
        dayNumber,
        caloriesTarget: 2000,
        caloriesConsumed: 0,
        proteinTarget: 130,
        proteinConsumed: 0,
        fatConsumed: 0,
        carbsConsumed: 0,
        waterLiters: 0,
        meals: []
      };
    }

    // 2. Latest Body Measurement
    const latestMeasurement = await BodyMeasurement.findOne().sort({ date: -1 });

    // 3. Nutrition history for Graph Box 1 (last 14 days)
    const nutritionHistory = await DailyNutrition.find()
      .sort({ date: 1 })
      .limit(30)
      .select('date dayNumber caloriesConsumed caloriesTarget proteinConsumed proteinTarget carbsConsumed fatConsumed waterLiters');

    // 4. Measurements history for Graph Box 2 (all points sorted by date)
    const measurementHistory = await BodyMeasurement.find()
      .sort({ date: 1 })
      .select('date weight waist chest bicepsLeft bicepsRight weightDiff waistDiff chestDiff bicepsDiff');

    // 5. Total workouts completed
    const completedWorkoutsCount = await WorkoutLog.countDocuments({ completed: true });

    // 6. Recent photos count
    const photosCount = await GeneralPhoto.countDocuments();

    res.json({
      success: true,
      data: {
        today: todayStr,
        dayNumber,
        daysRemaining: Math.max(90 - dayNumber, 0),
        todayNutrition,
        latestMeasurement: latestMeasurement || {
          weight: 80.0,
          waist: 101.0,
          chest: 95.0,
          biceps: 30.0,
          weightDiff: 0,
          waistDiff: 0,
          chestDiff: 0,
          bicepsDiff: 0
        },
        nutritionHistory,
        measurementHistory,
        completedWorkoutsCount,
        photosCount
      }
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;

