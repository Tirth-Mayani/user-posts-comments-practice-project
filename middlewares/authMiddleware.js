const jwt = require('jsonwebtoken');
const apiError = require('../utils/apiError');

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; //extracting token from req header
    try{
        if(!token)
            throw new apiError(401, 'No token found');

        const decoded = jwt.verify(token, process.env.SECRET_KEY); //verifying token
        req.user = decoded;

        //console.log(req.user)

        next();
    }catch(err){
        next(err);
    }
};