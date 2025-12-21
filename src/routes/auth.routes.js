const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

/**
 * Authentication Routes
 * 
 * All routes require Firebase authentication.
 * The client must obtain a Firebase ID token and send it in the Authorization header.
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user after Firebase signup
 * @access  Private (requires Firebase token)
 * @body    { firstName, lastName, dateOfBirth, role?, phoneNumber? }
 */
router.post('/register', verifyFirebaseToken, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and sync data after Firebase authentication
 * @access  Private (requires Firebase token)
 */
router.post('/login', verifyFirebaseToken, authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private (requires Firebase token)
 */
router.get('/me', verifyFirebaseToken, authController.getCurrentUser);

module.exports = router;
