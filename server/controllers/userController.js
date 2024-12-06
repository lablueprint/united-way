const User = require('../models/userModel');

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({});
    console.log(allUsers);
    res.send(allUsers);
  } catch (err) {
    console.error(err);
    res.status(401).json({})
  }
}

const getUserById = async (req, res) => {
  try {
    const userbyID = await User.findOne({_id: req.params["id"]});
    console.log(userbyID);
    res.send(userbyID);
  } catch (err) {
    console.error(err);
    res.status(402).json({});
  }
}


const editUserDetails = async (req, res) => {
  try {
    const userbyID = await User.findOneAndUpdate({_id: req.params["id"]}, {$set: req.body}, {new: true}); //Doesn't catch invalid fields
    console.log(req.body);
    res.send(userbyID);
  } catch (err) {
    console.error(err);
    res.status(403).json({});
  }
}

const deleteUser = async (req, res) => {
  try {
    const deleteUserbyID = await User.deleteOne({_id: req.params["id"]});
    console.log(deleteUserbyID);
    res.send(true);
  } catch (err) {
    res.status(404).send(false);
    console.error(err);
  }
}

module.exports = {
  getAllUsers, getUserById, deleteUser, editUserDetails,
};