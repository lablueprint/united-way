const mongoose = require('mongoose');

// Example of a model schema to validate and structure documents
const userSchema = new mongoose.Schema({
	collectedStamps: [String],
	demographics: {
		gender: Boolean,
		ethnicity: String,
		community: String
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
	registeredEvents: [String]
});

module.exports = mongoose.model('User', userSchema);