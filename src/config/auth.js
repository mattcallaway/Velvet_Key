require('dotenv').config();

module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    jwtAlgorithm: 'HS256',
};
