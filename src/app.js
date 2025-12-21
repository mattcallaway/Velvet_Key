require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

/**
 * Express App Configuration
 * 
 * Configures middleware and routes for the Velvet Key API.
 */

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Health check (legacy, keeping for backwards compatibility)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Velvet Key API is running',
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);

    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

module.exports = app;
