const router = require("express").Router();
const notificationController = require("../controllers/notificationControllers");
const passport = require("../middlewares/passport");

//router to get user's notifications
router.get("/user", passport.authenticate("jwt", { session: false }), notificationController.getMyNotificationsController);

// get count of unread notifications
router.get("/unread_count", passport.authenticate("jwt", { session: false }), notificationController.getUnreadNtificationsCountController);

// mark a single notification as read
router.patch("/read/:notification_no", passport.authenticate("jwt", { session: false }), notificationController.readNotificationController);

//mark all notifications as read
router.patch("/read_all", passport.authenticate("jwt", { session: false }), notificationController.readAllNotificationsController);

// delete notification
router.delete("/delete/:notification_no", passport.authenticate("jwt", { session: false }), notificationController.deleteNotificationController);

module.exports = router;