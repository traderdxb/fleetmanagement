# Fleet & Inventory Management Application

A comprehensive cloud-based fleet and inventory management system for tracking devices, SIM cards, vehicle assignments, and subscription renewals.

## Features

- **Inventory Management**: Track devices and SIM cards with ownership-based logic
- **Vehicle Assignment**: Manage installations, removals, replacements, and transfers
- **Replacement & Removal Tracking**: Complete audit trail for all device movements
- **Platform Masterlist**: Active tracker list with multi-platform support
- **Subscription Renewals**: Automated tracking of certificate and subscription expiries
- **Client Management**: Complete client database with activity history
- **Accessories Management**: Track all device accessories
- **Role-Based Access Control**: Admin, Manager, Accounts, Support, Sales, Viewer roles
- **Bulk Operations**: Excel import/export functionality
- **Activity Reports**: Daily summary reports with filters
- **ITC Certificate Generation**: Automated PDF certificate generation
- **Job Scheduling**: Calendar-based scheduling with WhatsApp integration
- **Analytics Dashboard**: Real-time insights and performance metrics

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching
- Recharts for analytics
- Axios for API calls

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- JWT authentication
- Express Validator

### Deployment
- Docker & Docker Compose
- Ready for cloud deployment (AWS, Azure, GCP)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (for easy deployment)
- PostgreSQL (if not using Docker)

### Option 1: Docker Deployment (Recommended)

1. Clone the repository
2. Create `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://fleet_user:fleet_password@db:5432/fleet_management"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=5000
NODE_ENV=development

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

3. Start the application:

```bash
docker-compose up -d
```

4. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

5. Initialize the database:

```bash
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

### Option 2: Manual Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/fleet_management"
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
```

4. Run database migrations:
```bash
npm run db:migrate
npm run db:seed
```

5. Start the server:
```bash
npm run dev
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

## Default Login Credentials

After seeding the database, use these credentials:

- **Admin**: admin@fleet.com / admin123
- **Manager**: manager@fleet.com / manager123
- **Support**: support@fleet.com / support123

**Important**: Change these passwords immediately in production!

## Project Structure

```
fleet-management-app/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── contexts/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user

### Inventory Endpoints
- `GET /api/inventory/devices` - List all devices
- `POST /api/inventory/devices` - Add new device
- `PUT /api/inventory/devices/:id` - Update device
- `DELETE /api/inventory/devices/:id` - Delete device
- `POST /api/inventory/devices/bulk` - Bulk upload devices

### Vehicle Assignment Endpoints
- `GET /api/assignments` - List all assignments
- `POST /api/assignments` - Create new assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment

### Client Management Endpoints
- `GET /api/clients` - List all clients
- `POST /api/clients` - Add new client
- `PUT /api/clients/:id` - Update client
- `GET /api/clients/:id/history` - Get client history

### Subscription Renewals Endpoints
- `GET /api/renewals` - List renewals with filters
- `POST /api/renewals/:id/renew` - Renew subscription
- `GET /api/renewals/upcoming` - Get upcoming renewals

### Reports Endpoints
- `GET /api/reports/activity` - Daily activity summary
- `GET /api/reports/export/:type` - Export reports to Excel
- `POST /api/reports/certificate` - Generate ITC certificate

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/technician-performance` - Technician metrics
- `GET /api/analytics/installations` - Installation metrics

## Features Guide

### Bulk Upload
1. Navigate to Inventory Management
2. Click "Bulk Upload"
3. Download the Excel template
4. Fill in device/SIM data
5. Upload the completed file

### Vehicle Assignment
1. Go to Vehicle Assignment
2. Select job type (New Installation, Removal, Replacement, Transfer)
3. Fill in device and vehicle details
4. System auto-updates inventory based on ownership rules

### Subscription Renewals
1. Navigate to Renewals Tracker
2. View upcoming, due, or overdue renewals
3. Click "Renew" on any item
4. System automatically extends dates by 1 year

### Generate ITC Certificate
1. Go to any installation record
2. Click "Generate Certificate"
3. PDF is automatically created with company details and signatures

## Role Permissions

| Feature | Admin | Manager | Accounts | Support | Sales | Viewer |
|---------|-------|---------|----------|---------|-------|--------|
| Inventory Management | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Vehicle Assignment | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| Client Management | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Renewals | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Reports | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| User Management | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Analytics | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |

## Deployment

### Production Deployment with Docker

1. Update environment variables for production
2. Build and deploy:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment (AWS/Azure/GCP)

1. Set up PostgreSQL database
2. Configure environment variables
3. Deploy backend as container or serverless function
4. Deploy frontend to CDN/static hosting
5. Configure domain and SSL certificates

## Maintenance

### Database Backup
```bash
docker-compose exec db pg_dump -U fleet_user fleet_management > backup.sql
```

### Database Restore
```bash
docker-compose exec -T db psql -U fleet_user fleet_management < backup.sql
```

### Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure database exists and user has proper permissions

### Port Conflicts
- Change ports in docker-compose.yml if 3000 or 5000 are in use
- Update REACT_APP_API_URL accordingly

### Migration Issues
```bash
docker-compose exec backend npx prisma migrate reset
docker-compose exec backend npx prisma migrate deploy
```

## Support

For issues and questions, please contact the development team.

## License

Proprietary - All rights reserved
