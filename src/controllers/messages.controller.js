const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { success, error: errorResponse } = require('../utils/response.util');

/**
 * Messages Controller
 * 
 * Handles conversations and messaging between users.
 */

// List all conversations for the current user
async function listConversations(req, res) {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { participantOneId: userId },
                    { participantTwoId: userId }
                ]
            },
            include: {
                participantOne: {
                    select: { id: true, firstName: true, lastName: true, profileImageUrl: true }
                },
                participantTwo: {
                    select: { id: true, firstName: true, lastName: true, profileImageUrl: true }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { updatedAt: 'desc' },
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        // Format response to identify "other" participant
        const formatted = conversations.map(c => {
            const isP1 = c.participantOneId === userId;
            const otherUser = isP1 ? c.participantTwo : c.participantOne;
            return {
                id: c.id,
                subject: c.subject,
                updatedAt: c.updatedAt,
                otherUser,
                lastMessage: c.messages[0] || null
            };
        });

        return success(res, formatted);
    } catch (err) {
        console.error('List Conversations Error:', err);
        return errorResponse(res, 'Failed to fetch conversations', 500);
    }
}

// Get single conversation details and messages
async function getConversation(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                participantOne: {
                    select: { id: true, firstName: true, lastName: true, profileImageUrl: true }
                },
                participantTwo: {
                    select: { id: true, firstName: true, lastName: true, profileImageUrl: true }
                },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        sender: {
                            select: { id: true, firstName: true, profileImageUrl: true }
                        }
                    }
                }
            }
        });

        if (!conversation) {
            return errorResponse(res, 'Conversation not found', 404);
        }

        // Access Check
        if (conversation.participantOneId !== userId && conversation.participantTwoId !== userId) {
            return errorResponse(res, 'Unauthorized to view this conversation', 403);
        }

        return success(res, conversation);
    } catch (err) {
        console.error('Get Conversation Error:', err);
        return errorResponse(res, 'Failed to fetch conversation', 500);
    }
}

// Send a message (Start new conversation if needed)
async function sendMessage(req, res) {
    try {
        const senderId = req.user.id;
        const { recipientId, content, subject, conversationId, attachments } = req.body;

        if (!content && (!attachments || attachments.length === 0)) {
            return errorResponse(res, 'Message must have content or attachments', 400);
        }

        let targetConversationId = conversationId;

        // If no conversationId, check if one exists or create new
        if (!targetConversationId) {
            if (!recipientId) {
                return errorResponse(res, 'Recipient ID is required for new conversation', 400);
            }

            // Check existing
            const existing = await prisma.conversation.findFirst({
                where: {
                    OR: [
                        { participantOneId: senderId, participantTwoId: recipientId },
                        { participantOneId: recipientId, participantTwoId: senderId }
                    ]
                }
            });

            if (existing) {
                targetConversationId = existing.id;
            } else {
                // Create new
                const newConv = await prisma.conversation.create({
                    data: {
                        participantOneId: senderId,
                        participantTwoId: recipientId,
                        subject: subject || 'General Inquiry'
                    }
                });
                targetConversationId = newConv.id;
            }
        }

        // Verify existence access if passed ID manually
        if (conversationId) {
            const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
            if (!conv) return errorResponse(res, 'Conversation not found', 404);
            if (conv.participantOneId !== senderId && conv.participantTwoId !== senderId) {
                return errorResponse(res, 'Unauthorized', 403);
            }
        }

        // Create Message
        const message = await prisma.message.create({
            data: {
                conversationId: targetConversationId,
                senderId,
                content,
                attachments: attachments || []
            }
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: targetConversationId },
            data: { updatedAt: new Date() }
        });

        return success(res, message, 'Message sent successfully');
    } catch (err) {
        console.error('Send Message Error:', err);
        return errorResponse(res, 'Failed to send message', 500);
    }
}

module.exports = {
    listConversations,
    getConversation,
    sendMessage
};
