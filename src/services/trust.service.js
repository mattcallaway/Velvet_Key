const prisma = require('../config/database');
const AuditService = require('./audit.service');

/**
 * Trust & Safety Service
 * 
 * Handles User Blocking, Reporting, and Moderation Logic.
 * Enforces "Trust is First-Class Infrastructure".
 */
class TrustService {

    /**
     * Report a User or Content
     * 
     * @param {string} reporterId - User ID making the report
     * @param {Object} data - Report data
     * @returns {Promise<Object>} Created report
     */
    async reportUser(reporterId, data) {
        const { reportedId, entityType, entityId, reason, details } = data;

        const report = await prisma.report.create({
            data: {
                reporterId,
                reportedId,
                entityType,
                entityId,
                reason,
                details
            }
        });

        // Audit Log (Critical)
        await AuditService.log({
            req: { user: { id: reporterId } }, // Mock req for internal call or pass real req if available
            action: 'trust.report.create',
            entityType: 'report',
            entityId: report.id,
            severity: 'high',
            metadata: {
                reason,
                target: reportedId
            }
        });

        // Auto-Action: If user has > 3 pending reports in 24h, Soft Hide them
        await this.checkAutoModeration(reportedId);

        return report;
    }

    /**
     * Block a User
     * 
     * @param {string} blockerId 
     * @param {string} blockedId 
     */
    async blockUser(blockerId, blockedId) {
        if (blockerId === blockedId) {
            throw new Error('Cannot block yourself');
        }

        try {
            const block = await prisma.block.create({
                data: {
                    blockerId,
                    blockedId
                }
            });

            await AuditService.log({
                req: { user: { id: blockerId } },
                action: 'trust.block.create',
                entityType: 'user',
                entityId: blockedId,
                severity: 'info'
            });

            return block;
        } catch (err) {
            // If already blocked, just return true/success
            if (err.code === 'P2002') {
                return { message: 'Already blocked' };
            }
            throw err;
        }
    }

    /**
     * Check if a relationship is blocked (Bidirectional)
     * 
     * @param {string} userId1 
     * @param {string} userId2 
     * @returns {Promise<boolean>}
     */
    async isBlocked(userId1, userId2) {
        if (!userId1 || !userId2) return false;

        const block = await prisma.block.findFirst({
            where: {
                OR: [
                    { blockerId: userId1, blockedId: userId2 },
                    { blockerId: userId2, blockedId: userId1 }
                ]
            }
        });

        return !!block;
    }

    /**
     * Auto-Moderation Trigger
     * Checks recent reports and applies soft_hide if threshold met.
     */
    async checkAutoModeration(userId) {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const reportCount = await prisma.report.count({
            where: {
                reportedId: userId,
                status: 'PENDING',
                createdAt: { gte: oneDayAgo }
            }
        });

        if (reportCount >= 3) {
            await prisma.user.update({
                where: { id: userId },
                data: { moderationStatus: 'SOFT_HIDDEN' }
            });

            console.log(`[AUTO-MOD] User ${userId} SOFT_HIDDEN due to report spike.`);
        }
    }
}

module.exports = new TrustService();
