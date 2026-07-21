const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("connect", () => {
    console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
    console.log("Redis Client Error", err);
});

(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.log("Could not connect to Redis: ", err.message);
    }
})();

module.exports = redisClient;