const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const twilio = require("twilio");
require('dotenv').config({ path: './.env' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SID;
const client = twilio(accountSid, authToken);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: `${process.env.EMAIL_USER}`,
        pass: `${process.env.EMAIL_PASS}`,
    },
});

const generateFourDigitCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const hash = async (code) => {
    const saltRounds = parseInt(process.env.SALT, 10) || 10;
    return await bcrypt.hash(code, saltRounds);
};

const verifyCode = async (req, res) => {
    const { code, hashedCode } = req.body;
    const isMatch = await bcrypt.compare(code, hashedCode);
    res.send(isMatch);
};

const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const otp = generateFourDigitCode();
        const hashedOTP = await hash(otp);

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: `Your OTP Code: ${otp}`,
            text: `Your one-time password (OTP) is: ${otp}. This code expires soon.`,
        };
        console.log("Sending OTP to:", email);
        await transporter.sendMail(mailOptions);
        res.send(hashedOTP);
    } catch (error) {
        console.error("Error in sendOTP:", error);
        res.status(500).json({ error: error.message });
    }
};

const sendSMS = async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        const verification = await client.verify.v2
            .services(verifyServiceSid)
            .verifications.create({ to: phoneNumber, channel: "sms" });

        res.status(200).json({
            status: "success",
            message: "Verification code sent.",
            data: { sid: verification.sid }
        });
    } catch (error) {
        console.error("Error sending code:", error);
        res.status(500).json({
            status: "failure",
            message: "Failed to send verification code.",
            data: {}
        });
    }
};

const confirmSMS = async (req, res) => {
    const { phoneNumber, code } = req.body;
    try {
        const verificationCheck = await client.verify.v2
            .services(verifyServiceSid)
            .verificationChecks.create({ to: phoneNumber, code });

        if (verificationCheck.status === "approved") {
            res.status(200).json({
                status: "success",
                message: "Phone number verified successfully.",
                data: {}
            });
        } else {
            res.status(401).json({
                status: "failure",
                message: "Invalid verification code.",
                data: {}
            });
        }
    } catch (error) {
        console.error("Verification failed:", error);
        res.status(500).json({
            status: "failure",
            message: "Verification process failed.",
            data: {}
        });
    }
};

module.exports = {
    sendOTP,
    verifyCode,
    sendSMS,
    confirmSMS
};