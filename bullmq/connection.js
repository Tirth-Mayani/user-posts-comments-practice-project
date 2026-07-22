const IORedis = require("ioredis");

const connection = new IORedis(
    process.env.REDIS_URL || "redis://localhost:6379",
    {
    maxRetriesPerRequest: null, //required by BullMQ for blocking redis commands like (BRPOP internally) otherwise throws error
    }
);

connection.on("error", (err) => {
    console.error("BullMQ Redis error: ", err.message);
});

connection.on("connect", () => {
    console.log("Connected to BullMQ Redis");
});

connection.on("ready", () => {
    console.log("BullMQ Redis ready");
});

module.exports = connection;