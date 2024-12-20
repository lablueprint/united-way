const express = require('express');

const userRouter = express.Router();
const userController = require('../controllers/userController');

// General user operations
userRouter.get('/', userController.getAllUsers);
userRouter.get('/:id', userController.getUserById);
userRouter.delete('/:id', userController.deleteUser);
userRouter.patch('/:id', userController.editUserDetails);
userRouter.post('/createUser', userController.createNewUser);

module.exports = userRouter;