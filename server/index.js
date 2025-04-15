require('dotenv').config(); // populates all 'secrets' in everything we defined in .env file (how we access ports and other info)

// Module Imports
const express = require('express'); //define route thru express 
const { expressjwt: jwt } = require("express-jwt");
const mongoose = require('mongoose');
const cors = require('cors');

const uri = process.env.MONGODB_URI;
const port = process.env.PORT;

// Route Imports
const exampleRouter = require('./routes/exampleRoute.js');
const authRouter = require('./routes/authRoutes.js')
const eventRouter = require('./routes/eventRoutes.js');
const organizationRouter = require('./routes/organizationRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const activityRouter = require('./routes/activityRoutes.js');

// Model Imports
const eventModel = require('./models/eventModel.js');
const activityModel = require('./models/activityModel.js');

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
const app = express(); // Define app using express, defines handlers

// Socket.IO Setup
const { createServer } = require("http");
const socketIo = require("socket.io");
const server = createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.set('io', io);
app.use(cors()); // Use app.use to use router -- cross origin requests, allow retrieve req from diff ip address
app.use(express.json());

// API Routes
app.use('/test', exampleRouter); // given ip address, /test is where example router logic will be handle
app.use('/auth', authRouter);

app.use('/orgs',
  jwt(
  {
    secret: process.env.JWT_SECRET, 
    algorithms: ["HS256"]
  }).unless({path: ["/orgs/createOrg", "/orgs/filtered"]})
)
app.use('/orgs', organizationRouter);

app.use('/users', 
  jwt(
  {
    secret: process.env.JWT_SECRET, 
    algorithms: ["HS256"]
  }).unless({path: ["/users/createUser", /^\/users\/email\/([^\/]*)$/]})
)
app.use('/users', userRouter);

app.use('/events',
  jwt (
    {
      secret: process.env.JWT_SECRET, 
      algorithms: ["HS256"]
    }
  )
);

app.use('/events', eventRouter);

app.use('/activities', activityRouter);

app.get('/', (req, res) => { // defines a route where if we send get req to the route, will send back resp
  res.send('Hello World!'); // routers are groupings of endpoints
});

app.use((req, res, next) => {
  req.io = io;
  return next();
});

mongoose.connection.once('open', async () => {
  // Fetch all events from the database
  const events = await eventModel.find({});
  events.forEach(async (event) => {
    const eventRoom = event._id.toString();
    const startTimeDiff = new Date(event.startDate).getTime() - new Date().getTime();
    const endTimeDiff = new Date(event.endDate).getTime() - new Date().getTime();
    if (startTimeDiff > 0) {
      setTimeout(() => {
        // Let all clients in the event room know the event is starting
        io.to(eventRoom).emit('event start', event);
      }, startTimeDiff);
    }
    if (endTimeDiff > 0) {
      setTimeout(() => {
        // Let all clients in the event room know the event is ending
        io.to(eventRoom).emit('event end', event);
        // Disconnect all sockets in the event room
        io.of("/").in(eventRoom).fetchSockets().then((sockets) => {
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
          if (activity.type === "raffle") {
            // Create a raffle room for the event
            const raffleRoom = `${eventRoom}-raffle`;
            if (activityStartTimeDiff > 0) {
              setTimeout(async () => {
                const sockets = await io.in(raffleRoom).allSockets();
                const raffleRoomSize = sockets.size;
                if (raffleRoomSize > 0) {
                  // Draw a random raffle number
                  const randomIndex = Math.floor(Math.random() * raffleRoomSize);
                  const raffleNumbers = Array.from(eventRooms[eventRoom].usedRaffleNumbers);
                  const randomRaffleNumber = raffleNumbers[randomIndex];
                  console.log(`Drew raffle number: ${randomRaffleNumber}`);
                  // Tell all clients in the raffle room if they won or lost
                  sockets.forEach((socketId) => {
                    const socket = io.sockets.sockets.get(socketId);
                    if (socket.raffleNumber === randomRaffleNumber) {
                      socket.emit('raffle winner', { randomRaffleNumber });
                    }
                    else {
                      socket.emit('raffle loser', { randomRaffleNumber });
                    }
                  });
                  // Regenerate random raffle numbers for all clients in the raffle room
                  eventRooms[eventRoom].usedRaffleNumbers = new Set();
                  sockets.forEach((socketId) => {
                    const socket = io.sockets.sockets.get(socketId);
                    let raffleNumber;
                    do {
                      raffleNumber = Math.floor(100000 + Math.random() * 900000);
                    } while (eventRooms[eventRoom].usedRaffleNumbers.has(raffleNumber));
                    eventRooms[eventRoom].usedRaffleNumbers.add(raffleNumber);
                    socket.raffleNumber = raffleNumber;
                    socket.emit('new raffle number', { raffleNumber });
                    console.log(`Generated raffle number: ${raffleNumber}`);
                  });
                }
                else {
                  console.log(`No clients in raffle room ${raffleRoom}`);
                }
              }, activityStartTimeDiff);
            }
          } else {
            if (activityStartTimeDiff > 0) {
              setTimeout(() => {
                // Let all clients in the event room know the activity is starting
                io.to(eventRoom).emit('activity start', activity);
              }, activityStartTimeDiff);
            }
            if (activityEndTimeDiff > 0) {
              setTimeout(() => {
                // Let all clients in the event room know the activity is ending
                io.to(eventRoom).emit('activity end', activity);
              }, activityEndTimeDiff);
            }
          }
        } else {
          console.log(`Activity with ID ${id} not found`);
        }
      } catch (err) {
        console.error(err);
      }
    }
  });

  const eventRooms = {};

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    // Send a message to the client upon connection
    socket.emit('message', 'Welcome to the server!');

    // Handle client joining a room based on the event ID
    socket.on('join event', (eventDetails) => {
      const eventRoom = eventDetails._id.toString();
      socket.join(eventRoom);
      console.log(`Client ${socket.id} joined room: ${eventRoom}`);
    });

    // Handle client leaving an event room
    socket.on('leave event', (eventDetails) => {
      const eventRoom = eventDetails._id.toString();
      socket.leave(eventRoom);
      console.log(`Client ${socket.id} left room: ${eventRoom}`);
      socket.leave(`${eventRoom}-raffle`);
      console.log(`Client ${socket.id} left room: ${eventRoom}-raffle`);
      // Remove the raffle number from the usedRaffleNumbers set
      if (socket.raffleNumber && eventRooms[eventRoom]) {
        eventRooms[eventRoom].usedRaffleNumbers.delete(socket.raffleNumber);
      }
    });
  
    // Listen for messages from the client
    socket.on('message', (data) => {
      console.log(`Message from client: ${data}`);
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Listen for raffle join requests
    socket.on('join raffle', (eventDetails) => {
      const eventRoom = eventDetails._id.toString();
      const raffleRoom = `${eventRoom}-raffle`;
      socket.join(raffleRoom);
      console.log(`Client ${socket.id} joined raffle room: ${raffleRoom}`);
      // Add entry in eventRooms data structure if it doesn't exist
      if (!eventRooms[eventRoom]) {
        eventRooms[eventRoom] = {};
        eventRooms[eventRoom].usedRaffleNumbers = new Set();
      }
      // TODO: Decide if there is a limit to the number of people who can join a raffle
      // Generate a random raffle number for the client
      let raffleNumber;
      do {
        raffleNumber = Math.floor(100000 + Math.random() * 900000);
      } while (eventRooms[eventRoom].usedRaffleNumbers.has(raffleNumber));
      eventRooms[eventRoom].usedRaffleNumbers.add(raffleNumber);
      socket.raffleNumber = raffleNumber;
      socket.emit('new raffle number', { raffleNumber });
      console.log(`Generated raffle number: ${raffleNumber}`);
    });
  });
});

server.listen(port, () => {
  console.log(`Server started at port ${port}`);
});