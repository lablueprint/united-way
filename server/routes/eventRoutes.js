const express = require("express");

const eventRouter = express.Router();
const eventController = require("../controllers/eventController");
const fileUpload = require("express-fileupload");

// File upload middleware
eventRouter.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached",
  })
);
// Post event routes
eventRouter.post("/createEvent", eventController.createEvent);

// Get event routes
eventRouter.get("/:id", eventController.getEventById);
eventRouter.get("/", eventController.getAllEvents);
eventRouter.post("/filtered", eventController.getEventsByFilter);

// Update and delete routes
eventRouter.patch("/:id", eventController.editEventDetails);
eventRouter.patch("/:id/addImage", eventController.addImageToEvent);
eventRouter.patch("/:id/removeImage", eventController.removeImageFromEvent);
eventRouter.patch("/:id/addImage", eventController.addImageToEvent);
eventRouter.patch("/:id/removeImage", eventController.removeImageFromEvent);
eventRouter.delete("/:id", eventController.deleteEvent);

module.exports = eventRouter;
