const express = require('express');
const twoFactorController = require('../controllers/twoFactorController');
const twoFactorRouter = express.Router();

twoFactorRouter.post('/verifyCode', twoFactorController.verifyCode);
twoFactorRouter.post('/sendOTP', twoFactorController.sendOTP);
twoFactorRouter.post('/sendSMS', twoFactorController.sendSMS);
twoFactorRouter.post('/verifySMS', twoFactorController.confirmSMS);

module.exports = twoFactorRouter;