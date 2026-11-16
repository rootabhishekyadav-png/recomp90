const mongoose = require('mongoose');

const bodyMeasurementSchema = new mongoose.Schema({
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  weight: { type: Number, required: true }, // in kg
  waist: { type: Number, required: true },  // in cm (belly button relaxed)
  chest: { type: Number, default: 0 },      // in cm
  bicepsLeft: { type: Number, default: 0 }, // in cm
  bicepsRight: { type: Number, default: 0 },// in cm
  thighs: { type: Number, default: 0 },     // in cm
  hips: { type: Number, default: 0 },       // in cm
  weightDiff: { type: Number, default: 0 }, // Difference from 80kg
  waistDiff: { type: Number, default: 0 },  // Difference from 101cm
  chestDiff: { type: Number, default: 0 },  // Difference from 95cm
  bicepsDiff: { type: Number, default: 0 }, // Difference from 30cm
  notes: { type: String, default: '' }
}, { timestamps: true });

bodyMeasurementSchema.pre('save', function() {
  const BASELINE = { weight: 80.0, waist: 101.0, chest: 95.0, biceps: 30.0 };
  if (this.weight !== undefined) this.weightDiff = +(this.weight - BASELINE.weight).toFixed(2);
  if (this.waist !== undefined) this.waistDiff = +(this.waist - BASELINE.waist).toFixed(2);
  if (this.chest) this.chestDiff = +(this.chest - BASELINE.chest).toFixed(2);
  const avgBicep = this.bicepsLeft || this.bicepsRight || 0;
  if (avgBicep) this.bicepsDiff = +(avgBicep - BASELINE.biceps).toFixed(2);
});

module.exports = mongoose.model('BodyMeasurement', bodyMeasurementSchema);
