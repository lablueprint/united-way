const express = require('express');

const eventRouter = express.Router();
const eventController = require('../controllers/eventController');

// Post event routes
eventRouter.post('/createEvent', eventController.createEvent);

// Get event routes
eventRouter.get('/:id', eventController.getEventById);
eventRouter.get('/', eventController.getAllEvents);
eventRouter.post('/filtered', eventController.getEventsByFilter);

// Update and delete routes
eventRouter.patch('/:id', eventController.editEventDetails);
eventRouter.delete('/:id', eventController.deleteEvent);

eventRouter.post('/:id/addActivity', eventController.addActivity)

module.exports = eventRouter;