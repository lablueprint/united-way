const express = require('express');
const socketRouter = express.Router();
const socketController = require('../controllers/socketController');

socketRouter.post("/new-message", (req, res) => {
    req.io.emit("new-message", { content: req.body.content });
    return res.send({ success: true });
});

// socketRouter.post('/connect', socketController.connect);
  
module.exports = socketRouter;