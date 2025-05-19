const mongoose = require("mongoose");

// Example of a model schema to validate and structure documents
const userSchema = new mongoose.Schema({
	collectedStamps: [String],
	demographics: {
		gender: String,
		ethnicity: String,
		community: String
	},
	email: String,
	experiencePoints: Number,
	isTemporary: Boolean,
	name: String,
	numStamps: Number,
	phoneNumber: String,
	points: Number,
	password: String,
	pastEvents: [String],
	preferredLanguage: {
		type: String,
		enum: ["EN", "ES"],
		default: "EN"
	},
	profilePicture: String,
	registeredEvents: [String],
	dateJoined: Date,
  demographics: {
    gender: String,
    ethnicity: String,
    community: String,
  },
  email: String,
  experiencePoints: Number,
  name: String,
  numStamps: Number,
  password: String,
  pastEvents: [String],
  phoneNumber: String,
  points: Number,
  password: String,
  registeredEvents: [String],
  checkedInEvents: [String],
  profilePicture: String,
  dateJoined: Date,
});

module.exports = mongoose.model("User", userSchema);
