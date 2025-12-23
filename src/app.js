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

// Health check (Mounting the router directly as well for root access)
const healthRoutes = require('./routes/health');
app.use('/health', healthRoutes);

// Error handling middleware (must be last)
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
