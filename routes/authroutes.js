const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const AuthController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const passport = require("../middlewares/passport");
const { registerUserValidator, loginUserValidator, roleUpdateValidator } = require("../validators/authValidators");

// register a new user
/* 
#swagger.tags = ['Authentication']
#swagger.summary = 'Register User'
#swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
        $ref: '#/definitions/registerUser'
    }
}
#swagger.responses[201] = {
    description: 'User registered successfully',}
#swagger.responses[400] = {
    description: 'Validation error',}
#swagger.responses[500] = {
    description: 'Internal server error',}
*/
router.post("/register", registerUserValidator, AuthController.registerUser);

//login user
/* 
#swagger.tags = ['Authentication']
#swagger.summary = 'Login User'
#swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
        $ref: '#/definitions/loginUser'
    }
}
#swagger.responses[200] = {
    description: 'Login successful',}
#swagger.responses[400] = {
    description: 'Validation error',}
#swagger.responses[500] = {
    description: 'Internal server error',}
*/
router.post("/login", loginUserValidator, AuthController.loginUser);

//get all users (only accessible by admin and superadmin)
/* 
#swagger.tags = ['Authentication']
#swagger.summary = 'Get All Users'
#swagger.parameters['page'] = {
    in: 'query',
    required: false,
    schema: {
        type: 'Integer'
    }
}
#swagger.parameters['limit'] = {
    in: 'query',
    required: false,
    schema: {
        type: 'Integer'
    }
}
#swagger.responses[200] = {
    description: 'Users list',}
#swagger.responses[400] = {
    description: 'Validation error',}
#swagger.responses[500] = {
    description: 'Internal server error',}
*/
router.get("/users_list", passport.authenticate("jwt", { session: false }), roleMiddleware("admin", "superadmin"), AuthController.getUserList);

//get user details by display name (accessible by all authenticated users)
router.get("/user/display_name/:display_name", passport.authenticate("jwt", { session: false }), AuthController.getUserDisplayName);

//get user details by user number (accessible by all authenticated users)
router.get("/user/:user_number", passport.authenticate("jwt", { session: false }), AuthController.getUserId);

//get user details by primary key (accessible by all authenticated users)
//router.get("/user/pkey/:id", authMiddleware, AuthController.getUserByPKey);

//update user details (only accessible by admin and superadmin)
router.put("/update_user/:user_number", passport.authenticate("jwt", { session: false }), roleMiddleware("admin", "superadmin"), AuthController.updateUserById);

//update user role (only accessible by admin and superadmin)
router.patch("/update_user_role/:user_number", passport.authenticate("jwt", { session: false }), roleMiddleware("admin", "superadmin"), roleUpdateValidator, AuthController.updateUserRoleById);

module.exports = router;