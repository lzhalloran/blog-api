// Import Express
const express = require("express");
// Create an instance of an Express Router
const router = express.Router();

const { User } = require("../models/UserModel");

const {
  encryptString,
  decryptString,
  decryptObject,
  hashString,
  validateHashedData,
  generateJWT,
  generateUserJWT,
  verifyUserJWT,
  getAllUsers,
  getSpecificUser,
  createUser,
  updateUser,
  deleteUser,
} = require("./UserFunctions");

// Sign-up a new user
router.post("/sign-up", async (request, response) => {
  let userDetails = {
    email: request.body.email,
    password: request.body.password,
    username: request.body.username,
    country: request.body.country,
    roleID: request.body.roleID,
  };
  let newUserDoc = await createUser(userDetails);

  response.json({
    user: newUserDoc,
  });
});

// Sign-in an existing user
router.post("/sign-in", async (request, response) => {
  let targetUser = await User.findOne({ email: request.body.email }).exec();

  if (await validateHashedData(request.body.password, targetUser.password)) {
    let encryptedUserJwt = await generateUserJWT({
      userID: targetUser.id,
      email: targetUser.email,
      password: targetUser.password,
    });

    response.json(encryptedUserJwt);
  } else {
    response.status(400).json({ message: "Invalid user details provided." });
  }
});

// Extend a user's JWT validity
router.post("/token-refresh", async (request, response) => {
  let oldToken = request.body.jwt;
  let refreshResult = await verifyUserJWT(oldToken).catch((error) => {
    return { error: error.message };
  });
  response.json(refreshResult);
});

// Update a user
router.put("/:userID", async (request, response) => {
  let userDetails = {
    userID: request.params.userID,
    updatedData: request.body.newUserData,
  };

  response.json(await updateUser(userDetails));
});

// Delete a user
router.delete("/:userID", async (request, response) => {
  response.json(await deleteUser(request.params.userID));
});

// List all users
router.get("/", async (request, response) => {
  let allUsers = await getAllUsers();

  response.json({
    userCount: allUsers.length,
    usersArray: allUsers,
  });
});

// Show a specific user
router.get("/:userID", async (request, response) => {
  response.json(await getSpecificUser(request.params.userID));
});

// Export the router so that other files can use it:
module.exports = router;
