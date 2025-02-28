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

  users: [
    {
      _id: { type: String, required: true }, // Reference to User 
      // ID mongoose.Schema.Types.ObjectId , ref: 'User ? 
      points: { type: Number, default: 0 }, // Points associated with the user
    },
  ],

  rewards: [
    {
      name: { type: String, required: true }, // Reward name (e.g., "Cookie")
      cost: { type: Number, required: true }, 
      quantity: {type: Number, required: true}
    },],
  transactions: [
    {
      type: String, // mongoose.Schema.Types.ObjectId , ref: 'Transaction? 
      required: true
    },],
});

module.exports = mongoose.model('Organization', organizationSchema);

