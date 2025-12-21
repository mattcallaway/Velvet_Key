#!/bin/bash

# Velvet Key API - Deployment Script for Linode
# This script pulls the latest code, installs dependencies, and runs migrations

set -e  # Exit on any error

echo "🚀 Deploying Velvet Key API..."

# Navigate to project directory (update this path if needed)
cd /root/Velvet_Key || { echo "❌ Project directory not found"; exit 1; }

# Pull latest code from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Update .env file with database connection
echo "🔧 Updating .env file..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=4000

# Database Configuration
DATABASE_URL="postgresql://velvet_key_user:VelvetKey2025!SecurePass@localhost:5432/velvet_key_db?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGINS=http://172.233.140.74,http://localhost:3000
EOF

# Generate Prisma Client
echo "🔨 Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Optional: Seed the database (comment out if you don't want test data)
echo "🌱 Seeding database..."
npm run prisma:seed

# Restart PM2
echo "🔄 Restarting application with PM2..."
pm2 restart all || pm2 start server.js --name velvet-key-api

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Test the API: http://172.233.140.74/health"
echo "   2. Check PM2 status: pm2 status"
echo "   3. View logs: pm2 logs"
