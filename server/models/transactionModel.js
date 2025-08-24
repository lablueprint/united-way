const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization', 
    required: true,
  },
  reward: {
    name: { type: String, required: true }, // Reward name (e.g., "Cookie")
    cost: { type: Number, required: true }, 
  },
  isClaimed: {
    type: Boolean, // Type of transaction (e.g., earning or redeeming points)
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now, // Auto-generate timestamp when transaction is created
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
