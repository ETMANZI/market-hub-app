#!/bin/bash
# build.sh - Heroku build script for Django + React

echo "🚀 Starting Heroku build process..."

# Build React frontend
echo "📦 Building React frontend..."
cd frontend
npm install
npm run build
cd ..

# Copy React build to Django's static directory
echo "📁 Copying React build to Django static..."
mkdir -p backend/static/frontend
cp -r frontend/dist/* backend/static/frontend/

# Collect Django static files
echo "📊 Collecting Django static files..."
cd backend
python manage.py collectstatic --noinput
cd ..

echo "✅ Build complete!"