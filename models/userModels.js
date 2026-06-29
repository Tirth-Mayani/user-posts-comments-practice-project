const pool = require("../configs/db");

const createuser = async (data) => {
    const {user_no, username, display_name, email, password} = data;
    const result = await pool.query(
        "INSERT INTO users (user_no,username, display_name, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [user_no, username, display_name, email, password]
    );
    return result.rows[0];
}

const updateuser = async (user_no, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);

    const setQuery = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const result = await pool.query(
        `UPDATE users SET ${setQuery} WHERE user_no = $${keys.length + 1} RETURNING *`,
        [...values, user_no]
    );
    return result.rows[0];
}

const 