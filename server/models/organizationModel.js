const mongoose = require('mongoose');

// Example of a model schema to validate and structure documents
const organizationSchema = new mongoose.Schema({
  activeEvents: [String],
  community: String,
  description: String,
  location: {
    type: {
      type: String, // GeoJSON type (e.g., "Point")
      enum: ['Point'], // Restrict to "Point" for this schema
    },
    coordinates: {
      type: [Number], // Array of numbers [longitude, latitude]
    },
  },
  name: String,
  pastEvents: [String],
  email: String,
  password: String,
  dateJoined: Date,
  website: String,
  instagram: String,
  facebook: String,
  phoneNumber: String,
});

module.exports = mongoose.model('Organization', organizationSchema);

