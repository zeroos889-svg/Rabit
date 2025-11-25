#!/bin/bash

# ===============================================
# Rabit HR - Production Deployment Script
# ===============================================
# This script deploys the application to production
# Usage: ./scripts/deploy.sh [environment]
# Example: ./scripts/deploy.sh production

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/${TIMESTAMP}"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
pre_deploy_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        log_error ".env.production file not found!"
        log_warning "Copy .env.production.example to .env.production and configure it"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running!"
        exit 1
    fi
    
    # Check if docker-compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose is not installed!"
        exit 1
    fi
    
    log_success "Pre-deployment checks passed"
}

# Backup database
backup_database() {
    log_info "Creating database backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup using docker-compose
    docker-compose -f docker-compose.production.yml exec -T db pg_dump -U rabit rabit_db > "${BACKUP_DIR}/database_backup.sql"
    
    if [ $? -eq 0 ]; then
        log_success "Database backup created: ${BACKUP_DIR}/database_backup.sql"
    else
        log_warning "Database backup failed (container might not be running)"
    fi
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    docker-compose -f docker-compose.production.yml build --no-cache
    
    if [ $? -eq 0 ]; then
        log_success "Docker images built successfully"
    else
        log_error "Failed to build Docker images"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Wait for database to be ready
    sleep 5
    
    docker-compose -f docker-compose.production.yml exec -T app npm run db:push
    
    if [ $? -eq 0 ]; then
        log_success "Database migrations completed"
    else
        log_error "Database migrations failed"
        exit 1
    fi
}

# Deploy application
deploy() {
    log_info "Deploying application..."
    
    # Stop existing containers
    docker-compose -f docker-compose.production.yml down
    
    # Start new containers
    docker-compose -f docker-compose.production.yml up -d
    
    if [ $? -eq 0 ]; then
        log_success "Application deployed successfully"
    else
        log_error "Deployment failed"
        exit 1
    fi
}

# Health check
health_check() {
    log_info "Running health checks..."
    
    # Wait for application to start
    sleep 10
    
    # Check application health
    HEALTH_URL="http://localhost:3000/health"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
    
    if [ "$RESPONSE" == "200" ]; then
        log_success "Application is healthy"
    else
        log_error "Application health check failed (HTTP $RESPONSE)"
        exit 1
    fi
}

# Cleanup old backups (keep last 7)
cleanup_backups() {
    log_info "Cleaning up old backups..."
    
    cd backups
    ls -t | tail -n +8 | xargs -r rm -rf
    cd ..
    
    log_success "Old backups cleaned up"
}

# Main deployment flow
main() {
    echo ""
    echo "========================================="
    echo "   Rabit HR - Production Deployment"
    echo "========================================="
    echo ""
    
    log_info "Starting deployment to: ${ENVIRONMENT}"
    echo ""
    
    # Run deployment steps
    pre_deploy_checks
    echo ""
    
    backup_database
    echo ""
    
    build_images
    echo ""
    
    deploy
    echo ""
    
    run_migrations
    echo ""
    
    health_check
    echo ""
    
    cleanup_backups
    echo ""
    
    log_success "========================================="
    log_success "   Deployment completed successfully!"
    log_success "========================================="
    echo ""
    log_info "Application is running at: http://localhost:3000"
    log_info "View logs: docker-compose -f docker-compose.production.yml logs -f"
    echo ""
}

# Run main function
main
