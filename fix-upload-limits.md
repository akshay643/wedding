# Upload Size Limit Fix

## Changes Made

### 1. Vercel Configuration (`vercel.json`)
- Added function-specific configurations with 300 second timeout for upload APIs
- This increases the serverless function timeout from default 10s to 5 minutes

### 2. Next.js Configuration (`next.config.js`)
- Added `isrMemoryCacheSize: 0` to free up memory for large uploads
- Added `externalResolver: true` to handle timeouts properly

### 3. API Route Configuration
- Updated both `upload.js` and `upload-multiple.js` with `externalResolver: true`
- This helps handle large file uploads and timeouts better

### 4. Multer Configuration (`utils/multer.js`)
- Set explicit 2GB file size limit
- Added fieldSize limit for better memory management

### 5. Frontend Error Handling (`pages/index.jsx`)
- Added proper HTTP status code checking
- Added specific error messages for 413 (Request Entity Too Large)
- Added 5-minute timeout for fetch requests
- Better error reporting to users

## Deployment Steps

1. Commit all changes:
```bash
git add .
git commit -m "Fix: 413 Request Entity Too Large and improve error handling"
```

2. Deploy to production:
```bash
git push origin main
```

3. If using Vercel CLI:
```bash
vercel --prod
```

## Testing

After deployment, test with:
1. Small files (should work as before)
2. Large files (1-2GB) - should now work or show proper error messages
3. Very large files (>2GB) - should show clear error message

## Common Issues

- **Still getting 413**: Vercel has a hard limit of ~4.5MB for hobby plans. Consider:
  - Upgrading to Vercel Pro plan
  - Using client-side compression before upload
  - Implementing chunk-based upload

- **Timeout errors**: Even with 5-minute timeout, very large files might still timeout on slow connections
