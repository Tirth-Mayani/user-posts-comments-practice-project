const express = require("express");
const router = express.Router();
const {body} = require("express-validator");
const {registerUser, loginUser} = require("../controllers/authController");

const