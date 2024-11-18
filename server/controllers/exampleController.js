const Example = require('../models/exampleModel');

// Example of creating a document in the database
const createExample = async (req, res) => {
  const test = new Example(req.body);
  try {
    const data = await test.save(test);
    res.send(data);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  createExample,
};