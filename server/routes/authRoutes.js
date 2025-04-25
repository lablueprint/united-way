const express = require('express');
const { expressjwt: jwt } = require("express-jwt");

const authRouter = express.Router();
const authController = require('../controllers/authController');

authRouter.post('/userLogin',authController.verifyUserLogin)

authRouter.use('/userRefresh', 
    jwt({
        secret: process.env.REFRESH_SECRET, 
        algorithms: ["HS256"]
    })
)
authRouter.post('/userRefresh', authController.refreshUserAccessToken)

authRouter.post('/orgLogin',authController.verifyOrgLogin)

authRouter.use('/orgRefresh', 
    jwt({
        secret: process.env.REFRESH_SECRET, 
        algorithms: ["HS256"]
    })
)
authRouter.post('/orgRefresh', authController.refreshOrgAccessToken)

module.exports = authRouter;