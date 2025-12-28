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


// Set security HTTP headers (Strict Mode)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"], // No inline scripts
            styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for now (common in React)
            imgSrc: ["'self'", "data:", "https://storage.googleapis.com"], // Allow Firebase Storage
            connectSrc: ["'self'", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com"],
        },
    },
    hsts: {
        maxAge: 31536000, // 1 Year
        includeSubDomains: true,
        preload: true,
    },
    noSniff: true,
    referrerPolicy: { policy: 'no-referrer' }, // Strict privacy
}));

// Data sanitization against XSS
app.use(xss());

// --- TIERED RATE LIMITING ---

// 1. Strict Auth Limiter (Brute Force Protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 10, // Max 10 login attempts per 15 mins
    message: 'Too many login attempts, please try again later.'
});
app.use('/api/users/login', authLimiter); // Assuming login is here or similar
app.use('/api/users/register', authLimiter);

// 2. Write Limiter (Spam Protection)
const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // 50 writes per 15 mins
    message: 'You are performing too many actions. Slow down.'
});
// Apply to POST, PUT, DELETE only
app.use((req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        writeLimiter(req, res, next);
    } else {
        next();
    }
});

// 3. Global Limiter (General browsing)
const globalLimiter = rateLimit({
    max: 200, // Increased slighty for browsing
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', globalLimiter);

// --- CANARY ROUTES (Honeypots) ---
const AuditService = require('./services/audit.service');

const canaryHandler = async (req, res) => {
    const ip = req.ip;
    console.warn(`[SECURITY] Canary triggered by IP: ${ip} on ${req.originalUrl}`);

    // Log Critical Audit Event
    await AuditService.log({
        req: { ...req, user: { id: 'CANARY_TRAP', role: 'SYSTEM' } },
        action: 'security.canary_triggered',
        entityType: 'ip',
        entityId: ip,
        severity: 'critical',
        source: 'canary'
    });

    // We could ban the IP here if we had a blacklist table. 
    // For now, return a 403 or hang the request.
    res.status(403).send('Forbidden');
};

app.all('/admin.php', canaryHandler);
app.all('/wp-login.php', canaryHandler);
app.all('/.env', canaryHandler);

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
