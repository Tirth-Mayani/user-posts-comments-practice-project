const pool = require("../configs/db");

const createUser = async (data) => {
    const {user_no, username, display_name, email, password} = data;
    const result = await pool.query(
        "INSERT INTO users (user_no, username, display_name, email, password, role) VALUES ($1, $2, $3, $4, $5, 'user') RETURNING *",
        [user_no, username, display_name, email, password]
    );
    return result.rows[0];
}

const updateUser = async (user_no, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const setQuery = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const result = await pool.query(
        `UPDATE users SET ${setQuery} WHERE user_no = $${keys.length + 1} RETURNING id, user_no, username, display_name, role, email, created_at, updated_at`,
        [...values, user_no]
    );
    return result.rows[0];
}

const updateUserRole = async (user_no, role) => {
    const result = await pool.query(
        "UPDATE users SET role = $1 WHERE user_no = $2 RETURNING id, user_no, username, display_name, role, email, created_at, updated_at",
        [role, user_no]
    );
    return result.rows[0];
}

const getUsers = async (limit, offset) => {
    const result = await pool.query(`SELECT id, user_no, username, display_name, role, email, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    return result.rows;
}

const getUserById = async (user_no) => {
    const result = await pool.query("SELECT id, user_no, username, display_name, role, email, created_at FROM users WHERE user_no = $1", [user_no]);
    return result.rows[0];
}

const getUserByEmail = async (email) => {
    const result = await pool.query("SELECT id, user_no, username, display_name, role, email, password, created_at FROM users WHERE email = $1", [email]);
    return result.rows[0];
}

const getUserByDisplayName = async (display_name) => {
    const result = await pool.query("SELECT id, display_name, role FROM users WHERE display_name = $1", [display_name]);
    return result.rows[0];
}

const getUserByPId = async (id) => {
    const result = await pool.query("SELECT id, user_no, username, display_name, role, email, created_at, updated_at FROM users WHERE id = $1", [id]);
    return result.rows[0];
}

module.exports = {
    createUser,
    updateUser,
    updateUserRole,
    getUsers,
    getUserById,
    getUserByEmail,
    getUserByDisplayName,
    getUserByPId
}