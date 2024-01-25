// Import Express
const express = require("express");
// Create an instance of an Express Router
const router = express.Router();

const {
  getAllPosts,
  getPostById,
  getPostsByAuthor,
  createPost,
  updatePost,
  deletePost,
} = require("./PostFunctions");

// Show all posts
router.get("/", async (request, response) => {
  let allPosts = await getAllPosts();

  response.json({
    postsCount: allPosts.length,
    postsArray: allPosts,
  });
});

// Show posts by specific user
router.get("/author/:authorID", async (request, response) => {
  let postsByAuthor = await getPostsByAuthor(request.params.authorID);

  response.json({
    postsCount: postsByAuthor.length,
    postsArray: postsByAuthor,
  });
});

// Show specific post by ID
router.get("/:postID", async (request, response) => {
  response.json(await getPostById(request.params.postID));
});

// Create a post
router.post("/", async (request, response) => {
  response.json(await createPost(request.body.postDetails));
});

// Update a specific post
router.put("/:postID", async (request, response) => {
  let postDetails = {
    postID: request.params.postID,
    updatedData: request.body.newPostData,
  };

  response.json(await updatePost(postDetails));
});

// Delete a specific post
router.delete("/:postID", async (request, response) => {
  response.json(await deletePost(request.params.postID));
});

// Export the router so that other files can use it:
module.exports = router;
