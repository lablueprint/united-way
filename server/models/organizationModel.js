const mongoose = require('mongoose');

// Example of a model schema to validate and structure documents
const organizationSchema = new mongoose.Schema({
  activeEvents: {
    required: true,
    type: [String],
  },
  community : {
    required: true,
    type: String,
  },
  description : {
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
  name : {
    required: true,
    type: String,
  },
  pastEvents : {
    required: true,
    type: [String],
  },
  password : {
    required: true,
    type: String,
  },
});

module.exports = mongoose.model('Organization', organizationSchema);

