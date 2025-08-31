#!/bin/bash

# Script to fill the database with test data using Docker Compose

echo "🚀 Starting database fill process..."

# Check if development environment is running
if ! docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "⚠️  Development environment is not running. Starting it first..."
    docker-compose -f docker-compose.dev.yml up -d
    echo "⏳ Waiting for services to be ready..."
    sleep 15
else
    echo "✅ Development environment is already running"
fi

# Run the test to fill database with data inside the app container
echo "📊 Running test to fill database with test data..."
docker-compose -f docker-compose.dev.yml exec app python -m pytest tests/units/test_fill_db_with_data.py::test_fill_database_with_test_data -v

echo "✅ Database filling process completed!"
echo "💡 Your development environment is ready at:"
echo "   - Frontend: http://localhost:3001"
echo "   - API: http://localhost:8001/docs"
echo "   - Traefik Dashboard: http://localhost:8081"
