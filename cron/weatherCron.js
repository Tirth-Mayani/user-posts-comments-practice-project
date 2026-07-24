const cron = require("node-cron");

const weatherQueue = require("../bullmq/queues/weatherQueue");
const { JOBS } = require("../bullmq/jobConstants");

const {getCurrentWeather} = require("../services/weatherService");

cron.schedule("* * * * *", async () => {
    try{
        console.log("Fetching weather...");
        const weather = await getCurrentWeather();

        await weatherQueue.add(
            JOBS.WEATHER_POST,
            weather
        );

        console.log("Weather job added to the queue");
    }catch (err){
        console.error(err);
    }
});