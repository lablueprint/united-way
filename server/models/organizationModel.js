const mongoose = require('mongoose');

// Example of a model schema to validate and structure documents
const organizationSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
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
//   location : {
//     required: true,
//     type: GeoJSON,
//   },
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

