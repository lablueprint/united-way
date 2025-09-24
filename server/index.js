require("dotenv").config(); // populates all 'secrets' in everything we defined in .env file (how we access ports and other info)

// Module Imports
const express = require("express"); //define route thru express
const { expressjwt: jwt } = require("express-jwt");
const mongoose = require("mongoose");
const cors = require("cors");

const uri = process.env.MONGODB_URI;
const port = 4000;
const jwtSecret = process.env.JWT_SECRET;

// Route Imports
const exampleRouter = require("./routes/exampleRoute.js");
const authRouter = require("./routes/authRoutes.js");
const eventRouter = require("./routes/eventRoutes.js");
const organizationRouter = require("./routes/organizationRoutes.js");
const userRouter = require("./routes/userRoutes.js");
const activityRouter = require("./routes/activityRoutes.js");
const twoFactorRouter = require("./routes/twoFactorRoutes.js");
const transactionRouter = require("./routes/transactionRoutes.js");

// Connect to the MongoDB database
async function connectToDatabase() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectToDatabase();

// Start the Node Express server
const app = express(); //define app using express, defines handlers
app.use(cors()); // use app.use to use router -- cross origin requests, allow retrieve req from diff ip address
app.use(express.json());

// Health check endpoint for ALB (before other routes)
app.get("/api/health", (req, res) => {
  // Check MongoDB connection
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mongodb: mongoStatus,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes - Updated with /api prefix
app.use("/api/test", exampleRouter); // given ip address, /api/test is where example router logic will be handle
app.use("/api/auth", authRouter);

app.use(
  "/api/orgs",
  jwt({
    secret: jwtSecret,
    algorithms: ["HS256"],
  }).unless({ path: ["/api/orgs/createOrg", "/api/orgs/filtered"] })
);
app.use("/api/orgs", organizationRouter);

app.use(
  "/api/users",
  jwt({
    secret: jwtSecret,
    algorithms: ["HS256"],
  }).unless({ path: ["/api/users/createUser", /^\/api\/users\/email\/([^\/]*)$/] })
);
app.use("/api/users", userRouter);

app.use(
  "/api/events",
  jwt({
    secret: jwtSecret,
    algorithms: ["HS256"],
  })
);
app.use("/api/events", eventRouter);

app.use("/api/activities", activityRouter);

app.use(
  "/api/twofactor",
  jwt({
    secret: jwtSecret,
    algorithms: ["HS256"],
  }).unless({
    path: [
      "/api/twofactor/sendOTP",  // <- allow without token
      "/api/twofactor/verifyCode"    // <- allow user to verify OTP without token
    ]
  })
);
app.use("/api/twofactor", twoFactorRouter);

app.use(
  "/api/transactions",
  jwt({
    secret: jwtSecret,
    algorithms: ["HS256"],
  })
);
app.use("/api/transactions", transactionRouter);

// Root endpoint (non-API)
app.get("/api", (req, res) => {
  // defines a route where if we send get req to the route, will send back resp
  res.send("Hello World!"); //routers are groupings of endpoints
});

app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});