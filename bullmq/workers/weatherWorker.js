const {Worker} = require("bullmq");
const connection = require("../connection");
const {JOBS} = require("../bullmq/jobConstants");
const postModel = require("../models/postModels");

const weatherWorker = new Worker(
    "weatherQueue",
    async (job) => {
        switch(job.name){
            case JOBS.WEATHER_POST:
                try{

                } catch(err) {

                }
                break;
            default:
                console.log("Unknown job: ", job.name);
        }
    },
    {connection}
);

worker.on("completed", (job) => {
    console.log(`Weather job: ${job.id} completed.`);
});

worker.on("failed", (job, error) => {
    console.error(`Weather job: ${job.id} failed with error: ${error.message}`);
});

module.exports = weatherWorker;