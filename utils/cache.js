const redisClient = require("../configs/redis");
const defaultTTL = 300;
let redisAvailable = true;

const logRedisError = (error) => {
    if(redisAvailable) {
        console.error("Redis unavailble. Fallingback to PostgreSQL.");
        console.error(error.message);
        redisAvailable = false;
    }
};

//mark redis available again
redisClient.on("ready", () => {
    if(!redisAvailable){
        console.log("Redis available again.");
    }
    redisAvailable = true;
});

//get cache data
const getCache = async (key) => {
    try{
        const cacheData = await redisClient.get(key);
        if(!cacheData){
            return null;
        }
        return JSON.parse(cacheData);
    } catch (error) {
        logRedisError(error);
        return null;
    }
};

//set cache data
const setCache = async (key, data, ttl = defaultTTL) => {
    try{
        await redisClient.set(
            key, 
            JSON.stringify(data),
            {
                EX: ttl
            });
        return true;
    } catch (error) {
        logRedisError(error);
        return false;
    }
};

// delete one cache key
const deleteCache = async (key) => {
    try{
        await redisClient.del(key);
        return true;
    } catch (error) {
        logRedisError(error);
        return false;
    }
};

//delete multiple cache keys
const deleteMultipleCache = async (keys) => {
    try{

        if(!Array.isArray(keys) || keys.length === 0){
            return;
        }
        await redisClient.del(keys);
        return true;
    } catch (error) {
        logRedisError(error);
        return false;
    }
};

const cacheKeys = {
    USERS_ALL: "users:all",
    POSTS_ALL: "posts:all",

    user: (userNo) => `user:${userNo}`,
    post: (postNo) => `post:${postNo}`,
    comment: (commentNo) => `comment:${commentNo}`,
    POST_COMMENTS_ALL: (postNo) => `${postNo}:comments:all`,
    REPLY_COMMENTS_ALL: (commentNo) => `${commentNo}:replies:all`
}

module.exports = {
    getCache,
    setCache,
    deleteCache,
    deleteMultipleCache,
    cacheKeys
};