#!/bin/bash

# Fleet Management System - Complete Installation Script
# This script will set up everything needed to run the application

set -e  # Exit on error

echo "=============================================="
echo "Fleet Management System - Installation"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if running from correct directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the fleet-management-app directory"
    exit 1
fi

print_info "Starting installation process..."
echo ""

# Check prerequisites
print_info "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first:"
    echo "  Visit: https://docs.docker.com/get-docker/"
    exit 1
fi
print_status "Docker is installed"

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first:"
    echo "  Visit: https://docs.docker.com/compose/install/"
    exit 1
fi
print_status "Docker Compose is installed"

echo ""
print_info "Creating environment files..."

# Create backend .env if it doesn't exist
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    print_status "Created backend/.env"
else
    print_warning "backend/.env already exists, skipping"
fi

# Create frontend .env if it doesn't exist
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    print_status "Created frontend/.env"
else
    print_warning "frontend/.env already exists, skipping"
fi

echo ""
print_info "Stopping any existing containers..."
docker-compose down 2>/dev/null || true
print_status "Existing containers stopped"

echo ""
print_info "Building and starting services..."
docker-compose up -d --build

echo ""
print_info "Waiting for services to be ready (30 seconds)..."
sleep 30

echo ""
print_info "Checking service health..."

# Check if containers are running
if docker-compose ps | grep -q "Exit"; then
    print_error "Some containers failed to start. Run 'docker-compose logs' to see details."
    exit 1
fi
print_status "All containers are running"

echo ""
print_info "Initializing database..."

# Run migrations
print_info "Running database migrations..."
if docker-compose exec -T backend npm run db:migrate; then
    print_status "Migrations completed successfully"
else
    print_error "Migration failed. Check logs with: docker-compose logs backend"
    exit 1
fi

# Seed database
print_info "Seeding database with initial data..."
if docker-compose exec -T backend npm run db:seed; then
    print_status "Database seeded successfully"
else
    print_error "Seeding failed. Check logs with: docker-compose logs backend"
    exit 1
fi

echo ""
echo "=============================================="
print_status "Installation Complete!"
echo "=============================================="
echo ""
print_info "Application is now running:"
echo ""
echo "  🌐 Frontend:  http://localhost:3000"
echo "  🔧 Backend:   http://localhost:5000"
echo "  📊 Database:  PostgreSQL on localhost:5432"
echo ""
print_info "Default Login Credentials:"
echo ""
echo "  📧 Email:    admin@fleet.com"
echo "  🔑 Password: admin123"
echo ""
echo "  Other accounts:"
echo "  • Manager: manager@fleet.com / manager123"
echo "  • Support: support@fleet.com / support123"
echo ""
print_warning "IMPORTANT: Change these passwords in production!"
echo ""
print_info "Useful Commands:"
echo ""
echo "  View logs:          docker-compose logs -f"
echo "  Stop application:   docker-compose down"
echo "  Restart:            docker-compose restart"
echo "  Database backup:    docker-compose exec db pg_dump -U fleet_user fleet_management > backup.sql"
echo ""
print_status "Ready to use! Open http://localhost:3000 in your browser"
echo ""
