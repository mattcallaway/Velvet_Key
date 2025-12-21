const prisma = require('../config/database');
const { success, error, notFound } = require('../utils/response.util');

/**
 * Authentication Service
 * 
 * Handles user registration and login sync with Firebase.
 * Firebase handles the actual authentication, we just sync user data to PostgreSQL.
 */

/**
 * Register a new user after Firebase signup
 * 
 * This is called after the user successfully signs up with Firebase.
 * We create a corresponding user record in PostgreSQL.
 */
async function registerUser(firebaseUid, userData) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (existingUser) {
      throw new Error('User already registered');
    }

    // Validate age (must be 21+)
    const age = calculateAge(userData.dateOfBirth);
    if (age < 21) {
      throw new Error('Must be 21 or older to register');
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        firebaseUid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        dateOfBirth: new Date(userData.dateOfBirth),
        role: userData.role || 'GUEST',
        phoneNumber: userData.phoneNumber || null,
        emailVerified: userData.emailVerified || false,
      },
    });

    // Remove sensitive data before returning
    return sanitizeUser(user);
  } catch (err) {
    throw err;
  }
}

/**
 * Login user - sync data and update lastLoginAt
 * 
 * Called after Firebase authentication succeeds.
 */
async function loginUser(firebaseUid, emailVerified = false) {
  try {
    // Find user by Firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      throw new Error('User not found. Please complete registration.');
    }

    // Update last login time and email verification status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        emailVerified: emailVerified || user.emailVerified,
      },
    });

    return sanitizeUser(updatedUser);
  } catch (err) {
    throw err;
  }
}

/**
 * Get user by Firebase UID
 */
async function getUserByFirebaseUid(firebaseUid) {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      return null;
    }

    return sanitizeUser(user);
  } catch (err) {
    throw err;
  }
}

/**
 * Get user by ID
 */
async function getUserById(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return null;
    }

    return sanitizeUser(user);
  } catch (err) {
    throw err;
  }
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Remove sensitive fields from user object
 */
function sanitizeUser(user) {
  const { ...sanitized } = user;
  return sanitized;
}

module.exports = {
  registerUser,
  loginUser,
  getUserByFirebaseUid,
  getUserById,
};
