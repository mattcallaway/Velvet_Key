const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

/**
 * Health Check Routes
 * 
 * Provides API health status and database connectivity checks.
 */

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        message: 'Velvet Key API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

/**
 * @route   GET /api/health/db
 * @desc    Database connectivity check
 * @access  Public
 */
router.get('/db', async (req, res) => {
    try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            success: true,
            status: 'ok',
            message: 'Database connection successful',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Database health check failed:', error);

        res.status(503).json({
            success: false,
            status: 'error',
            message: 'Database connection failed',
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});

module.exports = router;
