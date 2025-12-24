const { db, admin, firebaseInitialized } = require('../config/firebase');

/**
 * Audit Service
 * 
 * Handles emitting structural audit logs to Firestore and stdout.
 */
class AuditService {
    /**
     * Log an audit event
     * @param {Object} params Logging parameters
     */
    static async log({ req, action, target, metadata = {}, status = 'SUCCESS' }) {
        const auditEvent = {
            audit_id: admin.firestore ? db.collection('_').doc().id : Date.now().toString(),
            timestamp: admin.firestore ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString(),
            request_id: req.id || 'unknown',
            actor: {
                uid: req.user?.firebaseUid || 'system',
                email: req.user?.email || null,
                role: req.user?.role || 'GUEST'
            },
            action,
            target,
            metadata: {
                ...metadata,
                ip_address: req.ip,
                user_agent: req.get('user-agent')
            },
            status
        };

        // 1. Log to stdout (for Linode/PM2 logs)
        console.log(`[AUDIT] ${action} | Actor: ${auditEvent.actor.uid} | Target: ${target.type}:${target.id} | Status: ${status}`);

        // 2. Log to Firestore (if available)
        if (firebaseInitialized && db) {
            try {
                // Remove any undefined/null values for Firestore compatibility
                const sanitizedEvent = JSON.parse(JSON.stringify(auditEvent));
                // Restore serverTimestamp if it was stringified
                sanitizedEvent.timestamp = admin.firestore.FieldValue.serverTimestamp();

                await db.collection('audit_logs').doc(auditEvent.audit_id).set(sanitizedEvent);
            } catch (error) {
                console.error('Failed to write audit log to Firestore:', error.message);
            }
        }

        return auditEvent;
    }
}

module.exports = AuditService;
