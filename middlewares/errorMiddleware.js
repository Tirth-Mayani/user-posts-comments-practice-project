const apiError = require("../utils/apiError");

const errorHandler = (err, req, res, next) => {
    if (err instanceof apiError) {
        return res.status(err.statusCode).json({ message: err.message, errors: err.errors });
    }
    return res.status(500).json({ success: false, message: "internal server error" });
};

module.exports = errorHandler;