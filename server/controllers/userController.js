require('dotenv').config();
const bcrypt = require('bcrypt')
const User = require('../models/userModel');
const { generateToken } = require("../controllers/authController")

const getAllUsers = async (req, res) => {
  if (req.auth.role != 'admin') {
    res.status(401);
    return;
  }

  try {
    const allUsers = await User.find({});
    res.status(200).json({
      status: "success",
      message: "User(s) successfully retrieved",
      data: allUsers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: all users could not be retrieved",
      data: {}
    });
  }
}

const getUserById = async (req, res) => {
  if (req.auth.role != 'admin') {
    res.status(401);
    return;
  }

  try {
    const userbyID = await User.findOne({_id: req.params["id"]});
    res.status(200).json({
      status: "success",
      message: "User successfully retrieved",
      data: userbyID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: user could not be retrieved via ID",
      data: {}
    });
  }
}

const getUserByEmail = async (req, res) => {
  console.log("hello, test, test, test");
  try {
    const userByEmail = await User.findOne({email: req.params["email"]});
    res.status(200).json({
      status: "success",
      message: "User successfully retrieved",
      data: userByEmail
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: user could not be retrieved via email",
      data: {}
    });
  }
}

const editUserDetails = async (req, res) => {
  if (req.auth.role != 'user') {
    res.status(401);
    return;
  }

  try {
    const userbyID = await User.findOneAndUpdate({_id: req.params["id"]}, {$set: req.body}, {new: true}); //Doesn't catch invalid fields
    res.status(200).json({
      status: "success",
      message: "User successfully edited",
      data: userbyID
    });
  } catch (err) {
    res.status(500).json({
      status: "failure",
      message: "Server-side error: user could not be succesfully edited",
      data: {}
    });
  }
}

const deleteUser = async (req, res) => {
  if (req.auth.role != 'user' && req.auth.role != 'admin') {
    res.status(401);
    return;
  }

  try {
    const deleteUserbyID = await User.deleteOne({_id: req.params["id"]});
    res.status(200).json({
      status: "success",
      message: "User successfully deleted",
      data: deleteUserbyID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: user could not be deleted.",
      data: {}
    });
  }
}

const createNewUser = async (req, res) => {
  try {
    // Salt and hash the password.
    // Note: upon creation, the user should then be signed in on the front-end, so must add refresh/access tokens to reponse
    bcrypt.hash(req.body.password, `$2b$${process.env.SALT_ROUNDS}$${process.env.HASH_SALT}`, async (err, hash) => {
      req.body.password = hash;
      const user = new User(req.body);
      await user.save();
      res.status(201).json({
        status: "success",
        message: "User successfully created.",
        data: user,
        // Add access, refresh tokens here.
        authToken: generateToken({tokenType: "access", uid: user._id, role: "user"}),
        refreshToken: generateToken({tokenType: "refresh", uid: user._id})
      });
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: user could not be created.",
      data: {}
    });
  }
}

module.exports = {
  getAllUsers, getUserById, deleteUser, editUserDetails, createNewUser, getUserByEmail
};