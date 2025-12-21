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

/**
 * Validate rental creation
 */
const validateRentalCreate = [
    body('title')
        .trim()
        .notEmpty()
        .isLength({ min: 10, max: 100 })
        .withMessage('Title must be 10-100 characters'),

    body('description')
        .trim()
        .notEmpty()
        .isLength({ min: 50, max: 2000 })
        .withMessage('Description must be 50-2000 characters'),

    body('propertyType')
        .isIn(['HOUSE', 'APARTMENT', 'CONDO', 'VILLA', 'CABIN', 'OTHER'])
        .withMessage('Invalid property type'),

    body('addressLine1').trim().notEmpty().withMessage('Address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('state').trim().notEmpty().withMessage('State is required'),
    body('zipCode').trim().matches(/^\d{5}$/).withMessage('Invalid Zip Code'),
    body('country').trim().notEmpty().withMessage('Country is required'),

    body('maxGuests')
        .isInt({ min: 1, max: 50 })
        .withMessage('Max guests must be between 1 and 50'),

    body('bedrooms')
        .isInt({ min: 0, max: 20 })
        .withMessage('Bedrooms must be between 0 and 20'),

    body('bathrooms')
        .isFloat({ min: 0, max: 20 })
        .withMessage('Bathrooms must be between 0 and 20'),

    body('pricePerNight')
        .isFloat({ min: 1, max: 10000 })
        .withMessage('Price must be between 1 and 10000'),

    body('amenities')
        .optional()
        .isArray()
        .withMessage('Amenities must be an array'),

    handleValidationErrors,
];

/**
 * Validate rental update
 */
const validateRentalUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 10, max: 100 }),

    body('pricePerNight')
        .optional()
        .isFloat({ min: 1, max: 10000 }),

    // Add other fields as needed...

    handleValidationErrors,
];

module.exports = {
    validateRegistration,
    validateProfileUpdate,
    validateEmail,
    validateUserId,
    validatePagination,
    validateRentalCreate,
    validateRentalUpdate,
    handleValidationErrors,
};
