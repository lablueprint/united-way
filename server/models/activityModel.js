const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  content: mongoose.Schema.Types.Mixed,
  timeStart: { type: Date, required: true },
  timeEnd: { type: Date, required: true },
  active: { type: Boolean, required: true },
});

module.exports = mongoose.model('Activity', activitySchema);
