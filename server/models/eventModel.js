const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  date: {
    required: true,
    type: Date,
  },
  description: {
    required: true,
    type: String,
  },
  location: {
    required: true,
    type: GeoJSON,
  },
  organizerID: {
    required: true,
    type: String,
  },
  tags: {
    required: true,
    type: [String],
  },
  registeredUsers: {
    required: true,
    type: [String],
  },  
  activity: {
    required: true,
    type: [String],
  },
});

module.exports = mongoose.model('Event', eventSchema);