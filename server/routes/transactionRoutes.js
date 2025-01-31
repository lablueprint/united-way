const express = require('express');
const transactionRouter = express.Router();
const transactionController = require('../controllers/transactionController');

// Create a new transaction
transactionRouter.post('/create', transactionController.createTransaction);
// Get all transactions
transactionRouter.get('/', transactionController.getAllTransactions);
// Get transactions by user ID
transactionRouter.get('/user/:id', transactionController.getTransactionsByUser);
// Get transactions by organization ID
transactionRouter.get('/organization/:id', transactionController.getTransactionsByOrganization);
// Delete transactions
// router.delete('/:id', transactionController.deleteTransaction);

module.exports = transactionRouter;
