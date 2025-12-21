/**
 * Standardized API Response Utilities
 * 
 * Provides consistent response formatting across all endpoints.
 */

/**
 * Send success response
 * 
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
function success(res, data, message = null, statusCode = 200) {
    const response = {
        success: true,
    };

    if (message) {
        response.message = message;
    }

    if (data !== undefined) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
}

/**
 * Send error response
 * 
 * @param {Object} res - Express response object
 * @param {string} error - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {Object} details - Optional error details
 */
function error(res, error, statusCode = 400, details = null) {
    const response = {
        success: false,
        error,
    };

    if (details) {
        response.details = details;
    }

    return res.status(statusCode).json(response);
}

/**
 * Send validation error response
 * 
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 */
function validationError(res, errors) {
    return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: errors,
    });
}

/**
 * Send not found response
 * 
 * @param {Object} res - Express response object
 * @param {string} resource - Name of the resource not found
 */
function notFound(res, resource = 'Resource') {
    return res.status(404).json({
        success: false,
        error: `${resource} not found`,
    });
}

/**
 * Send unauthorized response
 * 
 * @param {Object} res - Express response object
 * @param {string} message - Optional custom message
 */
function unauthorized(res, message = 'Authentication required') {
    return res.status(401).json({
        success: false,
        error: message,
    });
}

/**
 * Send forbidden response
 * 
 * @param {Object} res - Express response object
 * @param {string} message - Optional custom message
 */
function forbidden(res, message = 'Access denied') {
    return res.status(403).json({
        success: false,
        error: message,
    });
}

module.exports = {
    success,
    error,
    validationError,
    notFound,
    unauthorized,
    forbidden,
};
