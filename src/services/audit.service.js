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

        // Safe User Extraction
        const actorId = req.user?.id || req.user?.firebaseUid || 'system';
        const actorType = req.user?.role || 'SYSTEM';

        const auditEvent = {
            event_id: eventId,
            timestamp: admin.firestore ? admin.firestore.FieldValue.serverTimestamp() : new Date().toISOString(),
            actor_type: actorType,
            actor_id: actorId,
            host_id: actorId, // Primary grouping ID
            action,
            entity_type: entityType,
            entity_id: entityId,
            severity,
            source,
            request_id: req.id || 'unknown',
            ip: req.ip,
            user_agent: req.get('user-agent'),
            metadata: {
                ...metadata,
                status
            }
        };

        // --- REDACTION LOGIC ---
        const REDACT_KEYS = ['email', 'password', 'token', 'authorization', 'address', 'phone', 'name', 'lastName', 'firstName', 'content', 'body', 'creditCard'];

        function redact(obj) {
            if (!obj) return obj;
            if (typeof obj !== 'object') return obj;

            // Deep clone to avoid mutating original
            const copy = Array.isArray(obj) ? [...obj] : { ...obj };

            for (const key in copy) {
                const lowerKey = key.toLowerCase();
                if (REDACT_KEYS.some(k => lowerKey.includes(k.toLowerCase()))) {
                    copy[key] = '[REDACTED]';
                } else if (typeof copy[key] === 'object') {
                    copy[key] = redact(copy[key]);
                }
            }
            return copy;
        }

        const safeEvent = redact(auditEvent);
        // -----------------------

        // 1. Log to stdout (Redacted)
        // Only log metadata keys, not the full object to keep logs clean
        const metaKeys = Object.keys(safeEvent.metadata).join(',');
        console.log(`[AUDIT] ${action} | ${severity} | Actor: ${actorId} | Entity: ${entityType}:${entityId} | Meta: [${metaKeys}]`);

        // 2. Log to Firestore (Redacted)
        if (firebaseInitialized && db) {
            try {
                const firestoreEvent = JSON.parse(JSON.stringify(safeEvent));
                // Restore timestamp
                firestoreEvent.timestamp = admin.firestore.FieldValue.serverTimestamp();

                await db.collection('audit_events').doc(eventId).set(firestoreEvent);
            } catch (error) {
                console.error('Failed to write audit event to Firestore:', error.message);
            }
        }

        return safeEvent;
    }
}

module.exports = AuditService;
