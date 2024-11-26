const express = require('express');

const organizationRouter = express.Router();
const organizationController = require('../controllers/organizationController');

organizationRouter.get('/', organizationController.getAllOrganizations);
organizationRouter.get('/:id', organizationController.getOrganizationById);

module.exports = organizationRouter;    