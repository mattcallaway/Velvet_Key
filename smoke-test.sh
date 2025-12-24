#!/bin/bash
# Velvet Key API - Smoke Test Script
# Purpose: Validates API health and Firebase connectivity from the local server.

# Configuration
PORT=${PORT:-4000}
BASE_URL="http://localhost:$PORT"

echo "=========================================="
echo "      🚀 VELVET KEY API SMOKE TEST"
echo "=========================================="
echo "Target: $BASE_URL"
echo "Timestamp: $(date)"
echo "------------------------------------------"

# 1. API Health Check
echo -n "[1/3] API Health (/health)... "
HEALTH_RESP=$(curl -s "$BASE_URL/health")
if [[ $HEALTH_RESP == *"\"status\":\"ok\""* ]]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    echo "     Response: $HEALTH_RESP"
fi

# 2. Config Debug Check
echo -n "[2/3] Env Config (/api/debug/config)... "
CONFIG_RESP=$(curl -s "$BASE_URL/api/debug/config")
if [[ $CONFIG_RESP == *"\"firebaseInitialized\":true"* ]]; then
    echo "✅ PASS (Firebase Initialized)"
else
    echo "❌ FAIL (Firebase Not Initialized)"
    echo "     Response: $CONFIG_RESP"
fi

# 3. Firebase E2E Handshake
echo -n "[3/3] Firebase/Firestore E2E (/api/debug/firebase)... "
FIREBASE_RESP=$(curl -s "$BASE_URL/api/debug/firebase")
if [[ $FIREBASE_RESP == *"\"success\":true"* ]]; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    echo "     Response: $FIREBASE_RESP"
fi

echo "------------------------------------------"
echo "SMOKE TEST COMPLETE"
echo "=========================================="
