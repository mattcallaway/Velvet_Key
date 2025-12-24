const { v4: uuidv4 } = require('uuid');

/**
 * Request ID Middleware
 * 
 * Attaches a unique UUID to every request (req.id) and 
 * includes it in the 'X-Request-Id' response header.
 * This is crucial for log correlation.
 */
function requestId(req, res, next) {
    const id = req.get('X-Request-Id') || uuidv4();
    req.id = id;
    res.setHeader('X-Request-Id', id);
    next();
}

module.exports = requestId;
