const { body, param, validationResult } = require('express-validator');

/**
 * Validation Middleware
 * 
 * Input validation using express-validator
 */

/**
 * Handle validation errors
 */
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: errors.array(),
            },
        });
    }
    next();
}

/**
 * Validate user registration
 */
const validateRegistration = [
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),

    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),

    body('dateOfBirth')
        .notEmpty()
        .withMessage('Date of birth is required')
        .isISO8601()
        .withMessage('Invalid date format')
        .custom((value) => {
            const birthDate = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 21) {
                throw new Error('You must be at least 21 years old to register');
            }

            return true;
        }),

    body('role')
        .optional()
        .isIn(['GUEST', 'HOST'])
        .withMessage('Role must be either GUEST or HOST'),

    handleValidationErrors,
];

/**
 * Validate profile update
 */
const validateProfileUpdate = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),

    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),

    body('phoneNumber')
        .optional()
        .trim()
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage('Invalid phone number format. Use E.164 format (e.g., +1234567890)'),

    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must not exceed 500 characters'),

    body('profileImageUrl')
        .optional()
        .trim()
        .isURL()
        .withMessage('Profile image must be a valid URL'),

    handleValidationErrors,
];

/**
 * Validate email format
 */
const validateEmail = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),

    handleValidationErrors,
];

/**
 * Validate user ID parameter
 */
const validateUserId = [
    param('id')
        .isUUID()
        .withMessage('Invalid user ID format'),

    handleValidationErrors,
];

/**
 * Validate pagination parameters
 */
const validatePagination = [
    param('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    param('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    handleValidationErrors,
];

module.exports = {
    validateRegistration,
    validateProfileUpdate,
    validateEmail,
    validateUserId,
    validatePagination,
    handleValidationErrors,
};
