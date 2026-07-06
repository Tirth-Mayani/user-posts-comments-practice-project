const {body} = require("express-validator");

const createPostValidator = [
    body("title").trim().notEmpty().withMessage("Title is required").isLength({max: 100}).withMessage("Title cannot exceed 100 characters"),
    body("description").trim().notEmpty().withMessage("Description is required"),
];

module.exports = {createPostValidator};