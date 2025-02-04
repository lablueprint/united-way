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

const addEventToUser = async (req, res) => {
  const userId = req.params.id;
  const { newEvent } = req.body;
  
  try {
    const result = await User.updateOne( { _id: userId }, { $addToSet: { registeredEvents: newEvent }});
    if (result.modifiedCount === 0) {
        res.status(404).json({
            status: "failure",
            message: "Event not found or no changes made.",
            data: result
        });
    } else {
        res.status(200).json({
            status: "success",
            message: "Event updated successfully.",
            data: result
        });
    }
} catch (err) {
    res.status(500).json({
        status: "failure",
        message: "Server-side error: update not completed.",
        data: {}
    });
}
}

const removeEventFromUser = async (req, res) => {
  const userId = req.params.id;
  const eventId  = req.body.eventId;
  console.log('in remove event from user:', userId);
  console.log(eventId);
  try {
    const result = await User.findOneAndUpdate(
      { _id: userId }, 
      { $pull: { registeredEvents: eventId}});
    console.log(result);
    if (result.modifiedCount === 0) {
        res.status(404).json({
            status: "failure",
            message: "Event not found or no changes made.",
            data: result
        });
    } else {
        res.status(200).json({
            status: "success",
            message: "Event updated successfully.",
            data: result
        });
    }
} catch (err) {
    res.status(500).json({
        status: "failure",
        message: "Server-side error: update not completed.",
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
  getAllUsers, 
  getUserById, 
  deleteUser, 
  editUserDetails, 
  createNewUser,
  addEventToUser,
  removeEventFromUser,
};