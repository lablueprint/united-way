const express = require('express');

const eventRouter = express.Router();
const eventController = require('../controllers/eventController');

// exampleRouter.get('/get', (req, res) => {
//   res.send('Get API');
// });

//post event routes
eventRouter.post('/post', eventController.createEvent);

//event ID: 674566b94157d0f2cf500913
//get event routes
eventRouter.get('/getEventById/:id', eventController.getEventById);
eventRouter.get('/getAllEvents', eventController.getAllEvents);
eventRouter.get('/getEvents', eventController.getEvents);

//update and delete routes
eventRouter.patch('/editEventDetails/:id', eventController.editEventDetails);
eventRouter.delete('/deleteEvent/:id', eventController.deleteEvent);

//export the router
module.exports = eventRouter;