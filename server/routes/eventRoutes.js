const express = require('express');

const eventRouter = express.Router();
const eventController = require('../controllers/eventController');

// Post event routes
eventRouter.post('/post', eventController.createEvent);

// Get event routes
eventRouter.get('/getEventById/:id', eventController.getEventById);
eventRouter.get('/getAllEvents', eventController.getAllEvents);
eventRouter.get('/getEvents', eventController.getEvents);

// Update and delete routes
eventRouter.patch('/editEventDetails/:id', eventController.editEventDetails);
eventRouter.delete('/deleteEvent/:id', eventController.deleteEvent);

module.exports = eventRouter;