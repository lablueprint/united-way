const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  date: {
    required: true,
    type: Date,
  },
  startDate: {
    required: true,
    type: Date,
  },
  endDate: {
    required: true,
    type: Date,
  },
  duration: {
    required: true,
    type: Number,
  },
  description: {
    required: true,
    type: String,
  },
  startTime: {
    required: true,
    type: String
  },
  endTime: {
    required: true,
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
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
  imageURL: {
    type: String,
  },
  key: {
    type: String,
  }
});

// Create a 2dsphere index for geospatial queries
eventSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Event", eventSchema);
