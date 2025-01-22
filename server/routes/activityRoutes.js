const express = require('express');

const activityRouter = express.Router();
const activityController = require('../controllers/activityController');

// Post event routes
activityRouter.post('/createActivity', activityController.createActivity);

// Get event routes
activityRouter.get('/:id', activityController.getActivityById);
activityRouter.get('/', activityController.getAllActivities);
activityRouter.post('/filtered', activityController.getActivitiesByFilter);

// Update and delete routes
activityRouter.patch('/:id', activityController.editActivityDetails);
activityRouter.delete('/:id', activityController.deleteActivity);

module.exports = activityRouter;