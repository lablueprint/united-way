const User = require('../models/userModel');

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.status(200).json(allUsers);
  } catch (err) {
    console.error(err);
    res.status(501).json({})
  }
}

const getUserById = async (req, res) => {
  try {
    const userbyID = await User.findOne({_id: req.params["id"]});
    res.status(200).json(userbyID);
  } catch (err) {
    console.error(err);
    res.status(401).json({});
  }
}

const editUserDetails = async (req, res) => {
  try {
    const userbyID = await User.findOneAndUpdate({_id: req.params["id"]}, {$set: req.body}, {new: true}); //Doesn't catch invalid fields
    res.status(200).json(userbyID);
  } catch (err) {
    console.error(err);
    res.status(402).json({});
  }
}

const deleteUser = async (req, res) => {
  try {
    const deleteUserbyID = await User.deleteOne({_id: req.params["id"]});
    res.send(true);
  } catch (err) {
    console.error(err);
    res.status(403).send(false);
  }
}

const createNewUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(404).json({})
  }
}

module.exports = {
  getAllUsers, getUserById, deleteUser, editUserDetails, createNewUser,
};