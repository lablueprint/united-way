const Organization = require('../models/organizationModel');

const createOrganization = async (req, res) => {
    const newOrganization = new Organization(req.body);
    try {
        const data = await newOrganization.save(newOrganization);
        res.send(data);
    } catch (err) {
      console.error(err);
    }
};

// only using req when we apply filters
const getAllOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find();
        res.json(organizations);
    } catch (err) {
        res.status(500).send('Error retrieving all organizations');
    }
};

// for async functions must use await -- so you can resolve content later
// pass in parameter of curly braces == no filter 
const getOrganizationById = async (req, res) => {
    const organizationId = req.params.id;
    try {
        const organizationByID = await Organization.findOne({  _id: organizationId });
        if (organizationByID) {
            res.json(organizationByID);
        }
        else {
            res.status(404).send('Organization not found')
        }
    } catch (err) {
        res.status(500).send('Error finding organization');
    }
};

const getOrganizations = async (req, res) => {
    try {
        const orgByInfo= await Organization.findOne( req.body );
        if (orgByInfo) {
            res.json(orgByInfo);
        } 
        else {
            res.status(404).send('Organization not found');
        }
    } catch (err) {
        res.status(500).send('Error finding organization by attribute');
    }
};

const editOrganizationDetails = async (req, res) => {
    const orgId = req.params.id;
    const updateInput = req.body;

    try {
        const result =  await Organization.updateOne( { _id: orgId }, { $set: updateInput});
        if (result.modifiedCount === 0) {
            res.status(404).send('Organization not found or no changes made');
        }

        res.send('Organization updated successfully');
    } catch (err) {
        res.status(500).send('Update not completed');
    }
}

// using id to find which organization we're returning
const getAssociatedEvents = async (req, res) => {
    const orgId = req.params.id;
    try {
        const organizationByID = await Organization.findOne({  _id: orgId });
        if (organizationByID) {
            const eventList = organizationByID['activeEvents'];
            res.json(eventList);
        }
        else {
            res.status(404).send('Organization not found')
        }
    } catch (err) {
        res.status(500).send('Error finding organization');
    }
}

const deleteOrganization = async (req, res) => {
    const orgId = req.params.id;
    try {
        const result = await Organization.deleteOne({ _id: orgId})
        if (result.deletedCount === 0){
            res.status(404).send('Organization not found or already deleted');
        } else {
            res.send('Organization deleted successfully.');
        }
    } catch {
        res.status(500).send('Error finding organization');
    }
}

module.exports = {
    createOrganization,
    getAllOrganizations,
    getOrganizations,
    getOrganizationById,
    editOrganizationDetails,
    getAssociatedEvents,
    deleteOrganization
};