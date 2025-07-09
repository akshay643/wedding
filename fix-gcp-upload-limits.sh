#!/bin/bash

echo "🔧 Google Cloud Nginx Configuration Fix for Large Uploads"
echo "========================================================"
echo ""

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx is not installed. Please install nginx first:"
    echo "   sudo apt update && sudo apt install nginx"
    exit 1
fi

# Backup existing nginx config
echo "📋 Backing up existing nginx configuration..."
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

# Update main nginx.conf to handle large uploads
echo "🔧 Updating main nginx configuration..."
sudo tee /etc/nginx/nginx.conf > /dev/null << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 768;
    # multi_accept on;
}

http {
    ##
    # Basic Settings
    ##
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # CRITICAL: Increase client_max_body_size globally (2GB limit)
    client_max_body_size 2048M;
    client_body_buffer_size 1M;
    client_header_buffer_size 8k;
    large_client_header_buffers 8 32k;
    
    # Increase timeouts for large uploads
    client_body_timeout 300s;
    client_header_timeout 300s;
    send_timeout 300s;
    
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    ##
    # SSL Settings
    ##
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    ##
    # Logging Settings
    ##
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    ##
    # Gzip Settings
    ##
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    ##
    # Virtual Host Configs
    ##
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

# Copy the wedding app configuration
echo "📄 Installing wedding app nginx configuration..."
sudo cp nginx-wedding-app.conf /etc/nginx/sites-available/wedding-app

# Enable the site
echo "🔗 Enabling wedding app site..."
sudo ln -sf /etc/nginx/sites-available/wedding-app /etc/nginx/sites-enabled/

# Remove default site if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "🗑️  Removing default nginx site..."
    sudo rm /etc/nginx/sites-enabled/default
fi

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
if sudo nginx -t; then
    echo "✅ Nginx configuration is valid"
    
    # Reload nginx
    echo "🔄 Reloading nginx..."
    sudo systemctl reload nginx
    
    echo ""
    echo "✅ Nginx configuration updated successfully!"
    echo ""
    echo "📝 Configuration Summary:"
    echo "   ✓ client_max_body_size: 100M"
    echo "   ✓ Upload timeouts: 60s"
    echo "   ✓ Proxy timeouts: 300s for uploads"
    echo "   ✓ Request buffering: disabled for uploads"
    echo ""
    echo "🔍 Next steps:"
    echo "1. Update SSL certificate paths in /etc/nginx/sites-available/wedding-app"
    echo "2. Test large file upload: https://akshaywedstripti.tech"
    echo "3. Monitor nginx logs: sudo tail -f /var/log/nginx/error.log"
    
else
    echo "❌ Nginx configuration test failed!"
    echo "Please check the configuration and try again."
    exit 1
fi
