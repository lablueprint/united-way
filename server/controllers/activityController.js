const Activity = require('../models/activityModel');

const createNewActivity = async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).json({
      status: "success",
      message: "Activity successfully created.",
      data: activity
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: activity could not be created.",
      data: {}
    });
  }
}

module.exports = {
  createNewActivity,
};