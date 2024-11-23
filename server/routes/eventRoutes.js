const express = require('express');

const exampleRouter = express.Router();
const exampleController = require('../controllers/exampleController');

exampleRouter.post('/post', exampleController.createExample);

exampleRouter.get('/get', (req, res) => {
  res.send('Get API');
});

module.exports = exampleRouter;