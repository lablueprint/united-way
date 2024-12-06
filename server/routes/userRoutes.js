const express = require('express');

const userRouter = express.Router();
const userController = require('../controllers/userController');

userRouter.get('/get', userController.getAllUsers);
userRouter.get('/:id', userController.getUserById);
userRouter.delete('/:id', userController.deleteUser);
userRouter.patch('/:id', userController.editUserDetails);

/*
exampleRouter.get('/get', (req, res) => {
  res.send('Get API');
});
*/

module.exports = userRouter;