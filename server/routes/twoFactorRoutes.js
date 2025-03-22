const express = require('express');

const twoFactorRouter = express.Router();
const twoFactorController = require('../controllers/twoFactorController');
console.log("inside two factor routes");
twoFactorRouter.post('/verifyCode', twoFactorController.verifyCode);
twoFactorRouter.post('/sendOTP', twoFactorController.sendOTP);
module.exports = twoFactorRouter;