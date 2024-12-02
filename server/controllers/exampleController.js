const Example = require('../models/exampleModel');

// Example of creating a document in the database
const createExample = async (req, res) => {
  // Contains example obj
  const test = new Example(req.body); 
  try {
    // test --> Example obj, but is schema model for mongoose
    // test.save --> Mongoose API call --> Saves data in db
    // Once await resolves, it will retrun result of save
    // res --> obj for responses from exp.js
    // .json.send.asdfsdaf --> returns response in format to CALLER (HTTP requester (mobile/server/insomnia))
    const data = await test.save(test);
    res.send(data);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  createExample,
};