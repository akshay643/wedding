# 🔄 PWA Cache Clear Guide

## The Problem
The error `bad-precaching-response: bad-precaching-response` occurs when the PWA service worker tries to cache build files that no longer exist after a new deployment.

## Automatic Fix (Recommended)
The deployment now automatically:
- ✅ Clears old service worker files
- ✅ Excludes problematic build manifests from caching
- ✅ Shows update notifications to users
- ✅ Handles cache updates gracefully

## Manual Fix (If Needed)

### For Users (Browser Cache)
1. **Hard Refresh:**
   - `Ctrl+Shift+R` (Windows/Linux)
   - `Cmd+Shift+R` (Mac)

2. **Clear Browser Data:**
   - Open DevTools (F12)
   - Go to Application > Storage
   - Click "Clear storage"

3. **Uninstall and Reinstall PWA:**
   - Chrome: Settings > Apps > Wedding App > Uninstall
   - Revisit site and install again

### For Developers (Server Cache)

1. **Clear Service Worker Files:**
   ```bash
   rm -rf public/sw.js
   rm -rf public/workbox-*.js
   ```

2. **Clear Next.js Build:**
   ```bash
   rm -rf .next
   npm run build
   ```

3. **Run PWA Reset Script:**
   ```bash
   ./reset-pwa.sh
   ```

## Prevention
The updated configuration now:
- Excludes build manifests from precaching
- Uses better caching strategies
- Provides automatic update handling
- Clears old files on deployment

## Testing
After fixing:
1. Open site in incognito mode
2. Check DevTools Console for errors
3. Verify PWA installation works
4. Test update notifications

The automatic fixes should prevent this issue from recurring!
