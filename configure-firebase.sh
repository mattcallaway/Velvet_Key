#!/bin/bash

# Firebase Configuration Helper Script
# This script helps configure Firebase credentials in the .env file

echo "========================================="
echo "Firebase Configuration Helper"
echo "========================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
fi

echo "Please provide your Firebase credentials:"
echo ""

# Get Firebase Project ID
read -p "Enter FIREBASE_PROJECT_ID: " PROJECT_ID

# Get Firebase Client Email
read -p "Enter FIREBASE_CLIENT_EMAIL: " CLIENT_EMAIL

# Get Firebase Storage Bucket
read -p "Enter FIREBASE_STORAGE_BUCKET (e.g., your-project.appspot.com): " STORAGE_BUCKET

echo ""
echo "For the private key, please paste the ENTIRE private_key value from your JSON file."
echo "It should start with -----BEGIN PRIVATE KEY----- and end with -----END PRIVATE KEY-----"
echo "Paste it below and press Ctrl+D when done:"
echo ""

# Read private key (multi-line)
PRIVATE_KEY=$(cat)

# Escape the private key for .env format
# Replace actual newlines with \n
ESCAPED_KEY=$(echo "$PRIVATE_KEY" | sed ':a;N;$!ba;s/\n/\\n/g')

echo ""
echo "Updating .env file..."

# Update or add Firebase configuration
if grep -q "FIREBASE_PROJECT_ID" .env; then
    # Update existing values
    sed -i "s|FIREBASE_PROJECT_ID=.*|FIREBASE_PROJECT_ID=$PROJECT_ID|" .env
    sed -i "s|FIREBASE_CLIENT_EMAIL=.*|FIREBASE_CLIENT_EMAIL=$CLIENT_EMAIL|" .env
    sed -i "s|FIREBASE_STORAGE_BUCKET=.*|FIREBASE_STORAGE_BUCKET=$STORAGE_BUCKET|" .env
    sed -i "s|FIREBASE_PRIVATE_KEY=.*|FIREBASE_PRIVATE_KEY=\"$ESCAPED_KEY\"|" .env
else
    # Add new values
    echo "" >> .env
    echo "# Firebase Configuration" >> .env
    echo "FIREBASE_PROJECT_ID=$PROJECT_ID" >> .env
    echo "FIREBASE_PRIVATE_KEY=\"$ESCAPED_KEY\"" >> .env
    echo "FIREBASE_CLIENT_EMAIL=$CLIENT_EMAIL" >> .env
    echo "FIREBASE_STORAGE_BUCKET=$STORAGE_BUCKET" >> .env
fi

echo ""
echo "✅ Firebase configuration updated successfully!"
echo ""
echo "Next steps:"
echo "1. Verify the configuration: cat .env | grep FIREBASE"
echo "2. Restart the server: pm2 restart all"
echo "3. Check logs: pm2 logs"
echo ""
