const apiError = require('../utils/apiError');
const { validationResult } = require('express-validator');
const { generateId } = require('../utils/customIdGenerator');
const { createComment, createReplyComment, updateCommentByCommentNo, deleteCommentByCommentNo, getCommentsByPostNo, getCommentByCommentNo, getRepliesOfCommentByCommentNo } = require('../models/commentModels');
const { createCommentDTO, createReplyCommentDTO, updateCommentDTO } = require('../dtos/commentDto');
const { getPostByPostNo } = require('../models/postModels');


const createCommentController = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "Validation error", errors.array());
        }

        const user_id = req.user ? req.user.id : null; // Set user_id to null for anonymous users

        const dto = new createCommentDTO(req.body);
        const comment_no = await generateId("comments", "comment_no", "CMT");

        const post_no = req.body.post_no;
        const postExists = await getPostByPostNo(post_no);
        if(!postExists){
            throw new apiError(404, "Post not found");
        }
        const post_id = postExists.id;

        const comment = await createComment({ post_id: post_id, user_id: user_id, content: dto.content, comment_no: comment_no });
        return res.status(201).json({ message: "Comment created successfully", comment });
    } catch (error) {
        next(error);
    }
};

const createReplyCommentController = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "Validation error", errors.array());
        }
        const user_id = req.user ? req.user.id : null; // Set user_id to null for anonymous users

        const dto = new createReplyCommentDTO(req.body);
        const comment_no = await generateId("comments", "comment_no", "CMT");

        const post_no = req.body.post_no;
        const postExists = await getPostByPostNo(post_no);
        if(!postExists){
            throw new apiError(404, "Post not found");
        }
        const post_id = postExists.id;

        const parent_comment_no = req.body.parent_comment_no;
        const parentCommentExists = await getCommentByCommentNo(parent_comment_no);
        if(!parentCommentExists){
            throw new apiError(404, "Comment to reply not found");
        }
        const parent_comment_id = parentCommentExists.id;

        const comment = await createReplyComment({ user_id: user_id, post_id: post_id, comment_no: comment_no, content: dto.content, parent_comment_id: parent_comment_id });
        return res.status(201).json({ message: "Comment created successfully", comment });
    } catch (error) {
        next(error);
    }
};

const updateCommentController = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "Validation error", errors.array());
        }

        const commentExists = await getCommentByCommentNo(req.params.comment_no);
        if(!commentExists){
            throw new apiError(404, "Comment not found");
        }
        if(req.user && req.user.id !== commentExists.user_id) {
            throw new apiError(403, "You are not authorized to update this comment");
        }

        const dto = new updateCommentDTO(req.body);
        const comment_no = req.params.comment_no;
        const comment = await updateCommentByCommentNo(comment_no, dto.content);
        return res.status(200).json({ message: "Comment updated successfully", comment });
    } catch (error) {
        next(error);
    }
};

const deleteCommentController = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "Validation error", errors.array());
        }

        const commentExists = await getCommentByCommentNo(req.params.comment_no);
        if(!commentExists){
            throw new apiError(404, "Comment to delete not found");
        }

        const isAuthor = req.user.id === commentExists.user_id;
        const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

        if(!isAuthor && !isAdmin) {
            throw new apiError(403, "You are not authorized to delete this comment");
        }

        const comment_no = req.params.comment_no;
        const result = await deleteCommentByCommentNo(comment_no);
        return res.status(200).json({message: "Comment deleted successfully", result });

    } catch (error) {
        next(error);
    }
};

const getCommentsByPostNoController = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new apiError(400, "Validation error", errors.array());
        }

        const post_no = req.params.post_no;
        const postExists = await getPostByPostNo(post_no);
        if(!postExists){
            throw new apiError(404, "Post not found");
        }

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 1));
        const offset = (page - 1) * limit;
        const comments = await getCommentsByPostNo(post_no, limit, offset);
        return res.status(200).json({message: "Comments", comments});
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    createCommentController, 
    createReplyCommentController, 
    updateCommentController, 
    deleteCommentController, 
    getCommentsByPostNoController 
};