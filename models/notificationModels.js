const pool = require("../configs/db");

const createNotification = async (data) => {
    const { notification_no, recipient_id, sender_id, post_id, comment_id, message, type, is_read = false } = data;
    const result = await pool.query(
        `INSERT INTO notifications (notification_no, recipient_id, sender_id, post_id, comment_id, message, type, is_read) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [notification_no, recipient_id, sender_id, post_id, comment_id, message, type, is_read]
    );
    return result.rows[0];
};

const getNotificationsByRecipientId = async (recipient_id) => {
    const result = await pool.query(`SELECT notification_no, message, type, is_read, read_at, created_at FROM notifications WHERE recipient_id = $1 ORDER BY created_at DESC`, [recipient_id]);
    return result.rows;
};

const getNotificationByNotificationNo = async (notification_no) => {
    const result = await pool.query(`SELECT notification_no, message, type, created_at FROM notifications WHERE notification_no = $1`, [notification_no]);
    return result.rows[0];
};

const getNotificationCount = async (user_id) => {
    const result = await pool.query(`SELECT COUNT(*) FROM notifications WHERE recipient_id = $1 AND is_read = false`, [user_id]);
    return result.rows[0].count;
};

const markNotificationAsRead = async (notification_no, user_id) => {
    const result = await pool.query(`UPDATE notifications SET is_read = true, read_at = NOW() WHERE is_read = false AND notification_no = $1 AND recipient_id = $2 RETURNING notification_no, is_read, read_at`, [notification_no, user_id]);
    return result.rows[0];
};

const markAllNotificationsAsRead = async (user_id) => {
    const result = await pool.query(`UPDATE notifications SET is_read = true, read_at = NOW() WHERE recipient_id = $1 AND is_read = false RETURNING notification_no, is_read, read_at`, [user_id]);
    return result.rows;
};

const deleteNotification = async (notification_no, user_id) => {
    const result = await pool.query("DELETE FROM notifications WHERE notification_no = $1 AND recipient_id = $2 RETURNING notification_no", [notification_no, user_id]);
    return result.rows[0];
};

module.exports = {
    createNotification,
    getNotificationsByRecipientId,
    getNotificationByNotificationNo,
    getNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
}