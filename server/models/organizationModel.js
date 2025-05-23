const mongoose = require("mongoose");

// Example of a model schema to validate and structure documents
const organizationSchema = new mongoose.Schema({
  activeEvents: [String],
  community: String,
  description: String,
  location: {
    type: {
      type: String, // GeoJSON type (e.g., "Point")
      enum: ["Point"], // Restrict to "Point" for this schema
    },
    coordinates: {
      type: [Number], // Array of numbers [longitude, latitude]
    },
  },
  name: {
    required: false,
    type: String,
  },
  pastEvents: {
    required: false,
    type: [String],
  },
  password: {
    required: true,
    type: String,
  },
  email: {
    required: true,
    type: String,
  },
  users: [String], // Array of user IDs
  rewards: [
    {
      name: { type: String, required: true },
      cost: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
      description: { type: String, required: true },
      directions: { type: String, required: true },
      assignedEvents: { type: [String], required: true},
    },
  ],
  transactions: [String], // Array of transaction IDs
});

module.exports = mongoose.model("Organization", organizationSchema);
