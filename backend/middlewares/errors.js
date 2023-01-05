const ErrorHandler = require('../utils/errorHandler');
require('dotenv').config();

module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    // err.message = err.message || 'Internal Server Error';

    if(proecess.env.NODE_ENV === 'DEVELOPMENT')
    {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        })
    }

    if(proecess.env.NODE_ENV === 'PRODUCTION')
    {
        let error = {...err}
        error.message = err.message;

        // wrong mongoose object ID error
        if(err.name === 'CastError')
        {
            const message = `Resource not found. Invalid: ${err.path}`
            error = new ErrorHandler(message,400)
        }

        // Handling monggose duplicate key error for production

        if(err.code === 11000)
        {
            const message = `Duplicate ${Object.keys(err.keyValue)} entered`
            error = new ErrorHandler(message,400);
        }

        // Handling Mongoose Validation Error

        if(err.name === 'validationError')
        {
            const message = Object.values(err.errors).map(value => value.message);
            error = new ErrorHandler(message,400);
        }

        if(err.name === 'JsonWenTokenError')
        {
            const message = `Json Web Token is invalid. Try Again!!!`;
            error = new ErrorHandler(message,400);
        }

        if(err.name === 'TokenExpiredError')
        {
            const message = `Json Web Token is expired. Try Again!!!`;
            error = new ErrorHandler(message,400);
        }

        res.status(error.statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error'
        })
    }

    // return res.status(err.statusCode).json({
    //     success: false,
    //     error: err.stack
    // })
}