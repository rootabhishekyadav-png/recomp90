const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, default: 'user@gym.local' },
  password: { type: String, required: true },
  profile: {
    name: { type: String, default: 'Athlete' },
    age: { type: Number, default: 21 },
    height: { type: Number, default: 168 },
    startingWeight: { type: Number, default: 80.0 },
    startingWaist: { type: Number, default: 101.0 },
    startingChest: { type: Number, default: 95.0 },
    startingBiceps: { type: Number, default: 30.0 },
    targetCalories: { type: Number, default: 2000 },
    targetProtein: { type: Number, default: 130 },
    targetFat: { type: Number, default: 70 },
    targetCarbs: { type: Number, default: 288 },
    startDate: { type: Date, default: new Date('2026-11-13T00:00:00.000Z') },
    durationDays: { type: Number, default: 90 }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

