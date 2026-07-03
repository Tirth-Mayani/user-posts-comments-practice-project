const {body} = require("express-validator");

const createPostValidator = [
    body("title").notEmpty().withMessage("Title is required").isLength({max: 100}).withMessage("Title cannot exceed 100 characters"),
    body("description").notEmpty().withMessage("Description is required"),
];

module.exports = {createPostValidator};