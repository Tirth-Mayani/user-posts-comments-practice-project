const {Queue} = require('bullmq');
const connection = require('../connection');

const weatherQueue = new Queue('weatherQueue', {
    connection,
    defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 10000 },
        removeOnComplete: 100,
        removeOnFail: 300,
    },
});

module.exports = weatherQueue;