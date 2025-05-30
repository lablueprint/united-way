const Event = require("../models/eventModel");
const { putObject, deleteObject } = require("../utils/aws/s3Bucket");

// Example of creating a document in the database
const createEvent = async (req, res) => {
  req.body.organizerID = req.params.id;
  req.body.name = "Title";
  const event = new Event(req.body);
  try {
    const data = await event.save(event);
    res.status(201).json({
      status: "success",
      message: "Event successfully created.",
      data: data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: event could not be created.",
      data: {},
    });
  }
};

// Note: to use this route, you need to provide multi-part form data
// where one key-value pair is image with the associated file.
const addImageToEvent = async (req, res) => {
  if (req.auth.role != "admin" && req.auth.role != "organization") {
    res.status(401).json({
      status: "failure",
      message: "Invalid authorization token for request.",
      data: {}
    });
    return;
  }

  if (!req.files || !req.files.image) {
    return res.status(400).json({
      status: "failure",
      message: "No image file provided",
      data: {},
    });
  }

  const eventId = req.params.id;
  const image = req.files.image;
  const fileName = `events/${eventId}/${Date.now()}-${image.name}`;

  try {
    // Upload to S3
    const result = await putObject(image.data, fileName);

    if (!result) {
      throw new Error("Failed to upload to S3");
    }

    // Update event with image URL and key
    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        imageURL: result.url,
        key: result.key,
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Image successfully uploaded",
      data: event,
    });
  } catch (err) {
    console.error("Error in addImageToEvent:", err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: image could not be uploaded",
      data: {},
    });
  }
};

const removeImageFromEvent = async (req, res) => {
  if (req.auth.role != "admin" && req.auth.role != "organization") {
    res.status(401).json({
      status: "failure",
      message: "Invalid authorization token for request.",
      data: {}
    });
    return;
  }
  const eventId = req.params.id;

  try {
    // Get event to find the S3 key
    const event = await Event.findById(eventId);
    if (!event || !event.key) {
      return res.status(404).json({
        status: "failure",
        message: "Event or image not found",
        data: {},
      });
    }

    // Delete from S3
    await deleteObject(event.key);

    // Update event to remove image info
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        $unset: {
          imageURL: 1,
          key: 1,
        },
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Image successfully removed",
      data: updatedEvent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: image could not be removed",
      data: {},
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
    const result = await Event.updateOne(
      { _id: origId },
      { $addToSet: { registeredUsers: newUser } }
    );
    if (result.modifiedCount === 0) {
      res.status(404).json({
        status: "failure",
        message: "Event not found or no changes made.",
        data: result,
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Event updated successfully.",
        data: result,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "failure",
      message: "Server-side error: update not completed.",
      data: {},
    });
  }
};

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
      { $pull: { registeredUsers: userId } }
    );
    if (result.modifiedCount === 0) {
      res.status(404).json({
        status: "failure",
        message: "Event not found or no changes made.",
        data: result,
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Event updated successfully.",
        data: result,
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "failure",
      message: "Server-side error: update not completed.",
      data: {},
    });
  }
};

const getEventById = async (req, res) => {
  const eventId = req.params.id;
  try {
    ("Here is the event", eventId);
    const event = await Event.findById(eventId);
    (event);
    res.status(200).json({
      status: "success",
      message: "Event successfully received.",
      data: event,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: event could not be received.",
      data: {},
    });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({
      status: "success",
      message: "Event(s) successfully received.",
      data: events,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: events could not be retrieved.",
      data: {},
    });
  }
};

const getEventsByOrganization = async (req, res) => {
  try {
    const events = await Event.find({organizerID: req.params.id});
    res.status(200).json({
      status: "success",
      message: "Event successfully received.",
      data: events,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: could not receive events.",
      data: {},
    });
  }
}

