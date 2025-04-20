require("dotenv").config();
const bcrypt = require("bcrypt");
const Organization = require("../models/organizationModel");
const { generateToken } = require("../controllers/authController");

const createOrganization = async (req, res) => {
  try {
    bcrypt.hash(
      req.body.password,
      `$2b$${process.env.SALT_ROUNDS}$${process.env.HASH_SALT}`,
      async (err, hash) => {
        req.body.password = hash;
        const newOrganization = new Organization(req.body);
        const data = await newOrganization.save(newOrganization);
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
    if (req.auth.role != 'admin') {
        res.status(401).json({
            status: "failure",
            message: "Invalid authorization token for request.",
            data: {}
        });
        return;
    }
    try {
        const organizations = await Organization.find();
        res.status(200).json({
            status: "success",
            message: "Organization(s) successfully retrieved.",
            data: organizations
        });
    } catch (err) {
        res.status(500).json({
            status: "failure",
            message: "Server-side error: could not retrieve all organizations.",
            data: {}
        });
    }
};

// for async functions must use await -- so you can resolve content later
// pass in parameter of curly braces == no filter
const getOrganizationById = async (req, res) => {
    if (req.auth.role != 'admin' && req.auth.role != "user") {
        res.status(401).json({
      status: "failure",
      message: "Invalid authorization token for request.",
      data: {}
    });
        return;
    }
    const organizationId = req.params.id;
    try {
        const organizationByID = await Organization.findOne({  _id: organizationId });
        if (organizationByID) {
            res.status(200).json({
                status: "success",
                message: "Organization successfully retrieved.",
                data: organizationByID
            });
        }
        else {
            res.status(404).json({
                status: "failure",
                message: "Error: organization not found.",
                data: {}
            });
        }
    } catch (err) {
        res.status(500).json({
            status: "failure",
            message: "Server-side error: could not find organization.",
            data: {}
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
  if (req.auth.role != 'organization') {
    res.status(401).json({
      status: "failure",
      message: "Invalid authorization token for request.",
      data: {}
    });
    return;
  }

  const orgId = req.params.id;
  const updateInput = req.body;
  try {
    const result = await Organization.updateOne(
      { _id: orgId },
      { $set: updateInput }
    );
    if (result.modifiedCount === 0) {
      res.status(404).json({
        status: "failure",
        message: "Organization not found or no changes made.",
        data: result,
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Organization updated successfully.",
        data: result,
      });
    }
  } catch (err) {
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
  try {
    const organizationByID = await Organization.findOne({ _id: orgId });
    if (organizationByID) {
      const eventList = organizationByID["activeEvents"];
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
      data: {}
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

module.exports = {
  createOrganization,
  getAllOrganizations,
  getOrganizationsByFilter,
  getOrganizationById,
  editOrganizationDetails,
  getAssociatedEvents,
  deleteOrganization,
};
