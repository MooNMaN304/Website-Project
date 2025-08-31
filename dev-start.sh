#!/bin/bash

# Development environment startup script
echo "🚀 Starting development environment..."

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "❌ .env.development file not found!"
    echo "Please create .env.development file with your development configuration."
    exit 1
fi

# Stop and remove existing containers, networks, volumes, and custom images only
echo "🧹 Cleaning up existing docker-compose resources..."
docker-compose -p web_site_dev -f docker-compose.dev.yml down --volumes --remove-orphans --rmi local

# Rebuild and start development environment
echo "🔨 Rebuilding and starting development environment..."
docker-compose -p web_site_dev -f docker-compose.dev.yml up --build --force-recreate


echo "✅ Development environment started!"
echo ""
echo "📊 Services available at:"
echo "  • Frontend:        http://localhost:3001"
echo "  • Backend API:     http://localhost:8002"
echo "  • Traefik (via proxy): http://localhost:8001"
echo "  • Traefik Dashboard: http://localhost:8081"
echo "  • Database:        localhost:5433"
echo ""
echo "📝 To view logs: docker-compose -p web_site_dev -f docker-compose.dev.yml logs -f"
echo "🛑 To stop: docker-compose -p web_site_dev -f docker-compose.dev.yml down"