const getAllEventsByTag = async (req, res) => {
  try {
    const tag = req.params.tag;
    const orgId = req.body.orgId;

    // Ensure the date is provided
    if (!tag) {
      tag = "All";
    }
    data_dict = {}
    // Parse the date and calculate the start and end of the day
    const todayStart = new Date();
    const todayEnd = new Date();
    todayStart.setHours(0, 0, 0, 0);
    todayEnd.setHours(23, 59, 59, 999);


    // Query the database for events on the specific day, sorted by date
    if (tag == "Upcoming") {
      const events = await Event.find({
        organizerID: orgId,
        date: {
          $gte: todayEnd,
        },
      }).sort({ date: -1 }); // Sort by the date field in ascending order
      data_dict["Upcoming"] = events;
      res.status(200).json({
        status: "success",
        message: "Event(s) successfully received.",
        data: data_dict
      });
    }
    else if (tag == "Current") {
      const events = await Event.find({
        organizerID: orgId,
        date: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      }).sort({ date: -1 }); // Sort by the date field in ascending order
      data_dict["Current"] = events;
       res.status(200).json({
        status: "success",
        message: "Event(s) successfully received.",
        data: data_dict
      });
    }
    else if (tag == "Past") {
      const events = await Event.find({
        organizerID: orgId,
        date: {
          $lte: todayStart,
        },
      }).sort({ date: -1 }); // Sort by the date field in ascending order
      data_dict["Past"] = events;
      res.status(200).json({
        status: "success",
        message: "Event(s) successfully received.",
        data: data_dict,
      });
    }
    else {
      const eventsCurrent = await Event.find({
        organizerID: orgId,
        date: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      }).sort({ date: -1 }); // Sort by the date field in ascending order
      data_dict["Current"] = eventsCurrent;

      const eventsUpcoming = await Event.find({
        organizerID: orgId,
        date: {
          $gte: todayEnd,
        },
      }).sort({ date: -1 }); // Sort by the date field in ascending order
      data_dict["Upcoming"] = eventsUpcoming;

      const eventsPast = await Event.find({
        organizerID: orgId,
        date: {
          $lte: todayStart,
        },
      }).sort({ date: -1 }); // Sort by the date field in ascending order
      data_dict["Past"] = eventsPast;
      
      res.status(200).json({
        status: "success",
        message: "Event(s) successfully received.",
        data: data_dict,
      });

    }
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error." });
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
      data: events,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: could not receive events.",
      data: {},
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
      data: event,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: event could not be edited.",
      data: {},
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    console.log("deleting event")
    const data = await Event.findByIdAndDelete(req.params.id);
    console.log(data)
    res.status(200).json({
      status: "success",
      message: "Event successfully deleted.",
      data: data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: event could not be deleted.",
      data: {},
    });
  }
};

const addActivity = async (req, res) => {
  try {
      const { id } = req.params; 
      const { activity } = req.body; 

      const event = await Event.findById(id);
      
      event.activity.push(activity);

      await event.save();

      res.status(200).json({ message: "Activity added successfully.", event });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred while adding the activity.", error });
  }
};

const getPolls = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    const polls = event.activity.filter(a => a.type === 'poll' );
    
    res.status(200).json({
      polls: polls
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: event could not be received.",
    });
  }
}

const getEventsByDay = async (req, res) => {
  try {
    const date = req.params.date;

    // Ensure the date is provided
    if (!date) {
      return res.status(400).json({ error: "A date is required." });
    }

    // Parse the date and calculate the start and end of the day
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
  
    endOfDay.setHours(23, 59, 59, 999);

    // Query the database for events on the specific day, sorted by date
    const events = await Event.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ date: 1 }); // Sort by the date field in ascending order
    res.status(200).json({
      status: "success",
      message: "Event successfully deleted.",
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  createEvent,
  removeUserFromEvent,
  getEventById,
  getAllEvents,
  getEventsByFilter,
  getEventsByOrganization,
  editEventDetails,
  deleteEvent,
  addUserToEvent,
  addActivity,
  getPolls,
  addImageToEvent,
  removeImageFromEvent,
  getEventsByDay,
  getAllEventsByTag,
};
