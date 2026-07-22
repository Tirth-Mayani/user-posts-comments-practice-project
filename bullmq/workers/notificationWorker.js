const { Worker } = require("bullmq");
const connection = require("../connection");
const JOBS = require("../jobConstants");
//models
const notificationModel = require("../../models/notificationModels");
const commentModel = require("../../models/commentModels");
const postModel = require("../../models/postModels");
//redis client
const redisClient = require("../../configs/redis");
const { getCache, setCache, deleteCache, deleteMultipleCache, cacheKeys, pushToList, getList, trimList } = require("../../utils/cache");

const { generateId } = require("../../utils/customIdGenerator");

const notificationWorker = new Worker(
    "notificationQueue",
    async (job) => {
        switch (job.name) {
            case JOBS.COMMENT_CREATED:
                try{
                    console.log(`[Worker] Received Job ${job.name} with id: ${job.id} data: ${JSON.stringify(job.data)}`);
                    const comment = await commentModel.getCommentByCommentNo(job.data.commentNo);
                    if(!comment) throw new Error("Comment not found");
                    const post = await postModel.getPostByPostPKey(comment.post_id);
                    if(!post) throw new Error("Post not found");
                    const senderId = comment.user_id
                    const recipientId = post.user_id
                    if(senderId === recipientId) return;
                    const notificationNo = await generateId("NTF");
                    const type = "COMMENT";
                    const message = `${comment.userNo} commented on your post : ${post.title}`;
                    const notification = await notificationModel.createNotification({ notification_no: notificationNo, recipient_id: recipientId, sender_id: senderId, post_id: post.id, comment_id: comment.id, message: message, type: type, is_read: false });

                    await pushToList(`notifications:${recipientId}`,
                        {
                            notification_no: notification.notification_no,
                            message: notification.message,
                            type: notification.type
                        }
                    );
                } catch (error) {
                    console.error(error);
                    throw error;
                }
            break;

            default:
                throw new Error(`Unknown job name: ${job.name}`);
        }
    },
    { connection }
);

module.exports = notificationWorker;