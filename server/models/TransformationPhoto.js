const mongoose = require('mongoose');

const transformationPhotoSchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true, unique: true },
  scheduledDate: { type: String, required: true },
  frontUrl: { type: String, default: '' },
  sideUrl: { type: String, default: '' },
  backUrl: { type: String, default: '' },
  notes: { type: String, default: '' },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('TransformationPhoto', transformationPhotoSchema);

