require('dotenv').config(); // populates all 'secrets' in everything we defined in .env file (how we access ports and other info)

// Module Imports
const express = require('express'); //define route thru express 
const mongoose = require('mongoose');
const cors = require('cors');

const uri = process.env.MONGODB_URI;
const port = process.env.PORT;

// Route Imports
const exampleRouter = require('./routes/exampleRoute.js');
const organizationRouter = require('./routes/organizationRoutes.js');

// Connect to the MongoDB database
async function connectToDatabase() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToDatabase();

// Start the Node Express server
const app = express(); //define app using express, defines handlers
app.use(cors()); // use app.use to use router -- cross origin requests, allow retrieve req from diff ip address
app.use(express.json()); 

// API Routes
app.use('/test', exampleRouter); // given ip address, /test is where example router logic will be handle
app.use('/orgs', organizationRouter);

app.get('/', (req, res) => { // defines a route where if we send get req to the route, will send back resp
  res.send('Hello World!'); //routers are groupings of endpoints
});

app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
