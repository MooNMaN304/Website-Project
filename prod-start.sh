#!/bin/bash

# Production environment startup script
echo "🚀 Starting production environment with full rebuild..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found!"
    echo "Please create .env.production file with your production configuration."
    exit 1
fi

# Stop and remove existing containers, networks, volumes, and custom images only
echo "🧹 Cleaning up existing docker-compose resources..."
docker-compose -p web_site_prod -f docker-compose.yml down --volumes --remove-orphans --rmi local

# Rebuild and start production environment
echo "🔨 Rebuilding and starting production environment..."
docker-compose -p web_site_prod -f docker-compose.yml up --build --force-recreate

echo "✅ Production environment started!"
echo ""
echo "📊 Services available at:"
echo "  • Application:     http://localhost:80"
echo "  • Database:        localhost:5432"
echo ""
echo "📝 To view logs: docker-compose -p web_site_prod -f docker-compose.yml logs -f"
echo "🛑 To stop: docker-compose -p web_site_prod -f docker-compose.yml down"
