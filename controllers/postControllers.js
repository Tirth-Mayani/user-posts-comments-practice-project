const apiError = require("../utils/apiError");
const { validationResult } = require("express-validator");
const { generateId } = require("../utils/customIdGenerator");
const {createPost, updatePostByPostNo, getAllPosts, getPostByPostNo, getPostByTitle, deletePostByPostNo, getUserPostsByUserNo, getPostsByUserDisplayName} = require("../models/postModels");
const {CreatePostDTO} = require("../dtos/postDto");

const createPostController = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw new apiError(400, "Validation error", errors.array());
        }
        const dto = new CreatePostDTO(req.body);
        const post_no = await generateId("posts", "post_no", "POST");
        const user_id = req.user.id;
        const post = await createPost({user_id: user_id, title: dto.title, description: dto.description, post_no: post_no});
        return res.status(201).json({message: "Post created successfully", post});
    }catch(error){
        next(error);
    }
};

const updatePostController = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            throw new apiError(400, "Validation error", errors.array());
        }
        const {post_no} = req.params;
        const user_id = req.user.id;

        const postExists = await getPostByPostNo(post_no);
        if(!postExists){
            throw new apiError(404, "Post to update not found");
        }
        else if(postExists.user_id !== user_id){
            throw new apiError(403, "You are not authorized to update this post");
        }

        const allowedFields = ["title", "description"];
        const updateData = {};
        for (const [key, value] of Object.entries(req.body)) {
            if (allowedFields.includes(key)) {
                updateData[key] = value;
            }
        }
        const post = await updatePostByPostNo(post_no, {});
        return res.status(200).json({message: "Post updated successfully", post});
    }catch(error){
        next(error);
    }
};

const getAllPostsController = async (req, res, next) => {
    try{
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit)));
        const offset = (page - 1) * limit;

        const posts = await getAllPosts(limit, offset);
        return res.status(200).json({message: "All posts", posts});
    }catch(error){
        next(error);
    }
};

const deletePostController = async (req, res, next) => {
    try{
        const {post_no} = req.params;
        const user_id = req.user.id;

        const postExists = await getPostByPostNo(post_no);
        if(!postExists){
            throw new apiError(404, "Post not found");
        }
        else if(postExists.user_id !== user_id){
            throw new apiError(403, "You are not authorized to delete this post");
        }

        const post = await deletePostByPostNo(post_no, user_id);
        return res.status(200).json({message: "Post deleted successfully", post});
    }catch(error){
        next(error);
    }
};

const getPostByPostTitleController = async (req, res, next) => {
    try{
        const title = req.params.title.trim();
        const post = await getPostByTitle(title);
        if(!post){
            throw new apiError(404, "Post not found with the given title");
        }
        return res.status(200).json({message: "Post details", post});
    }catch(error){
        next(error);
    }
};

const getUserPostsByUserNoController = async (req, res, next) => {
    try{
        const {user_no} = req.params;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit)));
        const offset = (page - 1) * limit;
        const posts = await getUserPostsByUserNo(user_no, limit, offset);
        if(posts.length === 0){
            throw new apiError(404, "No posts found for the given user");
        }
        return res.status(200).json({message: "User posts", posts});
    }catch(error){
        next(error);
    }
};

const getPostsByUserDisplayNameController = async (req, res, next) => {
    try{
        const displayName = req.body.display_name.trim();
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit)));
        const offset = (page - 1) * limit;
        const posts = await getPostsByUserDisplayName(displayName, limit, offset);
        if(posts.length === 0){
            throw new apiError(404, "No posts found for the given user");
        }
        return res.status(200).json({message: "Posts by user display name", posts});
    }catch(error){
        next(error);
    }
};

module.exports = {
    createPostController,
    updatePostController,
    getAllPostsController,
    deletePostController,
    getPostByPostTitleController,
    getUserPostsByUserNoController,
    getPostsByUserDisplayNameController
};