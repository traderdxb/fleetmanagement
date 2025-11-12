# Fleet & Inventory Management System - Quick Start Guide

## 📦 What's Included

A complete full-stack fleet and inventory management application with:

### Backend (Node.js + Express + PostgreSQL)
- ✅ RESTful API with TypeScript
- ✅ Prisma ORM for database management
- ✅ JWT authentication & role-based access
- ✅ 15 modules covering all requirements
- ✅ Activity logging and audit trails

### Frontend (React + TypeScript + Tailwind)
- ✅ Modern responsive UI
- ✅ Dashboard with real-time statistics
- ✅ 8 main modules (Inventory, Assignments, Clients, etc.)
- ✅ Role-based navigation
- ✅ Authentication flow

### Deployment
- ✅ Docker & Docker Compose ready
- ✅ One-command deployment
- ✅ PostgreSQL database included
- ✅ Production-ready configuration

## 🚀 Quick Start (5 Minutes)

### Step 1: Extract the Archive
```bash
tar -xzf fleet-management-app.tar.gz
cd fleet-management-app
```

### Step 2: Run Setup Script
```bash
chmod +x setup.sh
./setup.sh
```

### Step 3: Start the Application
```bash
docker-compose up -d
```

### Step 4: Wait 10 seconds, then Initialize Database
```bash
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

### Step 5: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Login**: admin@fleet.com / admin123

That's it! Your fleet management system is now running.

## 📱 Default Login Credentials

After seeding, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fleet.com | admin123 |
| Manager | manager@fleet.com | manager123 |
| Support | support@fleet.com | support123 |

**⚠️ IMPORTANT**: Change these passwords immediately in production!

## 🎯 Key Features Implemented

### 1. Inventory Management (/inventory)
- Add/edit devices and SIM cards
- Track status: Available, Assigned, Removed
- Ownership-based logic (Owned/Leasing)
- Bulk operations support

### 2. Vehicle Assignment (/assignments)
- New installations
- Device replacements
- Removals
- Transfer installations
- Auto-update inventory based on job type

### 3. Client Management (/clients)
- Complete client database
- Contact information
- Activity history per client
- Assignment tracking

### 4. Subscription Renewals (/renewals)
- Track certificate & subscription expiries
- Automated renewal dates (1 year extension)
- Status tracking (Upcoming, Due, Overdue, Renewed)
- Renewal workflow

### 5. Task Management (/tasks)
- Pending tasks tracker
- Job scheduling
- Task assignment to technicians
- Status management

### 6. Reports (/reports)
- Activity summary reports
- Platform masterlist
- Filterable and exportable data
- Date range selection

### 7. Analytics (/analytics)
- Dashboard statistics
- Technician performance metrics
- Installation trends
- Real-time insights

### 8. Platform Masterlist
- Live tracker list per platform
- Auto-updated on assignments
- Multi-platform support
- Export functionality

## 🔧 Advanced Configuration

### Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://fleet_user:fleet_password@db:5432/fleet_management
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### Changing Ports

Edit `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # Change 3001 to your desired port
  
  backend:
    ports:
      - "5001:5000"  # Change 5001 to your desired port
```

Don't forget to update `VITE_API_URL` in frontend/.env if you change the backend port.

## 📊 Database Schema

The system includes comprehensive database models:
- Users (with role-based access)
- Devices & SIMs
- Vehicles
- Clients
- Assignments
- Replacements
- Removals
- Renewals
- Tasks
- Activity Logs
- Master Data (Platforms, Locations, Installers, Accessories)

## 🛠️ Development Workflow

### Without Docker

**Backend**:
```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Accessing Database

```bash
# Via Prisma Studio
docker-compose exec backend npx prisma studio

# Via psql
docker-compose exec db psql -U fleet_user fleet_management
```

## 🔐 Security Notes

1. **Change default passwords** immediately in production
2. **Update JWT_SECRET** to a strong random string
3. **Enable HTTPS** with SSL certificates
4. **Set up firewall rules** for production deployment
5. **Regular database backups**
6. **Review user permissions** and roles

## 📦 Database Backup & Restore

### Backup
```bash
docker-compose exec db pg_dump -U fleet_user fleet_management > backup.sql
```

### Restore
```bash
docker-compose exec -T db psql -U fleet_user fleet_management < backup.sql
```

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart db

# View database logs
docker-compose logs db
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :5000

# Kill process or change ports in docker-compose.yml
```

### Migration Errors
```bash
# Reset database (⚠️ WARNING: Deletes all data)
docker-compose exec backend npx prisma migrate reset

# Or manually
docker-compose exec backend npx prisma migrate deploy
```

### Frontend Not Loading
```bash
# Check if frontend is running
docker-compose logs frontend

# Rebuild frontend
docker-compose up -d --build frontend
```

## 📝 API Documentation

### Authentication
```
POST /api/auth/login
POST /api/auth/register (Admin only)
GET /api/auth/me
```

### Inventory
```
GET /api/inventory/devices
POST /api/inventory/devices
PUT /api/inventory/devices/:id
DELETE /api/inventory/devices/:id

GET /api/inventory/sims
POST /api/inventory/sims
PUT /api/inventory/sims/:id
```

### Assignments
```
GET /api/assignments
POST /api/assignments
PUT /api/assignments/:id
DELETE /api/assignments/:id

POST /api/assignments/replacements
GET /api/assignments/replacements/all

POST /api/assignments/removals
GET /api/assignments/removals/all
```

### Clients
```
GET /api/clients
POST /api/clients
PUT /api/clients/:id
GET /api/clients/:id/history
```

### Renewals
```
GET /api/renewals
POST /api/renewals/:id/renew
GET /api/renewals/upcoming
```

### Tasks
```
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
```

### Reports & Analytics
```
GET /api/reports/activity
GET /api/reports/platform-masterlist
GET /api/analytics/dashboard
GET /api/analytics/technician-performance
GET /api/analytics/installations
```

## 🌐 Production Deployment

### Option 1: Cloud VPS (DigitalOcean, AWS EC2, etc.)
1. Upload files to server
2. Install Docker & Docker Compose
3. Update environment variables
4. Run `docker-compose up -d`
5. Set up nginx reverse proxy
6. Configure SSL with Let's Encrypt

### Option 2: Managed Services
1. Deploy backend to AWS/GCP/Azure
2. Use managed PostgreSQL (AWS RDS, etc.)
3. Deploy frontend to Vercel/Netlify/S3
4. Update API_URL to production backend

### Option 3: Kubernetes
1. Create Docker images
2. Push to container registry
3. Deploy with Kubernetes manifests
4. Set up ingress and load balancers

## 📞 Support & Customization

This is a fully functional base system. To add more features:

1. **Backend**: Add controllers in `backend/src/controllers/`
2. **Frontend**: Add pages in `frontend/src/pages/`
3. **Database**: Update `backend/prisma/schema.prisma` and run migrations
4. **API Routes**: Add routes in `backend/src/routes/`

## ✅ System Requirements

- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **OR Manual**: Node.js 18+, PostgreSQL 15+
- **RAM**: 2GB minimum
- **Storage**: 10GB recommended

## 🎉 What's Next?

The system is production-ready but you may want to:
- [ ] Customize UI colors and branding
- [ ] Add more report templates
- [ ] Implement WhatsApp integration for job scheduling
- [ ] Add automated ITC certificate generation
- [ ] Integrate Excel import/export functionality
- [ ] Add email notifications for renewals
- [ ] Implement advanced search filters
- [ ] Add more analytics visualizations

Enjoy your fleet management system! 🚀
