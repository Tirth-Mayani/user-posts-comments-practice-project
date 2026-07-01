const apiError = require("../utils/apiError");

module.exports = (...roles) => {
    return (req, res, next) => {
        try{
            if(!req.user || !req.user.role){
                return next(new apiError(401, "Unauthorized: User not authenticated"));
            }

            if(!roles.includes(req.user.role)){
                return next(new apiError(403, "Forbidden: You do not have permission to access this resource"));
            }
            next();
        }catch(error){
            next(error);
        }
    }

};