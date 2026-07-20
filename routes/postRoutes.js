const express = require("express");
const router = express.Router();
const PostController = require("../controllers/postControllers");
const {createPostValidator} = require("../validators/postValidators");
const authMiddleware = require("../middlewares/authMiddleware");
const passport = require("../middlewares/passport");

//creating a new post for verified users
router.post("/create", passport.authenticate("jwt", { session: false }), createPostValidator, PostController.createPostController);

//updating a post by post_no by the post owner
router.put("/update/:post_no", passport.authenticate("jwt", { session: false }), PostController.updatePostController);

//getting all posts with pagination
router.get("/all", PostController.getAllPostsController);

//deleting a post by post_no by the post owner
router.delete("/delete/:post_no", passport.authenticate("jwt", { session: false }), PostController.deletePostController);

//getting posts by their title (search functionality)
router.get("/title/:title", PostController.getPostByPostTitleController);

//getting posts by user_no with pagination
router.get("/user/:user_no", passport.authenticate("jwt", { session: false }), PostController.getUserPostsByUserNoController);

//getting posts by user display name with pagination
router.get("/display_name", PostController.getPostsByUserDisplayNameController);

module.exports = router;