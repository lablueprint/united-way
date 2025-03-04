const express = require('express');
const socketRouter = express.Router();
const socketController = require('../controllers/socketController');

socketRouter.post('/send-message', socketController.sendMessage);

module.exports = socketRouter;