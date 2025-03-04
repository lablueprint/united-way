const jwt = require('jsonwebtoken');
const User = require('../models/userModel')
const bcrypt = require('bcrypt');
require('dotenv').config();
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: `vanshikaturkar@g.ucla.edu`,
    pass: `Password@123`,
  },
});

// Generate a random number between 0000 and 9999
const generateFourDigitCode = () => {
  let fourDigitCode = '';
  for (let i = 0; i < 4; i += 1) {
    fourDigitCode += String(Math.floor(Math.random() * 10));
  }
  return fourDigitCode;
};

const hash = async (code) => {
  const hashedCode = await bcrypt.hash(code, `${process.env.SALT}`);
  return hashedCode;
};

const verifyCode = async (req, res) => {
  // Retrieve info from req.body.[your_param], code and hashedCode
  const rehash = await hash(req.body.code);
  res.send(rehash === req.body.hashedCode);
};

// Sends an email with a 4 digit verification code
// Returns the hashedCode
// Return -1 if the user doesn't exist
const verifyEmail = async (req, res) => {
  // Send back -1 if the user doesn't exist
  const user = await User.findOne({ email: req.body.email });
  if (user == null) {
    res.send('-1');
    return;
  }
  const resetCode = generateFourDigitCode();
  const mailOptions = {
    from: `vanshikaturkar@g.ucla.edu`,
    to: req.body.email,
    subject: `United Way Email Authentication: ${resetCode} `,
    text: `Your reset code for UnitedWay: ${resetCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email: ', error);
    }
  });
  res.send(await hash(resetCode));
};




// The format of the userDetails will be different based on the user
// {email: _, role: "user" | "organization" | "business" | "admin", }

function generateToken (context, type="access") {
    if (type === "access") {
        const accessToken = jwt.sign(context, process.env.JWT_SECRET, {expiresIn: 3600})
        return accessToken;
    } else if (type === "refresh") {
        const refreshToken = jwt.sign(context, process.env.REFRESH_SECRET);
        return refreshToken;
    }
    return null;
}

const refreshAccessToken = async (req, res) => {
    try {
        // Verify the refresh token and get the user id.
        const user = await User.findOne({_id: req.auth.uid});

        // Ensure that the user id actually exists within the MongoDB cluster
        // If user is not found:
        if (!user) {
            res.status(401).json({
                status: "failure",
                message: "Unable to verify refresh token.",
                data: {}
            });
            return;
        }

        // If it does, then we will reauthenticate and provide another access
        // token using `generateToken`.
        res.status(200).json({
            status: "success",
            message: "Successfully generated access token.",
            data: {
                accessToken: generateToken({tokenType: "access", uid: user._id, role: "user"})
            }
        })

    } catch (err) {
        res.status(500).json({
            status: "failure",
            message: "Server-side error: retrieving refresh token failed.",
            data: {}
          });
    }
}

const verifyUserLogin = async (req, res) => {
    try {
      const user = await User.findOne({email: req.body.email});

      const match = await bcrypt.compare(req.body.password, user.password);
      if (match) {
        res.status(200).json({
          status: "success",
          message: "Login successful.",
          data: {
            accessToken: generateToken({tokenType: "access", uid: user._id, role: "user"}),
            refreshToken: generateToken({tokenType: "refresh", uid: user._id}, "refresh")
          }
        })
      } else {
        res.status(401).json({
          status: "failure",
          message: "Email or password was incorrect/invalid",
          data: {}
        })
      }
  
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: "failure",
        message: "Server-side error: password verification failed.",
        data: {}
      });
    }
}

const refreshOrgAccessToken = async (req, res) => {
  try {
      // Verify the refresh token and get the user id.
      const org = await Organization.findOne({_id: req.auth.uid});

      // Ensure that the org id actually exists within the MongoDB cluster
      // If org is not found:
      if (!org) {
          res.status(401).json({
              status: "failure",
              message: "Unable to verify refresh token.",
              data: {}
          });
          return;
      }

      // If it does, then we will reauthenticate and provide another access
      // token using `generateToken`.
      res.status(200).json({
          status: "success",
          message: "Successfully generated access token.",
          data: {
              accessToken: generateToken({tokenType: "access", uid: org._id, role: "organization"})
          }
      })

  } catch (err) {
      res.status(500).json({
          status: "failure",
          message: "Server-side error: retrieving refresh token failed.",
          data: {}
        });
  }
}

const verifyOrgLogin = async (req, res) => {
  try {
    const org = await Organization.findOne({email: req.body.email});

    const match = await bcrypt.compare(req.body.password, org.password);
    if (match) {
      res.status(200).json({
        status: "success",
        message: "Login successful.",
        data: {
          accessToken: generateToken({tokenType: "access", uid: org._id, role: "organization"}),
          refreshToken: generateToken({tokenType: "refresh", uid: org._id}, "refresh")
        }
      })
    } else {
      res.status(401).json({
        status: "failure",
        message: "Email or password was incorrect/invalid",
        data: {}
      })
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: password verification failed.",
      data: {}
    });
  }
}

module.exports = { generateToken, verifyUserLogin, refreshUserAccessToken, verifyOrgLogin, refreshOrgAccessToken }