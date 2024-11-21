const mongoose = require('mongoose');

// Example of a model schema to validate and structure documents
const exampleSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  age: {
    required: true,
    type: Number,
  },
});

module.exports = mongoose.model('Example', exampleSchema);