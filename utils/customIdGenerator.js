const pool = require("../configs/db");

const sequenceMap = {
    USR: "user_no_seq",
    POST: "post_no_seq",
    NTF: "notification_no_seq",
    CMT: "comment_no_seq",
};

const generateId = async (prefix) => {
    const sequence = sequenceMap[prefix];

    if(!sequence){
        throw new Error(`Invalid ID prefix : ${prefix}`);
    }

    const result = await pool.query(`SELECT nextval($1::regclass) AS id`, [sequence]);
    const number = result.rows[0].id;

    return `${prefix}-${number.toString().padStart(4, "0")}`;
};

module.exports = {generateId};