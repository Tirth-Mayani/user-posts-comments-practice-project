const pool = require("../configs/db");

const createPost = async (data) => {
    const {user_id, title, description, post_no} = data;
    const result = await pool.query(
        "INSERT INTO posts (user_id, title, description, post_no) VALUES ($1, $2, $3, $4) RETURNING *",
        [user_id, title, description, post_no]
    );
    return result.rows[0];
};

const updatePost = async (post_no, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const setQuery = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const result = await pool.query(
        `UPDATE posts SET ${setQuery} WHERE post_no = $${keys.length + 1} RETURNING id, user_id, title, description, post_no`,
        [...values, post_no]
    );
    return result.rows[0];
};

const getAllPosts = async (limit, offset) => {
    const result = await pool.query(`SELECT post_no, id, user_id, title, description FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    return result.rows;
};

const getPostById = async (post_no) => {
    const result = await pool.query("SELECT post_no, user_id, title, description FROM posts WHERE post_no = $1", [post_no]);
    return result.rows[0];
};

const getPostByTitle = async (title) => {
    const result = await pool.query("SELECT post_no, user_id, title, description FROM posts WHERE title = $1", [title]);
    return result.rows;
};

const deletePostById = async (post_no) => {
    const result = await pool.query("DELETE FROM posts WHERE post_no = $1 RETURNING *", [post_no]);
    return result.rows[0];
};