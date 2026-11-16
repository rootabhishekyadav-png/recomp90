const express = require('express');
const router = express.Router();
const DailyNutrition = require('../models/DailyNutrition');
const CustomFood = require('../models/CustomFood');

// Default Indian PG / Mess Foods
const DEFAULT_FOODS = [
  { name: 'Whole Boiled Egg (Large)', portion: '1 egg (50g)', calories: 70, protein: 6.0, carbs: 0.5, fat: 5.0, cost: 7, isDefault: true },
  { name: 'Boiled Egg White', portion: '1 egg white (33g)', calories: 17, protein: 3.6, carbs: 0.2, fat: 0.0, cost: 5, isDefault: true },
  { name: 'Soya Chunks (Raw Dry)', portion: '50 g (expands to 150g)', calories: 172, protein: 26.0, carbs: 16.5, fat: 0.2, cost: 10, isDefault: true },
  { name: 'Mess Dal (Toor/Moong/Mix)', portion: '1 bowl (150 ml)', calories: 130, protein: 6.5, carbs: 18.0, fat: 3.0, cost: 8, isDefault: true },
  { name: 'Roti / Chapati (Mess Wheat)', portion: '1 medium roti (35g)', calories: 90, protein: 3.0, carbs: 19.0, fat: 0.5, cost: 3, isDefault: true },
  { name: 'White Rice (Cooked)', portion: '1 plate (150 g)', calories: 195, protein: 4.0, carbs: 42.0, fat: 0.5, cost: 5, isDefault: true },
  { name: 'Toned Cow/Buffalo Milk', portion: '1 glass (250 ml)', calories: 150, protein: 8.0, carbs: 12.0, fat: 7.5, cost: 15, isDefault: true },
  { name: 'Curd / Dahi (Plain)', portion: '100 g', calories: 60, protein: 3.5, carbs: 4.5, fat: 3.0, cost: 10, isDefault: true },
  { name: 'Paneer (Raw / Cottage Cheese)', portion: '50 g', calories: 145, protein: 9.0, carbs: 2.0, fat: 10.0, cost: 20, isDefault: true },
  { name: 'Boiled Kala Chana', portion: '1 bowl (100 g)', calories: 160, protein: 9.0, carbs: 27.0, fat: 2.5, cost: 8, isDefault: true },
  { name: 'Banana', portion: '1 medium (100g)', calories: 90, protein: 1.1, carbs: 23.0, fat: 0.3, cost: 5, isDefault: true },
  { name: 'Roasted Chana', portion: '40 g', calories: 150, protein: 7.5, carbs: 24.0, fat: 2.0, cost: 10, isDefault: true },
  { name: 'Mess Mix Sabzi', portion: '1 bowl (100g)', calories: 85, protein: 2.0, carbs: 9.0, fat: 4.5, cost: 6, isDefault: true },
  { name: 'Oats (Rolled/Instant)', portion: '40 g dry', calories: 155, protein: 5.0, carbs: 27.0, fat: 2.8, cost: 12, isDefault: true }
];

// Initialize default foods if empty
async function initFoods() {
  const count = await CustomFood.countDocuments();
  if (count === 0) {
    await CustomFood.insertMany(DEFAULT_FOODS);
  }
}
initFoods().catch(err => console.error('Food init error:', err));

// GET /api/nutrition/foods - Get all foods (defaults + custom user foods)
router.get('/foods', async (req, res) => {
  try {
    const foods = await CustomFood.find().sort({ isDefault: -1, name: 1 });
    res.json({ success: true, foods });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load food list' });
  }
});

// POST /api/nutrition/custom-food - Add new custom food item
router.post('/custom-food', async (req, res) => {
  try {
    const { name, portion, calories, protein, carbs, fat, cost } = req.body;
    if (!name || calories === undefined || protein === undefined) {
      return res.status(400).json({ success: false, message: 'Name, calories, and protein are required' });
    }

    const newFood = await CustomFood.create({
      name,
      portion: portion || '1 serving',
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs || 0),
      fat: Number(fat || 0),
      cost: Number(cost || 0),
      isDefault: false
    });

    res.json({ success: true, message: 'Custom food saved successfully!', food: newFood });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save custom food' });
  }
});

// DELETE /api/nutrition/custom-food/:id
router.delete('/custom-food/:id', async (req, res) => {
  try {
    await CustomFood.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Custom food removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete food' });
  }
});

// GET /api/nutrition/day/:date
router.get('/day/:date', async (req, res) => {
  try {
    const { date } = req.params;
    let log = await DailyNutrition.findOne({ date });
    if (!log) {
      log = {
        date,
        caloriesTarget: 2000,
        caloriesConsumed: 0,
        proteinTarget: 130,
        proteinConsumed: 0,
        carbsConsumed: 0,
        fatConsumed: 0,
        waterLiters: 0,
        budgetSpent: 0,
        meals: [],
        notes: ''
      };
    }
    res.json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching nutrition log' });
  }
});

// POST /api/nutrition/log - Update or save daily intake
router.post('/log', async (req, res) => {
  try {
    const {
      date,
      caloriesConsumed,
      proteinConsumed,
      carbsConsumed,
      fatConsumed,
      waterLiters,
      budgetSpent,
      meals,
      notes
    } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const start = new Date('2026-11-13');
    const entryDate = new Date(date);
    const dayNumber = Math.max(1, Math.ceil((entryDate - start) / (1000 * 60 * 60 * 24)) + 1);

    const caloriesTarget = 2000;
    const proteinTarget = 130;
    const adherence = proteinTarget > 0 ? Math.min(100, Math.round((Number(proteinConsumed || 0) / proteinTarget) * 100)) : 0;

    const updatedLog = await DailyNutrition.findOneAndUpdate(
      { date },
      {
        date,
        dayNumber,
        caloriesTarget,
        proteinTarget,
        caloriesConsumed: Number(caloriesConsumed || 0),
        proteinConsumed: Number(proteinConsumed || 0),
        carbsConsumed: Number(carbsConsumed || 0),
        fatConsumed: Number(fatConsumed || 0),
        waterLiters: Number(waterLiters || 0),
        budgetSpent: Number(budgetSpent || 0),
        adherencePercentage: adherence,
        meals: meals || [],
        notes: notes || ''
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Daily nutrition updated!', log: updatedLog });
  } catch (error) {
    console.error('Nutrition save error:', error);
    res.status(500).json({ success: false, message: 'Failed to update nutrition' });
  }
});

module.exports = router;

