const express = require('express');
const { expressjwt: jwt } = require("express-jwt");

const authRouter = express.Router();
const authController = require('../controllers/authController');

authRouter.post('/login',authController.verifyUserLogin)

authRouter.use('/refresh', 
    jwt({
        secret: process.env.REFRESH_SECRET, 
        algorithms: ["HS256"]
    })
)
authRouter.post('/refresh', authController.refreshAccessToken)

module.exports = authRouter;