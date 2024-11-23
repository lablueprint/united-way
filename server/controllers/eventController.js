const Example = require("../models/eventModel");

// Example of creating a document in the database
const createEvent = async (req, res) => {
  const test = new Event(req.body);
  try {
    const data = await test.save(test);
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

const eventSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  date: {
    required: true,
    type: Date,
  },
  description: {
    required: true,
    type: String,
  },
  location: {
    required: true,
    type: GeoJSON,
  },
  organizerID: {
    required: true,
    type: String,
  },
  tags: {
    required: true,
    type: [String],
  },
  registeredUsers: {
    required: true,
    type: [String],
  },
  activity: {
    required: true,
    type: [String],
  },
});

const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ _id: req.OrganizerID });
    res.send(events);

    if (!user) {
      console.log(
        res.status(404).json({ message: "Organizer Events not found" })
      );
    }
    const { _id, name, email, phone, location } = user;
  } catch (err) {
    console.error(err);
  }
};

const updateEvent = async (req, res) => {
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
};
