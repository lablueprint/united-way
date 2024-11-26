const Organization = require('../models/organizationModel');

const getAllOrganizations = async (req, res) => {
    const allOrganization = new Organization(req.body);
    try {
        const data = await allOrganization.save(allOrganization);
        res.send(data);
    } catch (err) {
      console.error(err);
    }
};
// const getAllOrganizations
// pass in parameter of curly braces == no filter 
const getOrganizationById = async (req, res) => {
    const organizationId = req.params.id;
    console.log(organizationId);
    const organizationByID = Organization.findOne(organizationId);

    if (organizationByID) {
        res.json(organizationByID)
    }else {
        res.status(404).send('User not found');
    }
}

module.exports = {
    getAllOrganizations,
    getOrganizationById,
};