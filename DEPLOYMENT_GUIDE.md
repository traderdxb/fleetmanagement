# Quick Deployment Guide

## Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (if running without Docker)
- PostgreSQL 15+ (if running without Docker)

## Quick Start with Docker (Recommended)

1. **Clone/Download the project**

2. **Create environment file**
```bash
cp backend/.env.example backend/.env
# Edit if needed, defaults work for Docker setup
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Initialize database**
```bash
# Wait 10 seconds for services to start
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Default login: admin@fleet.com / admin123

## Manual Setup (Without Docker)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run db:migrate
npm run db:seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Common Issues

**Port already in use**: Change ports in docker-compose.yml
**Database connection failed**: Ensure PostgreSQL is running
**Migration errors**: Run `docker-compose exec backend npx prisma migrate reset`

## Production Deployment

1. Update environment variables
2. Build frontend: `cd frontend && npm run build`
3. Use production docker-compose: `docker-compose -f docker-compose.prod.yml up -d`
4. Set up SSL/TLS certificates
5. Configure reverse proxy (nginx/traefik)

For detailed documentation, see README.md
