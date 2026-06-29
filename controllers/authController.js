const bcrypt = require("bcrypt");
const pool = require("../configs/db");
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;
const {validationResult} = require("express-validator");
const apiError = require("../utils/apiError");


// Register a new user
const registerUser = async (req, res) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }
    }catch(error){

    }
}