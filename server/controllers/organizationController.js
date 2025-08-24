require("dotenv").config();
const bcrypt = require("bcrypt");
const Organization = require("../models/organizationModel");
const { putObject, deleteObject } = require("../utils/aws/s3Bucket");
const { generateToken } = require("../controllers/authController");

const createOrganization = async (req, res) => {
  try {
    req.body.dateJoined = new Date();

    bcrypt.hash(
      req.body.password,
      `$2b$${process.env.SALT_ROUNDS}$${process.env.HASH_SALT}`,
      async (err, hash) => {
        req.body.password = hash;
        const newOrganization = new Organization(req.body);
        const data = await newOrganization.save(newOrganization);
        console.log("This is the data", data);
        res.status(201).json({
          status: "success",
          message: "Organization successfully created.",
          data: data,
          authToken: generateToken({
            tokenType: "access",
            uid: data._id,
            role: "organization",
          }),
          refreshToken: generateToken({ tokenType: "refresh", uid: data._id }),
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: organization could not be created.",
      data: {},
    });
  }
};

// only using req when we apply filters
const getAllOrganizations = async (req, res) => {
  if (req.auth.role != "admin") {
    res.status(401).json({
      status: "failure",
      message: "Invalid authorization token for request.",
      data: {},
    });
    return;
  }
  try {
    const organizations = await Organization.find();
    res.status(200).json({
      status: "success",
      message: "Organization(s) successfully retrieved.",
      data: organizations,
    });
  } catch (err) {
    res.status(500).json({
      status: "failure",
      message: "Server-side error: could not retrieve all organizations.",
      data: {},
    });
  }
};

// for async functions must use await -- so you can resolve content later
// pass in parameter of curly braces == no filter
const getOrganizationById = async (req, res) => {
  if (
    req.auth.role != "admin" &&
    req.auth.role != "user" &&
    req.auth.role != "organization"
  ) {
    res.status(401).json({
      status: "failure",
      message: "Invalid authorization token for request.",
      data: {},
    });
    return;
  }
  const organizationId = req.params.id;
  try {
    const organizationByID = await Organization.findOne({
      _id: organizationId,
    });
    if (organizationByID) {
      res.status(200).json({
        status: "success",
        message: "Organization successfully retrieved.",
        data: organizationByID,
      });
    } else {
      res.status(404).json({
        status: "failure",
        message: "Error: organization not found.",
        data: {},
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "failure",
      message: "Server-side error: could not find organization.",
      data: {},
    });
  }
};

const getOrganizationsByFilter = async (req, res) => {
  try {
    const orgByFilter = await Organization.find(req.body);
    if (orgByFilter) {
      res.status(200).json({
        status: "success",
        message: "Organization(s) successfully retrieved",
        data: orgByFilter,
      });
    } else {
      res.status(404).json({
        status: "failure",
        message: "Organization not found.",
        data: {},
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "failure",
      message: "Server-side error: could not find organization by attribute.",
      data: {},
    });
  }
};

const editOrganizationDetails = async (req, res) => {
  console.log("This is checking auth for org", req.auth.role);
  if (req.auth.role != "organization") {
    res.status(401).json({
      status: "failure",
      message: "Invalid authorization token for request.",
      data: {},
    });
    return;
  }

  const orgId = req.params.id;

  // The following fields should not be edited using this function.
  delete req.body["_id"];
  delete req.body["email"];
  delete req.body["password"];

  const updateInput = req.body;
  try {
    console.log("This is the update input", updateInput);
    const result = await Organization.updateOne(
      { _id: orgId },
      { $set: updateInput }
    );
    if (result.modifiedCount === 0) {
      res.status(304).json({
        status: "failure",
        message: "Organization not found or no changes made.",
        data: {},
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Organization updated successfully.",
        data: result,
      });
    }
  } catch (err) {
    console.error("Error in editOrganizationDetails:", err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: update not completed.",
      data: {},
    });
  }
};

// using id to find which organization we're returning
const getAssociatedEvents = async (req, res) => {
  const orgId = req.params.id;
  orgId;
  try {
    const organizationByID = await Organization.findOne({ _id: orgId });
    if (organizationByID) {
      const eventList = organizationByID["activeEvents"];
      eventList;
      res.status(200).json({
        status: "success",
        message: "Successfully received associated events for organization",
        data: eventList,
      });
    } else {
      res.status(404).json({
        status: "failure",
        message: "Organization not found.",
        data: {},
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "failure",
      message: "Server-side error finding organization.",
      data: {},
    });
  }
};

const deleteOrganization = async (req, res) => {
  if (req.auth.role != "organization" && req.auth.role != "admin") {
    res.status(401).json({
      status: "failure",
      message: "Invalid authorization token for request.",
      data: {},
    });
    return;
  }
  const orgId = req.params.id;
  try {
    const result = await Organization.deleteOne({ _id: orgId });
    if (result.deletedCount === 0) {
      res.status(404).json({
        status: "failure",
        message: "Organization not found or already deleted.",
        data: {},
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Organization deleted successfully.",
        data: result,
      });
    }
  } catch {
    res.status(500).json({
      status: "failure",
      message: "Server-side error: could not find organization.",
      data: {},
    });
  }
};

const addImageToOrganization = async (req, res) => {
  if (req.auth.role !== "admin" && req.auth.role !== "organization") {
    return res.status(401).json({
      status: "failure",
      message: "Invalid authorization token for request.",
      data: {},
    });
  }

  if (!req.files || !req.files.image) {
    return res.status(400).json({
      status: "failure",
      message: "No image file provided",
      data: {},
    });
  }

  const orgId = req.params.id;
  const image = req.files.image;
  const fileName = `organizations/${orgId}/${Date.now()}-${image.name}`;

  try {
    // Upload to S3
    const result = await putObject(image.data, fileName);
    console.log("S3 upload result:", result);
    if (!result) {
      throw new Error("Failed to upload to S3");
    }
    console.log("Image uploaded to S3:", result.url);

    // Send back the URL
    return res.status(200).json({
      status: "success",
      imageUrl: result.url,
    });
  } catch (err) {
    console.error("Error in addImageToOrganization:", err);
    res.status(500).json({
      status: "failure",
      message: "Server-side error: image could not be uploaded",
      data: {},
    });
  }
};

module.exports = {
  createOrganization,
  getAllOrganizations,
  getOrganizationsByFilter,
  getOrganizationById,
  editOrganizationDetails,
  getAssociatedEvents,
  deleteOrganization,
  addImageToOrganization,
};
