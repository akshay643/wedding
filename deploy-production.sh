#!/bin/bash

echo "🚀 Production PWA Deployment Script"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: No package.json found. Run this script from the project root."
    exit 1
fi

echo "� Pulling latest code from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed! Please check your repository status."
    exit 1
fi

echo "�📦 Building production-ready PWA..."
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds and PWA cache..."
rm -rf .next
rm -rf out
rm -rf public/sw.js
rm -rf public/workbox-*.js

# Install dependencies
echo "📋 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""

# Fix nginx configuration for large uploads (Google Cloud specific)
echo "🔧 Applying Google Cloud nginx fixes for large uploads..."
if [ -f "fix-gcp-upload-limits.sh" ]; then
    sudo ./fix-gcp-upload-limits.sh
    if [ $? -eq 0 ]; then
        echo "✅ Nginx configuration updated for large uploads"
    else
        echo "⚠️  Warning: Could not update nginx configuration automatically"
        echo "   Please run: sudo ./fix-gcp-upload-limits.sh manually"
    fi
else
    echo "⚠️  Warning: fix-gcp-upload-limits.sh not found"
fi
echo ""

# Restart the application
echo "🔄 Restarting application..."

# Check if PM2 is being used
if command -v pm2 &> /dev/null; then
    echo "📱 Using PM2 to restart application..."
    pm2 restart all 2>/dev/null || pm2 start npm --name "wedding-app" -- start
    if [ $? -eq 0 ]; then
        echo "✅ Application restarted successfully with PM2"
        pm2 status
    else
        echo "⚠️  Warning: PM2 restart failed, trying manual start..."
        pm2 start npm --name "wedding-app" -- start
    fi
else
    echo "📱 PM2 not found, checking for running process..."
    # Kill any existing Node.js process on port 3000
    PID=$(lsof -ti:3000)
    if [ ! -z "$PID" ]; then
        echo "🔴 Stopping existing process on port 3000 (PID: $PID)"
        kill -9 $PID
        sleep 2
    fi
    
    echo "� Starting application in background..."
    nohup npm start > /var/log/wedding-app.log 2>&1 &
    
    sleep 3
    
    # Check if the application started successfully
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Application started successfully on port 3000"
    else
        echo "❌ Failed to start application. Check logs: tail -f /var/log/wedding-app.log"
        exit 1
    fi
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo "====================================="
echo ""
echo "🌐 Your application is running at:"
echo "   - Local: http://localhost:3000"
echo "   - Production: https://akshaywedstripti.tech"
echo ""
echo "📊 Check status:"
if command -v pm2 &> /dev/null; then
    echo "   pm2 status"
    echo "   pm2 logs"
else
    echo "   curl http://localhost:3000"
    echo "   tail -f /var/log/wedding-app.log"
fi
echo ""
echo "✅ Upload limits fixed - files up to 2GB should now work!"
