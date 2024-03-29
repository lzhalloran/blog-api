// Make the .env data ready for use.
const dotenv = require("dotenv");
dotenv.config();

// Import the Express package and configure some needed data.
const express = require("express");
const app = express();
// If no process.env.X is found, assign a default value instead.
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

// Configure some basic Helmet settings on the server instance.
const helmet = require("helmet");
app.use(helmet());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
    },
  })
);

// Configure some basic CORS settings on the server instance.
// These origin values don't actually have to be anything -
// this project exists without a front-end, but any front-end
// that should interact with this API should be listed in the
// array of origins for CORS configuration.
const cors = require("cors");
var corsOptions = {
  origin: ["http://localhost:5000", "https://deployedApp.com"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Configures some API-friendly request data formatting.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
const mongoose = require('mongoose');
var databaseURL = "";
switch (process.env.NODE_ENV.toLowerCase()) {
  case "test":
    databaseURL = "mongodb://localhost:27017/ExpressBuildAnAPI-test";
    break;
  case "development":
    databaseURL = "mongodb://localhost:27017/ExpressBuildAnAPI-dev";
    break;
  case "production":
    databaseURL = process.env.DATABASE_URL;
    break;
  default:
    console.error("Incorrect JS environment specified, database will not be connected.")
    break;
}
const {databaseConnector} = require('./database');
databaseConnector(databaseURL).then(() => {
  console.log("Database connected successfully!");
}).catch(error => {
  console.log(`
  Some error occured connecting to the database! It was: 
  ${error}
  `);
});
// Return a bunch of useful details from the database connection
// Dig into each property here:
// https://mongoosejs.com/docs/api/connection.html
app.get("/databaseHealth", (request, response) => {
  let databaseState = mongoose.connection.readyState;
  let databaseName = mongoose.connection.name;
  let databaseModels = mongoose.connection.modelNames();
  let databaseHost = mongoose.connection.host;

  response.json({
    readyState: databaseState,
    dbName: databaseName,
    dbModels: databaseModels,
    dbHost: databaseHost
  })
});

app.get("/databaseDump", async (request, response) => {
  // Set up an object to store our data.
  const dumpContainer = {};

  // Get the names of all the collections in the DB.
  var collections = await mongoose.connection.db.listCollections().toArray();
  collections = collections.map((collection) => collection.name);

  // For each collection, get all their data and add it to the dump container.
  for (const collectionName of collections) {
    let collectionData = await mongoose.connection.db
      .collection(collectionName)
      .find({})
      .toArray();
    dumpContainer[collectionName] = collectionData;
  }

  // Confirm in the terminal that the server is returning the right data.
  // With pretty formatting too, via JSON.stringify(vale, null, spacing for indentation).
  console.log(
    "Dumping all of this data to the client: \n" +
      JSON.stringify(dumpContainer, null, 4)
  );

  // Return the big data object.
  response.json({
    data: dumpContainer,
  });
});

// Add a route just to make sure things work.
// This path is the server API's "homepage".
app.get("/", (request, response) => {
  response.json({
    message: "Hello world!",
  });
});

const rolesController = require("./controllers/RoleRoutes");
app.use("/roles", rolesController);

const usersController = require("./controllers/UserRoutes");
app.use("/users", usersController);

const postsController = require("./controllers/PostRoutes");
app.use("/posts", postsController);

// Keep this route at the end of this file, only before the module.exports!
// A 404 route should only trigger if no preceding routes or middleware was run.
// So, put this below where any other routes are placed within this file.
app.get("*", (request, response) => {
  response.status(404).json({
    message: "No route with that path found!",
    attemptedPath: request.path,
  });
});

// Export everything needed to run the server.
module.exports = {
  HOST,
  PORT,
  app,
};
