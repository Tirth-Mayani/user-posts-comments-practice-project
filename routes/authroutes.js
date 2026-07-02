const express = require("express");
const router = express.Router();
const {body} = require("express-validator");

const AuthController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {registerUserValidator, loginUserValidator, roleUpdateValidator} = require("../validators/authValidators");

// register a new user
router.post("/register", registerUserValidator, AuthController.registerUser);

//login user
router.post("/login", loginUserValidator, AuthController.loginUser);

//get all users (only accessible by admin and superadmin)
router.get("/users_list", authMiddleware, roleMiddleware("admin", "superadmin"), AuthController.getUserList);

//get user details by display name (accessible by all authenticated users)
router.get("/user/display_name/:display_name", authMiddleware, AuthController.getUserDisplayName);

//get user details by user number (accessible by all authenticated users)
router.get("/user/:user_number", authMiddleware, AuthController.getUserId);

//get user details by primary key (accessible by all authenticated users)
router.get("/user/pkey/:id", authMiddleware, AuthController.getUserByPKey);

//update user details (only accessible by admin and superadmin)
router.put("/update_user/:user_number", authMiddleware, roleMiddleware("admin", "superadmin"), AuthController.updateUserById);

//update user role (only accessible by admin and superadmin)
router.patch("/update_user_role/:user_number", authMiddleware, roleMiddleware("admin", "superadmin"), roleUpdateValidator, AuthController.updateUserRoleById);

module.exports = router;