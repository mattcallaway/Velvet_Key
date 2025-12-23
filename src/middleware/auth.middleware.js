const { auth, firebaseInitialized } = require('../config/firebase');
const authService = require('../services/auth.service');

/**
 * Firebase Authentication Middleware
 * 
 * Verifies Firebase ID tokens and attaches user data to request.
 * Protects routes that require authentication.
 */

/**
 * Verify Firebase ID token from Authorization header
 * 
 * Expected header format: "Authorization: Bearer <firebase-id-token>"
 */
async function verifyFirebaseToken(req, res, next) {
    try {
        // Check if Firebase is initialized
        if (!firebaseInitialized || !auth) {
            return res.status(503).json({
                success: false,
                error: 'Authentication service unavailable',
                message: 'Firebase is not configured. Please contact the administrator.',
            });
        }

        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No authentication token provided',
            });
        }

        const idToken = authHeader.split('Bearer ')[1];

        // Verify the Firebase ID token
        const decodedToken = await auth.verifyIdToken(idToken);

        // Try to hydrate database user if they exist
        const user = await authService.getUserByFirebaseUid(decodedToken.uid);

        // Attach Firebase and Database user data to request
        req.firebaseUser = {
            uid: decodedToken.uid,
            email: decodedToken.email || null,
            emailVerified: decodedToken.email_verified || false,
            isAnonymous: !decodedToken.email && !decodedToken.phone_number,
        };

        // Attach database user to req.user (will be null for new/guest users)
        req.user = user;

        next();
    } catch (error) {
        console.error('Firebase token verification error:', error);

        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({
                success: false,
                error: 'Authentication token expired',
            });
        }

        if (error.code === 'auth/argument-error') {
            return res.status(401).json({
                success: false,
                error: 'Invalid authentication token',
            });
        }

        return res.status(401).json({
            success: false,
            error: 'Authentication failed',
        });
    }
}

/**
 * Optional authentication middleware
 * 
 * Verifies token if present, but doesn't require it.
 * Useful for endpoints that behave differently for authenticated users.
 */
async function optionalAuth(req, res, next) {
    try {
        // Skip if Firebase not initialized
        if (!firebaseInitialized || !auth) {
            return next();
        }

        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const idToken = authHeader.split('Bearer ')[1];
            const decodedToken = await auth.verifyIdToken(idToken);

            req.firebaseUser = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified,
            };

            // Optionally attach database user if they exist
            const user = await authService.getUserByFirebaseUid(decodedToken.uid);
            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // If token is invalid, just continue without user data
        next();
    }
}

module.exports = {
    verifyFirebaseToken,
    authenticate: verifyFirebaseToken,
    optionalAuth,
};
