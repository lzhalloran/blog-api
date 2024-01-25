// Require specific models so that we can
// create functionality involving them.
const { Role } = require("../models/RoleModel");
const { User } = require("../models/UserModel");

// Model.find({}) returns all documents in a collection.
async function getAllRoles() {
  return await Role.find({});
}

// Model.find({field: value}) returns documents
// that have a specified value for a specified field.
async function getUsersWithRole(roleName) {
  // Get the role ID for the role specified.
  let roleID = await Role.findOne({ name: roleName }).exec();

  // Filter through the Users to find only the ones
  // with the matching role ID.
  let usersFound = await User.find({ role: roleID }).exec();

  return usersFound;
}

// Export the functions for our routes to use.
module.exports = {
  getAllRoles,
  getUsersWithRole,
};
