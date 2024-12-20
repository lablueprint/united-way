const express = require('express');

const organizationRouter = express.Router();
const organizationController = require('../controllers/organizationController');

// General organization operations
organizationRouter.post('/createOrg', organizationController.createOrganization);

organizationRouter.get('/', organizationController.getAllOrganizations);
organizationRouter.get('/:id', organizationController.getOrganizationById);
organizationRouter.post('/filtered', organizationController.getOrganizationsByFilter);

organizationRouter.delete('/:id', organizationController.deleteOrganization);

organizationRouter.patch('/:id', organizationController.editOrganizationDetails);

// Retrieving organization-specific details
organizationRouter.get('/:id/events', organizationController.getAssociatedEvents);

module.exports = organizationRouter;    