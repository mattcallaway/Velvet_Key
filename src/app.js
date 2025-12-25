require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const rentalRoutes = require('./routes/rental.routes');
const bookingRoutes = require('./routes/booking.routes');
const reviewRoutes = require('./routes/review.routes');

const app = express();
const requestId = require('./middleware/requestId');

/**
 * Express App Configuration
 * 
 * Configures middleware and routes for the Velvet Key API.
 */

// Request ID for log correlation
app.use(requestId);

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : true, // 'true' reflects the request origin
    credentials: true,
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

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
