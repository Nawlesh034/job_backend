# Production Deployment Guide

## Environment Variables Required

Set these environment variables in your production hosting platform (Render, Heroku, etc.):

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobapp
SECRET=your-super-secret-jwt-key-here
FRONTEND_URL=https://job-frontend-snowy.vercel.app
```

## Key Production Fixes Applied

### 1. CORS Configuration
- Enhanced CORS to handle multiple origins
- Added wildcard support for subpaths
- Better error logging for blocked origins

### 2. Cookie Settings
- `sameSite: "none"` for production (cross-site cookies)
- `secure: true` for HTTPS
- Proper domain handling

### 3. Authentication Flow
- Fixed JWT token creation with correct user ID
- Enhanced error handling and logging
- Better debugging information

## Testing Production

1. **Check Environment Variables**:
   - Verify all required env vars are set
   - Check logs for "Set" vs "Not set" messages

2. **Test Authentication**:
   - Go to `/auth-test` on your frontend
   - Check browser console for debugging info
   - Verify cookies are being set and sent

3. **Common Production Issues**:
   - **CORS errors**: Check if your frontend URL is in allowed origins
   - **Cookie not set**: Verify HTTPS and sameSite settings
   - **Authentication fails**: Check JWT secret and token expiration

## Debugging Steps

1. Check browser console for CORS errors
2. Verify cookies in DevTools → Application → Cookies
3. Check network tab for authentication requests
4. Review server logs for CORS and authentication errors
