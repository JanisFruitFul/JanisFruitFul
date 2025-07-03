# Deployment Configuration Guide

## Environment Variables Setup

### For Vercel (Frontend)

Add these environment variables in your Vercel project settings:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-app-name.onrender.com
```

Replace `your-backend-app-name` with your actual Render app name.

### For Render (Backend)

Add these environment variables in your Render service settings:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://your-vercel-app-name.vercel.app
```

Replace:
- `your_mongodb_connection_string` with your MongoDB Atlas connection string
- `your_jwt_secret_key` with a secure random string
- `your-vercel-app-name` with your actual Vercel app name

## Troubleshooting

### 1. Check API Connection
Visit `/test-backend` in your deployed app to test the backend connection.

### 2. Common Issues

**CORS Errors:**
- Make sure your Render backend URL is correctly set in Vercel's `NEXT_PUBLIC_API_BASE_URL`
- Check that your Vercel domain is included in the CORS configuration

**Database Connection:**
- Verify your MongoDB URI is correct
- Ensure your MongoDB Atlas cluster allows connections from Render's IP addresses

**Environment Variables:**
- Double-check that all environment variables are set correctly
- Remember that Vercel environment variables starting with `NEXT_PUBLIC_` are exposed to the client

### 3. Debug Steps

1. Check the browser console for any error messages
2. Use the test page at `/test-backend` to verify API connectivity
3. Check Render logs for any backend errors
4. Verify that your MongoDB database has customer data

### 4. Testing Locally

To test locally, make sure you have:
- Backend running on `http://localhost:5001`
- Frontend running on `http://localhost:3000`
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:5001` in your `.env.local` file 