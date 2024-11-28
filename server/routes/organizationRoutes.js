const express = require('express');

const organizationRouter = express.Router();
const organizationController = require('../controllers/organizationController');

organizationRouter.post('/createOrg', organizationController.createOrganization);
organizationRouter.get('/', organizationController.getAllOrganizations);
organizationRouter.get('/:id', organizationController.getOrganizationById);
organizationRouter.get('/byAttr', organizationController.getOrganizations);
organizationRouter.patch('/edit/:id', organizationController.editOrganizationDetails);
organizationRouter.get('/events/:id', organizationController.getAssociatedEvents);
organizationRouter.delete('/delete/:id', organizationController.deleteOrganization);
module.exports = organizationRouter;    