# PostgreSQL Setup Instructions for Linode

## Quick Setup (Recommended)

I've created a setup script that will install and configure PostgreSQL automatically.

### Steps:

1. **Upload the setup script to your Linode server**:
   ```powershell
   # From your local machine
   scp setup-postgres.sh root@172.233.140.74:/root/
   ```

2. **SSH into your Linode server**:
   ```powershell
   ssh root@172.233.140.74
   # Password: 4B9$fnF8!.T3gBG
   ```

3. **Run the setup script**:
   ```bash
   chmod +x setup-postgres.sh
   ./setup-postgres.sh
   ```

4. **Update your .env file on the server**:
   ```bash
   cd /path/to/your/velvet-key-api
   nano .env
   ```
   
   Add this line:
   ```
   DATABASE_URL="postgresql://velvet_key_user:VelvetKey2025!SecurePass@localhost:5432/velvet_key_db?schema=public"
   ```

5. **Generate Prisma Client and run migrations**:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

---

## Manual Setup (Alternative)

If you prefer to run commands manually:

### 1. Install PostgreSQL
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

### 2. Create Database and User
```bash
sudo -u postgres psql

CREATE DATABASE velvet_key_db;
CREATE USER velvet_key_user WITH PASSWORD 'VelvetKey2025!SecurePass';
GRANT ALL PRIVILEGES ON DATABASE velvet_key_db TO velvet_key_user;

\c velvet_key_db
GRANT ALL ON SCHEMA public TO velvet_key_user;

\q
```

### 3. Verify Installation
```bash
sudo systemctl status postgresql
```

---

## Security Notes

⚠️ **IMPORTANT**: The password `VelvetKey2025!SecurePass` is a placeholder. You should:
1. Change it to a more secure, random password
2. Never commit the `.env` file to version control
3. Use different passwords for development and production

---

## Next Steps

After PostgreSQL is set up:
1. Run Prisma migrations to create tables
2. Seed the database with test data
3. Test the API endpoints
