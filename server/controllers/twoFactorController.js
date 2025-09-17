const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
require('dotenv').config({ path: './.env' });

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: `${process.env.EMAIL_USER}`,
        pass: `${process.env.EMAIL_PASS}`,
    },
});

// Function to generate a 4-digit OTP
const generateFourDigitCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // Ensures a 4-digit code
};

// Function to hash a code securely
const hash = async (code) => {
    const saltRounds = parseInt(process.env.SALT, 10) || 10; // Ensure SALT is a number
    return await bcrypt.hash(code, saltRounds);
};

// Function to verify OTP
const verifyCode = async (req, res) => {
    const { code, hashedCode } = req.body;

    // Compare hashed stored code with provided code
    const isMatch = await bcrypt.compare(code, hashedCode);
    res.send(isMatch);
};

// Function to send OTP (Handles both verifyEmail & sendOTP)
const sendOTP = async (req, res) => {
    
  try {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required" }); // Handle missing email
    }

    const otp = generateFourDigitCode();
    const hashedOTP = await hash(otp);

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: `Your OTP Code: ${otp}`,
        text: `Your one-time password (OTP) is: ${otp}. This code expires soon.`,
    };

    ("Sending OTP to:", email);
    await transporter.sendMail(mailOptions);
    ("OTP sent successfully");

    res.send(hashedOTP);
} catch (error) {
    console.error("Error in sendOTP:", error); // Log full error
    res.status(500).json({ error: error.message });
}
};

module.exports = {
    sendOTP, // Now replaces verifyEmail
    verifyCode,
};
