/**
 * Role-Based Access Control Middleware
 * 
 * Restricts access to routes based on user roles.
 * Requires auth.middleware to run first to populate req.user.
 */

/**
 * Require specific role(s) to access a route
 * 
 * @param {string|string[]} allowedRoles - Single role or array of allowed roles
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.post('/rentals', requireRole('HOST'), createRental);
 * router.delete('/users/:id', requireRole(['ADMIN']), deleteUser);
 */
function requireRole(allowedRoles) {
    // Normalize to array
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        // Check if user is authenticated (should be set by auth middleware)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        // Check if user has required role
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Required role: ${roles.join(' or ')}`,
            });
        }

        next();
    };
}

/**
 * Require user to be the resource owner or an admin
 * 
 * @param {string} userIdParam - Name of the route parameter containing user ID
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.put('/users/:id', requireOwnerOrAdmin('id'), updateUser);
 */
function requireOwnerOrAdmin(userIdParam = 'id') {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        const resourceUserId = req.params[userIdParam];
        const isOwner = req.user.id === resourceUserId;
        const isAdmin = req.user.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Access denied. You can only modify your own resources.',
            });
        }

        next();
    };
}

/**
 * Require email to be verified
 */
function requireEmailVerified(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
        });
    }

    if (!req.user.emailVerified) {
        return res.status(403).json({
            success: false,
            error: 'Email verification required. Please verify your email address.',
        });
    }

    next();
}

module.exports = {
    requireRole,
    requireOwnerOrAdmin,
    requireEmailVerified,
};
