const pool = require("../configs/db");

const generateId = async (tableName, column, prefix) => {
    const result = await pool.query(`SELECT ${column} FROM ${tableName} ORDER BY ${column} DESC LIMIT 1`);
    if (result.rows.length === 0) {
        return `${prefix}-0001`;
    }
    const lastId = result.rows[0][column];
    const lastNumber = parseInt(lastId.split("-")[1], 10);
    const newNumber = lastNumber + 1;
    return `${prefix}-${newNumber.toString().padStart(4, "0")}`;
};

module.exports = {generateId};