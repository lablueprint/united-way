const User = require('../models/userModel');

const getAllUsers = async (req, res) => {
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
      message: "Server-side error: user could not be retrieved via ID",
      data: {}
    });
  }
}

const editUserDetails = async (req, res) => {
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
    const user = new User(req.body);
    await user.save();
    res.status(201).json({
      status: "success",
      message: "User successfully created.",
      data: user
    });
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