const bcrypt = require("bcrypt");
const pool = require("../configs/db");
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;
const apiError = require("../utils/apiError");
const {createUser, updateUser, updateUserRole, getUsers, getUserById, getUserByEmail, getUserByDisplayName} = require("../models/userModels");
const { RegisterUserDTO, LoginUserDTO, roleUpdateDTO} = require("../dtos/authDto");
const { validationResult } = require("express-validator");

const {generateId} = require("../utils/customIdGenerator");
// Register a new user
const registerUser = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw new apiError(400, "Validation error", errors.array());
        }

        const dto = new RegisterUserDTO(req.body);

        const checkUniqueEmail = await getUserByEmail(dto.email);
        if(checkUniqueEmail){
            throw new apiError(400, "Email already exists");
        }

        const checkUniqueDisplayName = getUserByDisplayName(dto.display_name);
        if(checkUniqueDisplayName){
            throw new apiError(400, "entered Display name is not available");
        }

        const user_no = await generateId("users", "user_no", "USR");

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await createUser({user_no, username: dto.username, display_name: dto.display_name, email: dto.email, password: hashedPassword});
        user.delete("password");
        return res.status(201).json({message: "User created successfully", user});
    }catch(error){
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw new apiError(400, "Validation error", errors.array());
        }

        const dto = new LoginUserDTO(req.body);
        const user = await getUserByEmail(dto.email);
        if(!user){
            throw new apiError(400, "User does not exist");
        }
        const isPasswordMatch = await bcrypt.compare(dto.password, user.password);
        if(!isPasswordMatch){
            throw new apiError(400, "Invalid password");
        }
        const token = jwt.sign({user_no: user.user_no, user_email: user.email, role: user.role}, secretKey, {expiresIn: "3h"});
        return res.status(200).json({message: "Login successful", token});

    }catch(error){
        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try{
        const user_number = req.params;
        const data = req.body;

        if(Object.keys(data).length === 0){
            throw new apiError(400, "No data provided to update the user");
        }

        const allowed_fields = ['username', 'role', 'display_name', 'email', 'password', 'created_at', 'updated_at'];
        const filtered_data = {};

        for(const field of allowed_fields){ 
            if(field in data){
                if(field === "password"){
                    const hashedPassword = await bcrypt.hash(data[field], 10);
                    filtered_data[field] = hashedPassword;
                    continue;
                }

                filtered_data[field] = data[field];
            }
        }

        if(Object.keys(filtered_data).length === 0){
            throw new apiError(400, "No valid fields provided to update the user");
        }

        const updatedUser = await updateUser(user_number, filtered_data);
        updatedUser.delete("password");
        return res.status(200).json({message: "User updated successfully", updatedUser});

    }catch(error){
        next(error);
    }
};

const getUserList = async (req, res, next) => {
    try{
        const users = await getUsers();
        return res.status(200).json({message: "User list", users});
    }catch(error){
        next(error);
    }
};

const updateUserRole = async (req, res, next) => {
    try{
        const {user_number} = req.params;


        const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw new apiError(400, "Validation error", errors.array());
        }

        const dto = new roleUpdateDTO(req.body);

        const updatedUser = await updateUserRole(user_number, dto.role);
        updatedUser.delete("password");
        return res.status(200).json({message: "User role updated successfully", updatedUser});
    }catch(error){
        next(error);
    }
};

const getUserId = async (req, res, next) => {
    try{
        const user_number = req.params;
        const user = await getUserById(user_number);
        return res.status(200).json({message: "User details", user});
    }catch(error){
        next(error);
    }
};

const getUserDisplayName = async (req, res, next) => {
    try{
        const display_name = req.params;
        const user = await getUserByDisplayName(display_name);
        return res.status(200).json({message: "User details", user});
    }catch(error){
        next(error);
    }    
};

module.exports = {
    registerUser,
    loginUser,
    updateUser,
    getUserList,
    updateUserRole,
    getUserId,
    getUserDisplayName
}