const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation.middleware');

/**
 * Message Routes
 * 
 * /api/messages
 */

router.use(verifyFirebaseToken); // All message routes require auth

// List conversations
router.get('/conversations', messagesController.listConversations);

// Get specific conversation
router.get('/conversations/:id', messagesController.getConversation);

// Send message
router.post(
    '/send',
    [
        body('content').optional().isString().trim(),
        body('recipientId').optional().isUUID(),
        body('conversationId').optional().isUUID(),
        body('subject').optional().isString().trim().isLength({ max: 100 }),
        body('attachments').optional().isArray(),
        handleValidationErrors
    ],
    messagesController.sendMessage
);

module.exports = router;
