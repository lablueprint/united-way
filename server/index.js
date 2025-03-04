require("dotenv").config(); // populates all 'secrets' in everything we defined in .env file (how we access ports and other info)

// Module Imports
const express = require("express"); //define route thru express
const { expressjwt: jwt } = require("express-jwt");
const mongoose = require("mongoose");
const cors = require("cors");

const uri = process.env.MONGODB_URI;
const port = process.env.PORT;

// Route Imports
const exampleRouter = require('./routes/exampleRoute.js');
const authRouter = require('./routes/authRoutes.js')
const eventRouter = require('./routes/eventRoutes.js');
const organizationRouter = require('./routes/organizationRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const activityRouter = require('./routes/activityRoutes.js')
const twoFactorRouter = require('./routes/twoFactorRoutes.js')
// Connect to the MongoDB database
async function connectToDatabase() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectToDatabase();

// Start the Node Express server
const app = express(); // Define app using express, defines handlers
app.use(cors()); // Use app.use to use router -- cross origin requests, allow retrieve req from diff ip address
app.use(express.json());

// API Routes
app.use("/test", exampleRouter); // given ip address, /test is where example router logic will be handle
app.use("/auth", authRouter);

app.use(
  "/orgs",
  jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
  }).unless({ path: ["/orgs/createOrg", "/orgs/filtered"] })
);
app.use("/orgs", organizationRouter);

app.use(
  "/users",
  jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
  }).unless({ path: ["/users/createUser", /^\/users\/email\/([^\/]*)$/] })
);
app.use("/users", userRouter);

app.use(
  "/events",
  jwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
  })
);
app.use("/events", eventRouter);

app.use("/activities", activityRouter);

app.use('/twofactor' ,twoFactorRouter);

app.use('/twofactor' ,twoFactorRouter);

app.get('/', (req, res) => { // defines a route where if we send get req to the route, will send back resp
  res.send('Hello World!'); // routers are groupings of endpoints
});

const { createServer } = require("http");
const socketIo = require("socket.io");

const server = createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Listen for a custom event from the client
  socket.on('message', (data) => {
    console.log(`Message from client: ${data}`);
    io.emit('message', `Thank you for ${data}`); // Broadcast to all clients
    socket.emit('message', `Server received: ${data}`); // Send to specific client
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

app.use((req, res, next) => {
  req.io = io;
  return next();
});

server.listen(port, () => {
  console.log(`Server started at port ${port}`);
});