const { db, admin, firebaseInitialized } = require('../config/firebase');

/**
 * Audit Service (v2 - Refined)
 * 
 * Handles emitting structural audit logs to Firestore and stdout
 * following the "Phase 0" contract.
 */
class AuditService {
    /**
     * Log an audit event
     * @param {Object} params Logging parameters
     */
    static async log({
        req,
        action,
        entityType,
        entityId,
        metadata = {},
        severity = 'info',
        source = 'api',
        status = 'SUCCESS'
    }) {
        const eventId = admin.firestore ? db.collection('_').doc().id : Date.now().toString();

        const auditEvent = {
            event_id: eventId,
            timestamp: admin.firestore ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString(),
            actor_type: req.user?.role || 'SYSTEM',
            actor_id: req.user?.firebaseUid || 'system',
            host_id: req.user?.id || req.user?.firebaseUid || 'system', // Primary grouping ID
            action, // e.g., 'listing.create'
            entity_type: entityType,
            entity_id: entityId,
            severity,
            source,
            request_id: req.id || 'unknown',
            ip: req.ip,
            user_agent: req.get('user-agent'),
            metadata: {
                ...metadata,
                status // Keep status in metadata or as top level if needed
            }
        };

        // 1. Log to stdout (for Linode/PM2 logs)
        console.log(`[AUDIT] ${action} | ${severity} | Actor: ${auditEvent.actor_id} | Entity: ${entityType}:${entityId}`);

        // 2. Log to Firestore
        if (firebaseInitialized && db) {
            try {
                // Remove any undefined/null values for Firestore compatibility
                const sanitizedEvent = JSON.parse(JSON.stringify(auditEvent));
                // Restore serverTimestamp which gets mangled by JSON.stringify
                sanitizedEvent.timestamp = admin.firestore.FieldValue.serverTimestamp();

                await db.collection('audit_events').doc(eventId).set(sanitizedEvent);
            } catch (error) {
                console.error('Failed to write audit event to Firestore:', error.message);
            }
        }

        return auditEvent;
    }
}

module.exports = AuditService;
