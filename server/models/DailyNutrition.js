const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  portion: { type: String, default: '1 serving' },
  quantity: { type: Number, default: 1 },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  time: { type: String, default: '' }
}, { _id: false });

const dailyNutritionSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
  dayNumber: { type: Number, default: 1 },
  caloriesTarget: { type: Number, default: 2000 },
  caloriesConsumed: { type: Number, default: 0 },
  proteinTarget: { type: Number, default: 130 },
  proteinConsumed: { type: Number, default: 0 },
  carbsConsumed: { type: Number, default: 0 },
  fatConsumed: { type: Number, default: 0 },
  waterLiters: { type: Number, default: 0 },
  budgetSpent: { type: Number, default: 0 },
  adherencePercentage: { type: Number, default: 0 },
  meals: [mealItemSchema],
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('DailyNutrition', dailyNutritionSchema);

