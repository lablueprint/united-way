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

// added this
// authRouter.post("/sendCode", async (req, res) => {
//   const { phoneNumber } = req.body;
//   try {
//     const response = await sendVerificationCode(phoneNumber);
//     res.json({ success: true, sid: response.sid });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// authRouter.post("/verifyCode", async (req, res) => {
//   const { phoneNumber, code } = req.body;
//   try {
//     const result = await confirmVerificationCode(phoneNumber, code);
//     res.json({ success: result.status === "approved" });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

authRouter.post("/sendCode", authController.sendVerificationCode);
authRouter.post("/verifyCode", authController.confirmVerificationCode);

module.exports = authRouter;