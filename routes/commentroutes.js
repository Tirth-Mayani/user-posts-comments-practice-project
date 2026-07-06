const router = require("express").Router();
const commentController = require("../controllers/commentControllers");
const { createCommentValidator, createReplyCommentValidator, updateCommentValidator } = require("../validators/commentValidators");
const authMiddleware = require("../middlewares/authMiddleware");
const commentAuthMiddleware = require("../middlewares/commentAuthMiddleware");

// Create a new comment
router.post("/create", commentAuthMiddleware, createCommentValidator, commentController.createCommentController);

// Create a new reply comment
router.post("/create_reply", commentAuthMiddleware, createReplyCommentValidator, commentController.createReplyCommentController);

// Update a comment
router.put("/update/:comment_no", authMiddleware, updateCommentValidator, commentController.updateCommentController);

// Delete a comment
router.delete("/delete/:comment_no", authMiddleware, commentController.deleteCommentController);

// Get comments for a specific post
router.get("/post/:post_no", commentController.getCommentsByPostNoController);

module.exports = router;