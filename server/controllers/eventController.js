const Event = require("../models/eventModel");
const Organization = require("../models/organizationModel")

// Creates an event and uses the organizer id to add to the organizer's event-list.
const createEvent = async (req, res) => {
  const event = new Event(req.body);
  try{
    // Create the event.
    const data = await event.save(event);
    
    // Save the event in the list of active events for the organizer.
    await Organization.findByIdAndUpdate({ _id: data.organizerID }, { $addToSet: { activeEvents: data._id } });
    res.status(201).json({
      status: "success",
      message: "Event successfully created.",
      data: data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: event could not be created.",
      data: {}
    });
  }
};

const addUserToEvent = async (req, res) => {
  if (req.auth.role != 'admin' && req.auth.role != 'user') {
    res.status(401).json({
      status: "failure",
      message: "Invalid authorization token for request.",
      data: {}
    });
    return;
  }
  
  const origId = req.params.id;
  const { newUser } = req.body;
  
  try {

    const result = await Event.updateOne( { _id: origId }, { $addToSet: { registeredUsers: newUser }});
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
} catch (err)   {
    res.status(500).json({
        status: "failure",
        message: "Server-side error: update not completed.",
        data: {}
    });
}
}

const removeUserFromEvent = async (req, res) => {
  if (req.auth.role != 'admin' && req.auth.role != 'user') {
    res.status(401).json({
      status: "failure",
      message: "Invalid authorization token for request.",
      data: {}
    });
    return;
  }

  const eventId = req.params.id;
  const userId = req.body.userId;

  try {
    const result = await Event.findOneAndUpdate(
      { _id: eventId }, 
      { $pull: { registeredUsers: userId}});
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

const getEventById = async (req, res) => {
  const eventId = req.params.id;
  try {
    const event = await Event.findById(eventId);
    res.status(200).json({
      status: "success",
      message: "Event successfully received.",
      data: event
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: event could not be received.",
      data: {}
    });
  }
};

const getAllEvents = async (req, res) =>
{
  try {
    const events = await Event.find();
    res.status(200).json({
      status: "success",
      message: "Event(s) successfully received.",
      data: events
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: events could not be retrieved.",
      data: {}
    });
  }
}

//
// TODO: filter by including sub-element matches as well
// and not just hard equality (i.e. matching those that 
// include certain tags instead of all of the tags)
//
// ex. [tag1, tag2] search should result in all events that INCLUDE
// such tags but may have more.
//
// Might be useful to look at $elemMatch in MongoDB.
//
const getEventsByFilter = async (req, res) => {
  try {
    const events = await Event.find(req.body);
    res.status(200).json({
      status: "success",
      message: "Event successfully received.",
      data: events
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: could not receive events.",
      data: {}
    });
  }
};

const editEventDetails = async (req, res) => {
  const eventId = req.params.id;
  try {
    const event = await Event.findByIdAndUpdate(eventId, req.body, {
      new: true,
    });
    res.status(200).json({
      status: "success",
      message: "Event successfully edited.",
      data: event
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: event could not be edited.",
      data: {}
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const data = await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      message: "Event successfully deleted.",
      data: data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: event could not be deleted.",
      data: {}
    });
  }
};

module.exports = {
  createEvent,
  removeUserFromEvent,
  getEventById,
  getAllEvents,
  getEventsByFilter,
  editEventDetails,
  deleteEvent,
  addUserToEvent,
};
