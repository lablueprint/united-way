const express = require('express');

const twoFactorRouter = express.Router();
const twoFactorController = require('../controllers/twoFactorController');
twoFactorRouter.post('/verifyCode', twoFactorController.verifyCode);
twoFactorRouter.post('/sendOTP', twoFactorController.sendOTP);
module.exports = twoFactorRouter;