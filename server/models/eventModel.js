const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // id: {
  //   required: true,
  //   type: String,
  // },
  date: {
    required: true,
    type: Date,
  },
  description: {
    required: true,
    type: String,
  },
  location: {
    type: {
      type: String, // GeoJSON type (e.g., "Point")
      enum: ['Point'], // Restrict to "Point" for this schema
      required: true,
    },
    coordinates: {
      type: [Number], // Array of numbers [longitude, latitude]
      required: true,
    },
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

// Create a 2dsphere index for geospatial queries
eventSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Event', eventSchema);
