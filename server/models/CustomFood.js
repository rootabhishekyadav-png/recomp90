const mongoose = require('mongoose');

const customFoodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  portion: { type: String, default: '1 serving' },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('CustomFood', customFoodSchema);

