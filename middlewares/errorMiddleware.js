const apiError = require("../utils/apiError");
const { TokenExpiredError } = require("jsonwebtoken");

const errorHandler = (err, req, res, next) => {
    if (err instanceof apiError) {
        return res.status(err.statusCode).json({ message: err.message, errors: err.errors });
    }
    if (err instanceof TokenExpiredError) {
        return res.status(401).json({ message: "Token has expired" });
    }
    console.error(err);
    return res.status(500).json({ success: false, message: "internal server error" });
};

module.exports = errorHandler;