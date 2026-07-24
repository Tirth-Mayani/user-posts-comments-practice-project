const {Worker} = require("bullmq");
const connection = require("../connection");
const {JOBS} = require("../jobConstants");
const postModel = require("../../models/postModels");
const {generateId} = require("../../utils/customIdGenerator");
require("dotenv").config();

const weatherWorker = new Worker(
    "weatherQueue",
    async (job) => {
        switch(job.name){
            case JOBS.WEATHER_POST:
                try{
                    const title = `Weather update at ${job.data.city}, ${job.data.country}`;
                    const description = 
                    `Temperture right now is ${job.data.temperature} *C and actually feels like ${job.data.feelsLike} *C. Wind speeds are ${job.data.windSpeed} m/s. Humidity is ${job.data.humidity} % and pressure is ${job.data.pressure} hPa.`;
                    const post_no = await generateId("POST");
                    await postModel.createPost({
                        user_id: process.env.WEATHER_USER_ID,
                        title,
                        description,
                        post_no
                    });
                } catch(err) {
                    console.error(err);
                    throw err;
                }
                break;
            default:
                console.log("Unknown job: ", job.name);
        }
    },
    {connection}
);

weatherWorker.on("completed", (job) => {
    console.log(`Weather job: ${job.id} completed.`);
});

weatherWorker.on("failed", (job, error) => {
    console.error(`Weather job: ${job.id} failed with error: ${error.message}`);
});

module.exports = weatherWorker;