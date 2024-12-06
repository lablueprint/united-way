const Event = require("../models/eventModel");

// Example of creating a document in the database
const createEvent = async (req, res) => {
  const event = new Event(req.body);
  try{
    const data = await event.save(event);
    res.send(data);
  } catch (err) {
    console.error(err);
  }
};

const getEventById = async (req, res) => {
  const eventId = req.params.id;
  try {
    const event = await Event.findById(eventId);
    res.send(event);
  } catch (err) {
    console.error(err);
  }
};

const getAllEvents = async (res) =>
{
  try {
    const events = await Event.find();
    res.send(events);
  } catch (err) {
    console.error(err);
  }
}

const getEvents = async (req, res) => {
  try {
    const events = await Event.find(req.body);
    res.send(events);
  } catch (err) {
    console.error(err);
  }
};

const editEventDetails = async (req, res) => {
  const eventId = req.params.id;
  try {
    const event = await Event.findByIdAndUpdate(eventId, req.body, {
      new: true,
    });
    res.send(event);
  } catch (err) {
    console.error(err);
  }
};

const deleteEvent = async (req, res) => {
  try {
    const data = await Event.findByIdAndDelete(req.params.id);
    res.json({
      message: "Event deleted successfully",
      data: data,
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  createEvent,
  getEventById,
  getAllEvents,
  getEvents,
  editEventDetails,
  deleteEvent,
};
