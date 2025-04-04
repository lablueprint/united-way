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

// Model Imports
const eventModel = require('./models/eventModel.js');
const activityModel = require('./models/activityModel.js');

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

// Socket.IO Setup
const { createServer } = require("http");
const socketIo = require("socket.io");
const server = createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
app.set('io', io);

mongoose.connection.once('open', async () => {
  // Fetch all events from the database
  const events = await eventModel.find({});
  events.forEach(async (event) => {
    const roomName = event._id.toString();
    const startTimeDiff = new Date(event.startDate).getTime() - new Date().getTime();
    const endTimeDiff = new Date(event.endDate).getTime() - new Date().getTime();
    if (startTimeDiff > 0) {
      setTimeout(() => {
        // Let all clients in the event room know the event is starting
        io.to(roomName).emit('event start', event);
      }, startTimeDiff);
    }
    if (endTimeDiff > 0) {
      setTimeout(() => {
        // Let all clients in the event room know the event is ending
        io.to(roomName).emit('event end', event);
        // Disconnect all sockets in the event room
        io.of("/").in(roomName).fetchSockets().then((sockets) => {
            sockets.forEach((socket) => {
              // Disconnect each socket
                socket.disconnect(true);
            });
        });
      }, endTimeDiff);
    }
    // Get activities for the event
    const eventActivities = event.activity;
    for (const id of eventActivities) {
      try {
        const activity = await activityModel.findById(id);
        if (activity) {
          const activityStartTimeDiff = new Date(activity.timeStart).getTime() - new Date().getTime();
          const activityEndTimeDiff = new Date(activity.timeEnd).getTime() - new Date().getTime();
          if (activityStartTimeDiff > 0) {
            setTimeout(() => {
              // Let all clients in the event room know the activity is starting
              io.to(roomName).emit('activity start', activity);
            }, activityStartTimeDiff);
          }
          if (activityEndTimeDiff > 0) {
            setTimeout(() => {
              // Let all clients in the event room know the activity is ending
              io.to(roomName).emit('activity end', activity);
            }, activityEndTimeDiff);
          }
        } else {
          console.log(`Activity with ID ${id} not found`);
        }
      } catch (err) {
        console.error(err);
      }
    }
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    // Send a message to the client upon connection
    socket.emit('message', 'Welcome to the server!');

    // Have the client join a room based on the event ID
    socket.on('join event', (eventDetails) => {
      const roomName = eventDetails._id.toString();
      socket.join(roomName);
      console.log(`Client ${socket.id} joined room: ${roomName}`);
    });
  
    // Listen for messages from the client
    socket.on('message', (data) => {
      console.log(`Message from client: ${data}`);
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
});

app.use((req, res, next) => {
  req.io = io;
  return next();
});

server.listen(port, () => {
  console.log(`Server started at port ${port}`);
});