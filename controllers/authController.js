const bcrypt = require("bcrypt");
const pool = require("../configs/db");
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;
const apiError = require("../utils/apiError");
const {createUser, updateUser, updateUserRole, getUsers, getUserById, getUserByEmail, getUserByDisplayName, getUserByPId} = require("../models/userModels");
const { RegisterUserDTO, LoginUserDTO, roleUpdateDTO} = require("../dtos/authDto");
const { validationResult } = require("express-validator");
const { getCache, setCache, deleteCache, deleteMultipleCache, cacheKeys } = require("../utils/cache");

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

        const checkUniqueDisplayName = await getUserByDisplayName(dto.display_name);
        if(checkUniqueDisplayName){
            throw new apiError(400, "entered Display name is not available");
        }

        const user_no = await generateId("USR");

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await createUser({user_no, username: dto.username, display_name: dto.display_name, email: dto.email, password: hashedPassword});
        delete user.password;
        //adding user data to redis cache 
        await deleteCache(cacheKeys.USERS_ALL);
        await setCache(cacheKeys.user(user.user_no), user);
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
        const token = jwt.sign({id: user.id, user_email: user.email, role: user.role, user_no: user.user_no}, secretKey, {expiresIn: "3d"});
        return res.status(200).json({message: "Login successful", token});

    }catch(error){
        next(error);
    }
};

const updateUserById = async (req, res, next) => {
    try{
        const {user_number} = req.params;
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

        //invalidating user's cache and all users cached list
        await deleteMultipleCache([cacheKeys.user(user_number), cacheKeys.USERS_ALL]);

        // setting the updated user data to redis cache
        await setCache(cacheKeys.user(user_number), updatedUser);

        return res.status(200).json({message: "User updated successfully", updatedUser});

    }catch(error){
        next(error);
    }
};

const getUserList = async (req, res, next) => {
    try{

        const page = Math.max(1, parseInt(req.query.page) || 1); // Default page is 1
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10)); // Default limit is 10 and max it can go till 100
        const offset = (page - 1) * limit;

        //generating new cacheKey for users list with page and limit
    //const cacheKey = `${cacheKeys.USERS_ALL}:page:${page}:limit:${limit}`;   //it will be complex to store each paged list and to renew all upon addition of new user

        // getting cached list of users
        // currently storing paged list as USERS_ALL for test purpose
        const cachedUsers = await getCache(cacheKeys.USERS_ALL);
        if(cachedUsers){
            return res.status(200).json({message: "User list:", page, limit, users: cachedUsers});
        }

        //fetching the list from the db
        const users = await getUsers(limit, offset);        

        //setting users list to redis cache
        await setCache(cacheKeys.USERS_ALL, users);

        return res.status(200).json({message: "User list:", page, limit, users});
    }catch(error){
        next(error);
    }
};

const updateUserRoleById = async (req, res, next) => {
    try{
        const {user_number} = req.params;


        const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw new apiError(400, "Validation error", errors.array());
        }

        const dto = new roleUpdateDTO(req.body);

        const updatedUser = await updateUserRole(user_number, dto.role);
        delete updatedUser.password;

        //invalidating user's cache and all users cached list
        await deleteMultipleCache([cacheKeys.user(user_number), cacheKeys.USERS_ALL]);

        // setting the updated user data to redis cache
        await setCache(cacheKeys.user(user_number), updatedUser);

        return res.status(200).json({message: "User role updated successfully", updatedUser});
    }catch(error){
        next(error);
    }
};

const getUserId = async (req, res, next) => {
    try{
        const {user_number} = req.params;

        //checking in cache
        const cachedUser = await getCache(cacheKeys.user(user_number));
        if(cachedUser){
            return res.status(200).json({message: "User details", user: cachedUser});
        }

        const user = await getUserById(user_number);
        if(!user){
            throw new apiError(404, "User not found");
        }

        //setting user data in cache
        await setCache(cacheKeys.user(user_number), user);
        return res.status(200).json({message: "User details", user});
    }catch(error){
        next(error);
    }
};

/**
 * can use lookup keyto search by email or other fields as .....
 * email --> userNo --> user data
 * display_name --> userNo --> user data
 * becasue our main caching is with userNo
 * because all lookups in redis are ~O(1)
 */
const getUserDisplayName = async (req, res, next) => {
    try{
        const {display_name} = req.params;

        const user = await getUserByDisplayName(display_name);
        if(!user){
            throw new apiError(404, "User not found");
        }
        return res.status(200).json({message: "User details", user});
    }catch(error){
        next(error);
    }    
};

const getUserByPKey = async (req, res, next) => {
    try{
        const {id} = req.params;
        const user = await getUserByPId(id);
        if(!user){
            throw new apiError(404, "User not found");
        }
        return res.status(200).json({message: "User details", user});
    }catch(error){
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateUserById,
    getUserList,
    updateUserRoleById,
    getUserId,
    getUserDisplayName,
    getUserByPKey
}