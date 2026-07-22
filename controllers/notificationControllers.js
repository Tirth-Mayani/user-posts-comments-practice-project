const apiError = require("../utils/apiError");
const { validationResult } = require("express-validator");
const { getNewNotificationsByRecipientId, getNotificationCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, getNotificationsHistory, markNotificationsRead } = require("../models/notificationModels");
const { pushList, getList, trimList } = require("../utils/cache");

const getMyNotificationsController = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty())
            throw new apiError(400, "Validation error", errors.array());
        
        let notifications = await getList(
            `notifications:${req.user.id}`
        );
        if(notifications.length === 0){
            notifications = await getNewNotificationsByRecipientId(req.user.id);

            if(notifications.length === 0){
                return res.status(200).json({message: "No notifications found", notifications: []});
            }
            // if(notification.length > 0){
            //     for(const notification of notifications){
            //         await pushList(`notifications:${req.user.id}`, notification);
            //     }
            // }

        }
        const notificationNos = notifications.map((notification) => notification.notification_no);

        await Promise.all([
            await markNotificationsRead(notificationNos),
            await trimList(`notifications:${req.user.id}`, notifications.length, -1)
        ]);
        
        //const notifications = await getNotificationsByRecipientId(req.user.id);
        //if(notifications.length === 0)
        //    throw new apiError(404, "No notifications found");

        //await markAllNotificationsAsRead(req.user.id);

        return res.status(200).json({message: "Notifications", notifications});
    } catch(error){
        next(error);
    }
};

const getUnreadNtificationsCountController = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty())
            throw new apiError(400, "Validation error", errors.array());
        
        const count = await getNotificationCount(req.user.id);
        return res.status(200).json({message: "Unread notifications count", count});
    } catch(error){
        next(error);
    }
};

const readNotificationController = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty())
            throw new apiError(400, "Validation error", errors.array());
        
        const notification = await markNotificationAsRead(req.params.notification_no, req.user.id);
        if(!notification){
            throw new apiError(404, "Notification not found");
        }
        return res.status(200).json({success: true, message: "Notification marked as read", notification});
    } catch(error){
        next(error);
    }
};

const readAllNotificationsController = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty())
            throw new apiError(400, "Validation error", errors.array());
        
        const updatedCount = await markAllNotificationsAsRead(req.user.id);
        return res.status(200).json({success: true, message: "All notifications marked as read", updatedCount});
    } catch(error){
        next(error);
    }
};

const deleteNotificationController = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty())
            throw new apiError(400, "Validation error", errors.array());
        
        const notification = await deleteNotification(req.params.notification_no, req.user.id);
        if(!notification){
            throw new apiError(404, "Notification to be deleted not found");
        }
        return res.status(200).json({success: true, message: "Notification deleted successfully", notification});
    } catch(error){
        next(error);
    }
}

const getNotificationHistoryController = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty())
            throw new apiError(400, "Validation error", errors.array());

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 1));
        const offset = (page - 1) * limit;
        
        const notifications = await getNotificationsHistory(req.user.id, limit, offset);
        if(notifications.length === 0)
            return res.status(200).json({message: "No notifications found"});
        return res.status(200).json({message: "Notifications history", notifications});

    } catch(error) {
        next(error);
    }
}

module.exports = {getMyNotificationsController, getUnreadNtificationsCountController, readNotificationController, readAllNotificationsController, deleteNotificationController, getNotificationHistoryController};