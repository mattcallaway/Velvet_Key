#!/bin/bash

# Velvet Key API - PostgreSQL Setup Script for Linode
# This script installs and configures PostgreSQL on Ubuntu

set -e  # Exit on any error

echo "🚀 Starting PostgreSQL installation for Velvet Key API..."

# Update package list
echo "📦 Updating package list..."
sudo apt update

# Install PostgreSQL
echo "📥 Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Check PostgreSQL status
echo "✅ Checking PostgreSQL status..."
sudo systemctl status postgresql --no-pager

# Create database and user
echo "🔧 Creating database and user..."
sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE velvet_key_db;

-- Create user with secure password
CREATE USER velvet_key_user WITH PASSWORD 'VelvetKey2025!SecurePass';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE velvet_key_db TO velvet_key_user;

-- Grant schema privileges (PostgreSQL 15+)
\c velvet_key_db
GRANT ALL ON SCHEMA public TO velvet_key_user;

-- List databases to confirm
\l

-- Exit
\q
EOF

echo "✅ Database and user created successfully!"

# Configure PostgreSQL to allow local connections
echo "🔐 Configuring PostgreSQL authentication..."
# PostgreSQL is already configured for local connections by default

# Restart PostgreSQL to apply changes
echo "🔄 Restarting PostgreSQL..."
sudo systemctl restart postgresql

echo ""
echo "🎉 PostgreSQL installation complete!"
echo ""
echo "📋 Database Details:"
echo "   Database: velvet_key_db"
echo "   User: velvet_key_user"
echo "   Password: VelvetKey2025!SecurePass"
echo ""
echo "🔗 Connection String:"
echo "   DATABASE_URL=\"postgresql://velvet_key_user:VelvetKey2025!SecurePass@localhost:5432/velvet_key_db?schema=public\""
echo ""
echo "⚠️  IMPORTANT: Update your .env file with this connection string!"
