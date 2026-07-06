const {body} = require("express-validator");

const registerUserValidator = [
    body("username").notEmpty().withMessage("Username is required"),
    body("display_name").notEmpty().withMessage("Display name is required"),
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required").isLength({min: 6}).withMessage("Password must be at least 6 characters long"),
];

const loginUserValidator = [
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required").isLength({min: 6}).withMessage("Password must be at least 6 characters long"),
];

const roleUpdateValidator = [
    body("role").notEmpty().withMessage("Role is required").isIn(["admin", "user", "guest", "superadmin"]).withMessage("Invalid role value"),
];

module.exports = {
    registerUserValidator, 
    loginUserValidator, 
    roleUpdateValidator
};