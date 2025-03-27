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
  name : String,
  pastEvents : [String], // Array of event IDs
  password : String,
  users: [String], // Array of user IDs
  rewards: [
    {
      name: { type: String, required: true }, 
      cost: { type: Number, required: true }, 
      quantity: {type: Number, required: true}
    },],
  transactions: [String], // Array of transaction IDs
});

module.exports = mongoose.model('Organization', organizationSchema);

