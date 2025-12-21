/**
 * Global Error Handler Middleware
 * 
 * Catches all unhandled errors and formats responses consistently
 */

function errorHandler(err, req, res, next) {
    // Log error for debugging
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        statusCode: err.statusCode,
    });

    // Default error response
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let code = err.code || 'INTERNAL_ERROR';

    // Handle Prisma errors
    if (err.code && err.code.startsWith('P')) {
        const prismaError = handlePrismaError(err);
        statusCode = prismaError.statusCode;
        message = prismaError.message;
        code = prismaError.code;
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        code = 'INVALID_TOKEN';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
        code = 'TOKEN_EXPIRED';
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            code,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(err) {
    const errorMap = {
        // Unique constraint violation
        P2002: {
            statusCode: 400,
            message: `A record with this ${err.meta?.target?.join(', ')} already exists`,
            code: 'DUPLICATE_RECORD',
        },
        // Record not found
        P2025: {
            statusCode: 404,
            message: 'Record not found',
            code: 'NOT_FOUND',
        },
        // Foreign key constraint violation
        P2003: {
            statusCode: 400,
            message: 'Cannot perform this action due to related records',
            code: 'CONSTRAINT_VIOLATION',
        },
        // Required field missing
        P2011: {
            statusCode: 400,
            message: 'Required field is missing',
            code: 'MISSING_FIELD',
        },
        // Invalid value
        P2006: {
            statusCode: 400,
            message: 'Invalid value provided',
            code: 'INVALID_VALUE',
        },
    };

    return errorMap[err.code] || {
        statusCode: 500,
        message: 'Database error occurred',
        code: 'DATABASE_ERROR',
    };
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: {
            message: `Cannot ${req.method} ${req.path}`,
            code: 'NOT_FOUND',
        },
    });
}

module.exports = {
    errorHandler,
    notFoundHandler,
};
