require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const userRoutes = require('./routes/users.routes');
const rentalRoutes = require('./routes/rentals.routes');
const bookingRoutes = require('./routes/bookings.routes');
const reviewRoutes = require('./routes/review.routes');
const messageRoutes = require('./routes/messages.routes');

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


// Set security HTTP headers
app.use(helmet());

// Data sanitization against XSS
app.use(xss());

// Limit requests from same API
const limiter = rateLimit({
    max: 100, // Limit each IP to 100 requests per 15 mins
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true }));

// Prevent Parameter Pollution
app.use(hpp());

// API routes
app.use('/api/users', userRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);

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
