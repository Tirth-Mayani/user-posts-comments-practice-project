const apiError = require("../utils/apiError");
const { validationResult } = require("express-validator");
const { createNotification, getNotificationsByRecipientId, getNotificationByNotificationNo, getNotificationCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = require("../models/notificationModels");
const { getCache, setCache, deleteCache, deleteMultipleCache, cacheKeys } = require("../utils/cache");

const getMyNotificationsController = async (req, res, next) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty())
            throw new apiError(400, "Validation error", errors.array());
        
        const notifications = await getNotificationsByRecipientId(req.user.id);
        if(notifications.length === 0)
            throw new apiError(404, "No notifications found");
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
        await markNotificationAsRead(req.params.notification_no);
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

module.exports = {getMyNotificationsController, getUnreadNtificationsCountController, readNotificationController, readAllNotificationsController, deleteNotificationController};