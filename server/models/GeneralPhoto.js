const mongoose = require('mongoose');

const generalPhotoSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  caption: { type: String, default: '' },
  date: { type: String, required: true },
  time: { type: String, default: '' },
  dayNumber: { type: Number, default: 1 },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('GeneralPhoto', generalPhotoSchema);

