# 🚀 CI/CD Deployment Fix for 413 Request Entity Too Large

## Overview
Your CI/CD pipeline is now configured to automatically fix the 413 upload errors on Google Cloud. Here's what was updated:

## Changes Made

### 1. Updated CI/CD Pipeline (`.github/workflows/deploy.yml`)
```yaml
- name: 🚀 Deploy to GCP VM
  run: |
    ssh -o StrictHostKeyChecking=no ${{ secrets.VM_USER }}@${{ secrets.VM_HOST }} \
      "cd ${{ secrets.APP_DIR }} && git pull origin main && \
       npm install && \
       sudo ./fix-gcp-upload-limits.sh && \
       npm run build && \
       pm2 restart all || pm2 start ecosystem.config.js"
```

**What this does:**
- Pulls latest code from main branch
- Installs dependencies (including new compression library)
- **Applies nginx fixes for large uploads**
- Rebuilds the application
- Restarts the application server

### 2. Updated Nginx Configuration Limits
- **Increased `client_max_body_size` to 2048M (2GB)**
- **Increased timeouts to 300 seconds**
- Applied to both global nginx config and site-specific config

### 3. Added Client-Side Compression Library
- Installed `browser-image-compression` for fallback compression
- Available in `utils/clientCompression.js`

## Deployment Process

### Automatic Deployment (Recommended)
1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Fix: 413 Request Entity Too Large with nginx config"
   git push origin main
   ```

2. **GitHub Actions will automatically:**
   - Deploy to your GCP VM
   - Apply nginx configuration fixes
   - Restart nginx with new limits
   - Restart your Node.js application

### Manual Deployment (If needed)
If you need to apply the fix manually on your server:

```bash
# SSH into your GCP VM
ssh your-user@your-vm-ip

# Navigate to your app directory
cd /path/to/your/wedding/app

# Apply nginx fixes
sudo ./fix-gcp-upload-limits.sh

# Restart nginx
sudo systemctl restart nginx

# Restart your app
pm2 restart all
```

## Testing After Deployment

1. **Test small files (< 10MB)** - Should work as before
2. **Test medium files (10MB - 100MB)** - Should now work
3. **Test large files (100MB - 2GB)** - Should work with new limits
4. **Test very large files (> 2GB)** - Should show proper error message

## Verification Commands

After deployment, you can verify the configuration is applied:

```bash
# Check nginx configuration
sudo nginx -t

# Check if client_max_body_size is set correctly
sudo grep -r "client_max_body_size" /etc/nginx/

# Check nginx status
sudo systemctl status nginx
```

## Expected Results

- ✅ **Files up to 2GB should upload successfully**
- ✅ **Proper error messages for files over 2GB**
- ✅ **No more 413 Request Entity Too Large errors for normal files**
- ✅ **Faster uploads with compression for large images**

## Troubleshooting

If you still see 413 errors after deployment:

1. **Check if nginx restarted properly:**
   ```bash
   sudo systemctl status nginx
   sudo nginx -t
   ```

2. **Verify the configuration was applied:**
   ```bash
   sudo grep "client_max_body_size" /etc/nginx/nginx.conf
   ```

3. **Check your Google Cloud Load Balancer settings** (if using one):
   - Go to Google Cloud Console → Load Balancing
   - Check timeout and request size limits

4. **Check application logs:**
   ```bash
   pm2 logs
   ```

## Notes

- The fix is applied automatically through CI/CD
- Changes are persistent across deployments
- No manual intervention needed for future deployments
- Client-side compression is available as a fallback option
