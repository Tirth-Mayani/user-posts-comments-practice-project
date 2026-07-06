const {body} = require("express-validator");

const createCommentValidator = [
    body("post_no").notEmpty().withMessage("Post number is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
];

const createReplyCommentValidator = [
    body("post_no").notEmpty().withMessage("Post number is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
    body("parent_comment_no").notEmpty().withMessage("Parent comment number is required"),
];

const updateCommentValidator = [
    body("content").trim().notEmpty().withMessage("Content is required"),
];

module.exports = {createCommentValidator, createReplyCommentValidator, updateCommentValidator};