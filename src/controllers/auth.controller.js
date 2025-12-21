const authService = require('../services/auth.service');
const { success, error, validationError } = require('../utils/response.util');

/**
 * Authentication Controller
 * 
 * Handles HTTP requests for authentication endpoints.
 */

/**
 * Register a new user
 * POST /api/auth/register
 * 
 * Called after user signs up with Firebase.
 * Creates user record in PostgreSQL.
 */
async function register(req, res) {
    try {
        // Firebase user data should be in req.firebaseUser (from auth middleware)
        if (!req.firebaseUser) {
            return error(res, 'Firebase authentication required', 401);
        }

        const { firstName, lastName, dateOfBirth, role, phoneNumber } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !dateOfBirth) {
            return validationError(res, [
                { field: 'firstName', message: 'First name is required' },
                { field: 'lastName', message: 'Last name is required' },
                { field: 'dateOfBirth', message: 'Date of birth is required' },
            ]);
        }

        // Create user
        const user = await authService.registerUser(req.firebaseUser.uid, {
            email: req.firebaseUser.email,
            emailVerified: req.firebaseUser.emailVerified,
            firstName,
            lastName,
            dateOfBirth,
            role,
            phoneNumber,
        });

        return success(res, { user }, 'Registration successful', 201);
    } catch (err) {
        console.error('Registration error:', err);

        if (err.message === 'User already registered') {
            return error(res, 'User already registered', 409);
        }

        if (err.message.includes('21 or older')) {
            return error(res, err.message, 400);
        }

        return error(res, 'Registration failed', 500);
    }
}

/**
 * Login user
 * POST /api/auth/login
 * 
 * Called after Firebase authentication succeeds.
 * Updates last login time and syncs data.
 */
async function login(req, res) {
    try {
        if (!req.firebaseUser) {
            return error(res, 'Firebase authentication required', 401);
        }

        const user = await authService.loginUser(
            req.firebaseUser.uid,
            req.firebaseUser.emailVerified
        );

        return success(res, { user }, 'Login successful');
    } catch (err) {
        console.error('Login error:', err);

        if (err.message.includes('not found')) {
            return error(res, 'User not found. Please complete registration.', 404);
        }

        return error(res, 'Login failed', 500);
    }
}

/**
 * Get current user
 * GET /api/auth/me
 * 
 * Returns the currently authenticated user's profile.
 */
async function getCurrentUser(req, res) {
    try {
        if (!req.firebaseUser) {
            return error(res, 'Authentication required', 401);
        }

        const user = await authService.getUserByFirebaseUid(req.firebaseUser.uid);

        if (!user) {
            return error(res, 'User not found', 404);
        }

        return success(res, { user });
    } catch (err) {
        console.error('Get current user error:', err);
        return error(res, 'Failed to retrieve user', 500);
    }
}

module.exports = {
    register,
    login,
    getCurrentUser,
};
