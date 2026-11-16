const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  weight: { type: Number, default: 0 },
  reps: { type: Number, default: 0 },
  completed: { type: Boolean, default: false }
}, { _id: false });

const exerciseLogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  targetMuscle: { type: String, default: '' },
  prescribedSets: { type: Number, default: 3 },
  prescribedReps: { type: String, default: '8-10' },
  sets: [setSchema],
  alternative: { type: String, default: '' },
  instructions: { type: String, default: '' }
}, { _id: false });

const workoutLogSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  dayOfWeek: { type: String, required: true }, // Monday, Tuesday, etc.
  focusArea: { type: String, required: true },
  completed: { type: Boolean, default: false },
  cardioMinutes: { type: Number, default: 0 },
  cardioCompleted: { type: Boolean, default: false },
  exercises: [exerciseLogSchema],
  rating: { type: Number, default: 4 }, // 1 to 5
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);

