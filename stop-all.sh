#!/bin/bash

echo "🛑 Stopping all environments..."

# Stop development environment
echo "Stopping development environment..."
docker-compose -p web_site_dev -f docker-compose.dev.yml down

# Stop production environment
echo "Stopping production environment..."
docker-compose -p web_site_prod -f docker-compose.yml down

echo "✅ All environments stopped!"
