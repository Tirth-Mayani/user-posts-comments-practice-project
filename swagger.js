const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info:{
        title: 'User-Post management API',
        description: 'This is a simple API for managing users and posts',
    },
    host: 'localhost:8000',
    schemes: ['http'],
    securityDefinitions: {
        BearerAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'Enter JWT token like: Bearer ****',
        }
    },
    definitions: {
        registerUser: {
            username: "User1",
            display_name: "user1",
            email: "user1@test.com",
            password: "user1Test@123"
        },
        loginUser: {
            email: "user1@test.com",
            password: "user1Test@123"
        },

        successResponse: {
            success: true,
            message: "Success",
            data: {}
        }
    },
    
};

const outputFile = './swagger-output.json';

const endpointsFiles = [
    './routes/authRoutes.js',
    './routes/postRoutes.js',
    './routes/commentRoutes.js'
];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./index.js');
});