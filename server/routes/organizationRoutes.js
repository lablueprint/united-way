const express = require("express");
const fileUpload = require("express-fileupload");

const organizationRouter = express.Router();
const organizationController = require("../controllers/organizationController");

// File upload middleware
organizationRouter.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached",
  })
);

// General organization operations
organizationRouter.post(
  "/createOrg",
  organizationController.createOrganization
);

organizationRouter.get("/", organizationController.getAllOrganizations);
organizationRouter.get("/:id", organizationController.getOrganizationById);
organizationRouter.post(
  "/filtered",
  organizationController.getOrganizationsByFilter
);

organizationRouter.delete("/:id", organizationController.deleteOrganization);

organizationRouter.patch(
  "/:id",
  organizationController.editOrganizationDetails
);
organizationRouter.post(
  "/:id/addImage",
  organizationController.addImageToOrganization
);

// Retrieving organization-specific details
organizationRouter.get(
  "/:id/events",
  organizationController.getAssociatedEvents
);

module.exports = organizationRouter;
