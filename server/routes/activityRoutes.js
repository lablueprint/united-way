const express = require('express');

const activityRouter = express.Router();
const activityController = require('../controllers/activityController');

activityRouter.post('/createActivity', activityController.createNewActivity);

module.exports = activityRouter;