const Activity = require("../models/activityModel");
const Event = require("../models/eventModel");

// Example of creating a document in the database

const createActivity = async (req, res) => {
  const activity = new Activity(req.body);
  try{
    const data = await activity.save(activity);
    await Event.findByIdAndUpdate(data.eventID, { $push: { "activity": data._id} });

    res.status(201).json({
      status: "success",
      message: "Activity successfully created.",
      data: data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: activity could not be created.",
      data: {}
    });
  }
};
// const createActivity = async (req, res) => {
//   const activity = new Activity(req.body);
//   console.log("\n\Activity Log: " + activity);
//   try{
//     const data = await activity.save(activity);
//     await Event.findByIdAndUpdate(data.eventID, { $push: { "activity": data._id} });
//     console.log("Inside createActivity");
//     res.status(201).json({
//       status: "success",
//       message: "Activity successfully created.",
//       data: data
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       status: "failure",
//       message: "Server-side error: activity could not be created.",
//       data: {}
//     });
//   }
// };

const getActivityById = async (req, res) => {
  const activityId = req.params.id;
  try {
    const activity = await Activity.findById(activityId);
    res.status(200).json({
      status: "success",
      message: "Activity successfully received.",
      data: activity
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: activity could not be received.",
      data: {}
    });
  }
};

const getAllActivities = async (req, res) =>
{
  try {
    const activities = await Activity.find();
    res.status(200).json({
      status: "success",
      message: "Activity(s) successfully received.",
      data: activities
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: activities could not be retrieved.",
      data: {}
    });
  }
}

const getActivitiesByFilter = async (req, res) => {
  try {
    const { eventID, type } = req.body; // Extract type and id from request body
    console.log("Backend received:", req.body);
    // Build the filter object
    const filter = {};
    if (type) filter.type = type; // If 'type' is provided, filter by 'type'
    if (eventID) filter.eventID = eventID; // If 'id' is provided, filter by 'id'
    console.log("Filter" + filter);
    

    // Fetch activities using the filter
    const activities = await Activity.find(filter);
    console.log("Filter received:", filter);
    console.log("Activities found:", activities)
    // const {type } = req.body; // Extract type from request body
    // const activities = await Activity.find({ type }); // Filter activities by type
    res.status(200).json({
      status: "success",
      message: "Activities successfully retrieved.",
      data: activities,
    });
  } catch (err) {
    console.error("Error retrieving activities:", err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: could not retrieve activities.",
      data: [],
    });
  }
};


// const getActivitiesByFilter = async (req, res) => {
//   try {
//     const activities = await Activity.find(req.body);
//     res.status(200).json({
//       status: "success",
//       message: "Activity successfully received.",
//       data: activities
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       status: "failure",
//       message: "Server-side error: could not receive activities.",
//       data: {}
//     });
//   }
// };

const editActivityDetails = async (req, res) => {
  const activityId = req.params.id;
  try {
    const activity = await Activity.findByIdAndUpdate(activityId, req.body, {
      new: true,
    });
    res.status(200).json({
      status: "success",
      message: "Activity successfully edited.",
      data: activity
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: activity could not be edited.",
      data: {}
    });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const data = await Activity.findByIdAndDelete(req.params.id);
    await Event.findByIdAndUpdate(data.eventID, { $pull: { "activity": data._id } });

    res.status(200).json({
      status: "success",
      message: "Activity successfully deleted.",
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: activity could not be deleted.",
      data: {}
    });
  }
};

module.exports = {
  createActivity,
  getActivityById,
  getAllActivities,
  getActivitiesByFilter,
  editActivityDetails,
  deleteActivity,
};
