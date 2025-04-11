const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');
const Organization = require('../models/organizationModel');

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { user, organization, reward, isRedeemed, event, } = req.body;

    // Validate required fields
    if (!user || !organization || !reward || isRedeemed === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user and organization exist
    const existingUser = await User.findById(user);
    const existingOrganization = await Organization.findById(organization);
    if (!existingUser || !existingOrganization) {
      return res.status(404).json({ message: 'User or Organization not found' });
    }

    // Create new transaction
    const newTransaction = new Transaction({
      user,
      organization,
      reward,
      isRedeemed,
      event,
    });

    await newTransaction.save();

    res.status(201).json({ message: 'Transaction created successfully', transaction: newTransaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('user organization');
    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get transactions by user ID
exports.getTransactionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.find({ user: userId }).populate('organization');
    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get transactions by organization ID
exports.getTransactionsByOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const transactions = await Transaction.find({ organization: organizationId }).populate('user');
    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete a transaction by ID
exports.deleteTransaction = async (req, res) => {
    try {
      const { transactionId } = req.params;
  
      // Check if the transaction ID is valid
      if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        return res.status(400).json({ message: 'Invalid transaction ID' });
      }
  
      // Find and delete the transaction
      const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);
  
      if (!deletedTransaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
  
      res.status(200).json({ message: 'Transaction deleted successfully', deletedTransaction });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error });
    }
  };
  
