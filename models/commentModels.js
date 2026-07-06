const pool = require("../configs/db");

const createComment = async (data) => {
    const { post_id, user_id, content, comment_no } = data;
    const result = await pool.query(
        "INSERT INTO comments (post_id, user_id, content, comment_no) VALUES ($1, $2, $3, $4) RETURNING *",
        [post_id, user_id, content, comment_no]
    );
    return result.rows[0];
};

const createReplyComment = async (data) => {
    const { post_id, user_id, content, comment_no, parent_comment_id } = data;
    const result = await pool.query(
        "INSERT INTO comments (post_id, user_id, content, comment_no, parent_comment_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [post_id, user_id, content, comment_no, parent_comment_id]
    );
    return result.rows[0];
};

const updateCommentByCommentNo = async (comment_no, content) => {
    const result = await pool.query(
        "UPDATE comments SET content = $1 WHERE comment_no = $2 AND deleted_at IS NULL RETURNING comment_no, content, updated_at",
        [content, comment_no]
    );
    return result.rows[0];
};

const deleteCommentByCommentNo = async (comment_no) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query("UPDATE comments SET deleted_at = NOW() WHERE comment_no = $1 AND deleted_at IS NULL", [comment_no]);
        await client.query("UPDATE comments SET deleted_at = NOW() WHERE parent_comment_id = (SELECT id FROM comments WHERE comment_no = $1) AND deleted_at IS NULL", [comment_no]);
        await client.query('COMMIT');
        return { message: "Comment and its replies deleted successfully" };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

const getCommentsByPostNo = async (post_no, limit, offset) => {
    const result = await pool.query(
        `SELECT p.post_no, 
            c.comment_no, c.content, c.created_at,
            COALESCE(u.display_name, 'Anonymous') AS author, u.user_no AS author_no
            FROM comments c 
            LEFT JOIN posts p ON c.post_id = p.id 
            LEFT JOIN users u ON c.user_id = u.id 
            WHERE p.post_no = $1 AND c.deleted_at IS NULL 
            ORDER BY c.created_at DESC LIMIT $2 OFFSET $3`,
        [post_no, limit, offset]
    );
    return result.rows;
};

const getCommentByCommentNo = async (comment_no) => {
    const result = await pool.query(
        `SELECT c.id, c.comment_no, c.content, c.user_id, c.post_id, c.created_at,
            COALESCE(u.display_name, 'Anonymous') as author, u.user_no AS author_no
            FROM comments c 
            LEFT JOIN users u ON c.user_id = u.id 
            WHERE c.comment_no = $1 AND c.deleted_at IS NULL`,
        [comment_no]
    );
    return result.rows[0];
};

const getRepliesOfCommentByCommentNo = async (comment_no, limit, offset) => {
    const result = await pool.query(
        `SELECT c.id, c.comment_no, c.content, c.created_at,
            COALESCE(u.display_name, 'Anonymous') as author, u.user_no AS author_no
            FROM comments c 
            LEFT JOIN users u ON c.user_id = u.id 
            WHERE c.parent_comment_id = (SELECT id FROM comments WHERE comment_no = $1) AND c.deleted_at IS NULL
            ORDER BY c.created_at DESC LIMIT $2 OFFSET $3`,
        [comment_no, limit, offset]
    );
    return result.rows;
}

module.exports = {
    createComment,
    createReplyComment,
    updateCommentByCommentNo,
    deleteCommentByCommentNo,
    getCommentsByPostNo,
    getCommentByCommentNo,
    getRepliesOfCommentByCommentNo
}