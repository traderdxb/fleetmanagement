# 📦 Fleet Management System - Installation Instructions

## What's in the Package

The `fleet-management-app.tar.gz` file contains a complete, ready-to-deploy Fleet & Inventory Management System.

## System Requirements

- **Operating System**: Linux, macOS, or Windows (with WSL2)
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **RAM**: Minimum 2GB available
- **Storage**: At least 10GB free space
- **Ports**: 3000, 5000, and 5432 must be available

## Installation Steps

### 1. Extract the Archive

```bash
# Extract the archive
tar -xzf fleet-management-app.tar.gz

# Navigate into the directory
cd fleet-management-app
```

### 2. Install (Automatic - Recommended)

Run the automated installer:

```bash
# Make the installer executable
chmod +x install.sh

# Run the installer
./install.sh
```

The installer will:
- ✅ Check if Docker and Docker Compose are installed
- ✅ Create necessary configuration files
- ✅ Build and start all services (Frontend, Backend, Database)
- ✅ Initialize the database with migrations
- ✅ Seed the database with sample data
- ✅ Verify everything is running correctly

**Installation takes approximately 2-3 minutes.**

### 3. Access the Application

Once installation is complete:

1. **Open your browser** to: `http://localhost:3000`

2. **Login with default credentials:**
   - Email: `admin@fleet.com`
   - Password: `admin123`

3. **Start using the system!**

## Manual Installation (Alternative)

If you prefer manual installation or the automated installer doesn't work:

```bash
# 1. Create environment configuration files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Start all services with Docker Compose
docker-compose up -d

# 3. Wait 30 seconds for services to initialize
sleep 30

# 4. Run database migrations
docker-compose exec backend npm run db:migrate

# 5. Seed the database with sample data
docker-compose exec backend npm run db:seed
```

Then access the application at `http://localhost:3000`

## Post-Installation

### Verify Installation

Check that all services are running:

```bash
docker-compose ps
```

You should see 3 services running:
- `fleet_frontend` (port 3000)
- `fleet_backend` (port 5000)
- `fleet_db` (port 5432)

### View Logs

To see application logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Test the API

```bash
# Health check
curl http://localhost:5000/health

# Expected response: {"status":"OK","timestamp":"..."}
```

## Default User Accounts

After installation, these accounts are available:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@fleet.com | admin123 | Full system access |
| **Manager** | manager@fleet.com | manager123 | Most operations |
| **Support** | support@fleet.com | support123 | Technical operations |

**⚠️ IMPORTANT**: Change these passwords immediately before deploying to production!

## What to Do Next

1. **Explore the Dashboard**
   - View overall statistics
   - Check system health

2. **Test Key Features**
   - Create a new device in Inventory
   - Add a client
   - Create a vehicle assignment
   - View reports

3. **Customize**
   - Review the code structure
   - Modify branding/colors as needed
   - Add your company logo

4. **Prepare for Production**
   - Change default passwords
   - Update environment variables
   - Set up SSL certificates
   - Configure backups

## Troubleshooting

### Docker Not Installed

**Error**: `command not found: docker`

**Solution**: Install Docker Desktop
- Windows/Mac: https://docs.docker.com/desktop/
- Linux: https://docs.docker.com/engine/install/

### Ports Already in Use

**Error**: `port is already allocated`

**Solution**: Either:
1. Stop the service using that port, OR
2. Change ports in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # Changed from 3000 to 3001
  backend:
    ports:
      - "5001:5000"  # Changed from 5000 to 5001
```

Don't forget to update `frontend/.env`:
```
VITE_API_URL=http://localhost:5001/api
```

### Services Not Starting

**Error**: Containers exit immediately

**Solution**:
```bash
# Check logs for errors
docker-compose logs

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Database Connection Failed

**Error**: `Can't reach database server`

**Solution**:
```bash
# Restart database
docker-compose restart db

# Wait 10 seconds
sleep 10

# Try migrations again
docker-compose exec backend npm run db:migrate
```

### Migration Errors

**Error**: `Migration failed`

**Solution**:
```bash
# Reset database (⚠️ This will delete all data!)
docker-compose exec backend npx prisma migrate reset

# Seed again
docker-compose exec backend npm run db:seed
```

### Frontend Not Loading

**Error**: White screen or connection refused

**Solution**:
```bash
# Check if frontend is running
docker-compose logs frontend

# Restart frontend
docker-compose restart frontend

# If still failing, rebuild
docker-compose up -d --build frontend
```

## Useful Commands

```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend

# View logs (follow mode)
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Execute command in container
docker-compose exec backend npm run db:migrate

# Access database CLI
docker-compose exec db psql -U fleet_user fleet_management

# Backup database
docker-compose exec db pg_dump -U fleet_user fleet_management > backup.sql

# Restore database
docker-compose exec -T db psql -U fleet_user fleet_management < backup.sql

# Open Prisma Studio (database GUI)
docker-compose exec backend npx prisma studio
```

## Updating the Application

To update after making code changes:

```bash
# Rebuild and restart
docker-compose up -d --build

# If database schema changed, run migrations
docker-compose exec backend npm run db:migrate
```

## Stopping the Application

To stop all services:

```bash
docker-compose down
```

To stop and remove all data (including database):

```bash
docker-compose down -v
```

## Production Deployment

For production deployment:

1. **Update Environment Variables**
   ```bash
   # Edit backend/.env
   JWT_SECRET=<generate-a-strong-secret>
   NODE_ENV=production
   DATABASE_URL=<your-production-database-url>
   ```

2. **Change Default Passwords**
   - Log in as admin
   - Go to user management
   - Update all default passwords

3. **Set Up SSL**
   - Use nginx or traefik as reverse proxy
   - Configure SSL certificates (Let's Encrypt recommended)

4. **Configure Domain**
   - Point domain to your server
   - Update CORS settings in backend
   - Update API_URL in frontend

5. **Set Up Backups**
   ```bash
   # Add to crontab for daily backups
   0 2 * * * docker-compose exec db pg_dump -U fleet_user fleet_management > /backups/fleet_$(date +\%Y\%m\%d).sql
   ```

See `DEPLOYMENT_GUIDE.md` for detailed production deployment instructions.

## Getting Help

1. **Check Documentation**
   - `START_HERE.md` - Quick start
   - `README.md` - Full documentation
   - `QUICK_START.md` - Detailed guide
   - `DELIVERY_SUMMARY.md` - Feature overview

2. **Check Logs**
   ```bash
   docker-compose logs -f
   ```

3. **Review Code**
   - Backend code is in `backend/src/`
   - Frontend code is in `frontend/src/`
   - Database schema is in `backend/prisma/schema.prisma`

## Success Checklist

After installation, verify:

- [ ] All 3 Docker containers are running
- [ ] Frontend loads at http://localhost:3000
- [ ] Can login with default credentials
- [ ] Dashboard shows statistics
- [ ] Can navigate to all modules
- [ ] API responds at http://localhost:5000/health

## Summary

You now have a fully functional Fleet & Inventory Management System with:

✅ Complete backend API (50+ endpoints)
✅ Modern frontend interface (8 modules)
✅ PostgreSQL database with sample data
✅ Docker containerization for easy deployment
✅ Role-based access control
✅ Comprehensive documentation

**Ready to use in 2 minutes with `./install.sh`**

Enjoy your new Fleet Management System! 🚀
