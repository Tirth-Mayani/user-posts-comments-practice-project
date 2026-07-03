const pool = require("../configs/db");

const createPost = async (data) => {
    const {user_id, title, description, post_no} = data;
    const result = await pool.query(
        "INSERT INTO posts (user_id, title, description, post_no) VALUES ($1, $2, $3, $4) RETURNING *",
        [user_id, title, description, post_no]
    );
    return result.rows[0];
};

const updatePostByPostNo = async (post_no, user_id, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const setQuery = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const result = await pool.query(
        `UPDATE posts SET ${setQuery} WHERE post_no = $${keys.length + 1} AND user_id = $${keys.length + 2} AND deleted_at IS NULL RETURNING id, user_id, title, description, post_no`,
        [...values, post_no, user_id]
    );
    return result.rows[0];
};

const getAllPosts = async (limit, offset) => {
    const result = await pool.query(`SELECT post_no, id, user_id, title, description FROM posts WERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    return result.rows;
};

const getPostByPostNo = async (post_no) => {
    const result = await pool.query("SELECT post_no, user_id, title, description FROM posts WHERE post_no = $1 AND deleted_at IS NULL", [post_no]);
    return result.rows[0];
};

const getPostByTitle = async (title) => {
    const result = await pool.query("SELECT p.post_no, u.user_id, u.username, p.title, p.description FROM posts p JOIN users u ON p.user_id = u.id WHERE title ILIKE $1 AND deleted_at IS NULL", [`%${title}%`]);
    return result.rows;
};

const deletePostByPostNo = async (post_no, user_id) => {
    const result = await pool.query("UPDATE posts SET deleted_at = NOW() WHERE post_no = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING post_no, title, deleted_at", [post_no, user_id]);
    return result.rows[0];
};

const getUserPostsByUserNo = async (user_no, limit, offset) => {
    const result = await pool.query(
        `SELECT p.post_no, p.title, p.description, p.created_at, 
            u.user_no AS author_no, u.display_name AS author 
            FROM posts p JOIN users u ON p.user_id = u.id 
            WHERE u.user_no = $1 AND p.deleted_at IS NULL 
            ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
            [user_no, limit, offset]
        );
    return result.rows;
};

const getPostsByUserDisplayName = async(display_name, limit, offset) => {
    const result = await pool.query(
        `SELECT p.post_no, p.title, p.description, p.created_at, 
            u.user_no AS author_no, u.display_name AS author 
            FROM posts p JOIN users u ON p.user_id = u.id 
            WHERE u.display_name ILIKE $1 AND p.deleted_at IS NULL 
            ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
            [`%${display_name}%`, limit, offset]
        );
    return result.rows;
};

module.exports ={
    createPost,
    updatePostByPostNo,
    getAllPosts,
    getPostByPostNo,
    getPostByTitle,
    deletePostByPostNo,
    getUserPostsByUserNo,
    getPostsByUserDisplayName
}