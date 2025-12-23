#!/bin/bash
# SMOKE TEST SCRIPT FOR VELVET KEY API
# Usage: ./smoke-test.sh [API_URL]
# Example: ./smoke-test.sh http://localhost:4000

API_URL=$1
if [ -z "$API_URL" ]; then 
    API_URL="http://localhost:4000"
fi

echo "------------------------------------------------"
echo "🔍 STARTING SMOKE TEST: $API_URL"
echo "------------------------------------------------"

# 1. API Health Check
echo -n "1. API Basic Health: "
RESPONSE=$(curl -s "$API_URL/health")
if echo "$RESPONSE" | grep -q "\"status\":\"ok\""; then
    echo "✅ PASS"
else
    echo "❌ FAIL (Check if app is running on $API_URL)"
fi

# 2. Firebase Initialization Check
echo -n "2. Firebase SDK Init: "
RESPONSE=$(curl -s "$API_URL/api/debug/firebase-status")
if echo "$RESPONSE" | grep -q "\"status\":\"ready\""; then
    echo "✅ PASS"
else
    echo "❌ FAIL (Check environment variables)"
fi

# 3. Firestore Read/Write Check
echo -n "3. Firestore Read/Write: "
RESPONSE=$(curl -s "$API_URL/api/debug/firestore-test")
if echo "$RESPONSE" | grep -q "\"success\":true"; then
    echo "✅ PASS"
else
    echo "❌ FAIL (Check permissions/credentials)"
fi

# 4. Firebase Auth Handshake Check
echo -n "4. Firebase Auth API: "
RESPONSE=$(curl -s "$API_URL/api/debug/auth-test")
if echo "$RESPONSE" | grep -q "\"success\":true"; then
    echo "✅ PASS"
else
    echo "❌ FAIL (Check service account permissions)"
fi

echo "------------------------------------------------"
echo "🎉 SMOKE TEST COMPLETE"
echo "------------------------------------------------"
