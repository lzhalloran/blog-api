// Import Express
const express = require("express");
// Create an instance of an Express Router
const router = express.Router();

// Import our new functions:
const { getUsersWithRole, getAllRoles } = require("./RoleFunctions");

// Configure routes attached to the router instance

// Show all roles
router.get("/", async (request, response) => {
  let responseData = {};

  responseData = await getAllRoles();

  response.json({
    data: responseData,
  });
});

// Show all users with a matching role
// Uses route params, notice the request.params too!
router.get("/:roleName", async (request, response) => {
  let responseData = {};

  responseData = await getUsersWithRole(request.params.roleName);

  response.json({
    data: responseData,
  });
});

// Export the router so that other files can use it:
module.exports = router;
