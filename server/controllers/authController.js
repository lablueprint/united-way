const jwt = require('jsonwebtoken');
const User = require('../models/userModel')
const bcrypt = require('bcrypt');
require('dotenv').config();

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

module.exports = { generateToken, verifyUserLogin, refreshAccessToken }