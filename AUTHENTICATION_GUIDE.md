# Authentication System Guide

This document explains how the authentication system works in the JanisFruitFul application.

## Overview

The application implements a comprehensive authentication system that protects all routes except:
- `/customer/*` - Customer-facing pages
- `/login` - Login page

## Architecture

### 1. Middleware Protection (`middleware.ts`)
- **Edge-level protection**: Runs before any page loads
- **Automatic redirects**: Unauthenticated users are redirected to `/login`
- **Token validation**: Checks for JWT tokens in cookies and headers
- **Root path handling**: Redirects `/` to `/dashboard` if authenticated, otherwise to `/login`

### 2. Client-Side Authentication (`lib/auth.ts`)
- **Token management**: Stores tokens in localStorage and cookies
- **JWT verification**: Validates tokens using the `jose` library
- **User state**: Manages authentication state and user information

### 3. React Context (`contexts/AuthContext.tsx`)
- **Global state**: Provides authentication state across the app
- **Login/logout functions**: Centralized authentication actions
- **Automatic checks**: Validates tokens on app initialization

### 4. Protected Route Component (`components/ProtectedRoute.tsx`)
- **Client-side protection**: Additional layer of protection for React components
- **Loading states**: Shows loading spinner while checking authentication
- **Conditional rendering**: Only renders protected content for authenticated users

### 5. Server-Side Authentication (`lib/server-auth.ts`)
- **API protection**: Protects API routes from unauthorized access
- **Token extraction**: Gets tokens from request headers and cookies
- **User verification**: Validates tokens and returns user information

## How to Use

### For Frontend Pages

1. **Automatic Protection**: All pages are automatically protected by middleware
2. **Using Auth Context**: Access authentication state in components:

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }
  
  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### For API Routes

1. **Import the auth utility**:
```tsx
import { requireAuth } from '@/lib/server-auth'
```

2. **Add authentication check**:
```tsx
export async function GET(request: Request) {
  // Check authentication
  const authResult = await requireAuth(request as any)
  if ('error' in authResult) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Your API logic here
  const { user } = authResult
  // ...
}
```

### For Login

The login page automatically:
1. Validates credentials with the backend
2. Stores the JWT token using the auth context
3. Redirects to the dashboard

### For Logout

Use the logout function from the auth context:
```tsx
const { logout } = useAuth()
logout() // This clears tokens and redirects to login
```

## Token Storage

Tokens are stored in two places for redundancy:
1. **localStorage**: For client-side access
2. **Cookies**: For server-side access and middleware

## Security Features

1. **JWT Verification**: All tokens are cryptographically verified
2. **Expiration Checking**: Tokens are checked for expiration
3. **Automatic Cleanup**: Expired tokens are automatically removed
4. **Secure Storage**: Tokens are stored securely in both localStorage and cookies

## Environment Variables

Make sure to set the `JWT_SECRET` environment variable in production:
```env
JWT_SECRET=your-secure-secret-key-here
```

## Protected Routes

The following routes require authentication:
- `/dashboard/*` - All dashboard pages
- `/api/*` - All API routes (except those explicitly excluded)
- `/` - Root path (redirects to dashboard)

## Public Routes

The following routes are accessible without authentication:
- `/customer/*` - Customer-facing pages
- `/login` - Login page
- Static assets and API routes for public data

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**: Check if the JWT token is valid and not expired
2. **Infinite redirects**: Ensure the login page is not protected
3. **Token not found**: Check if tokens are being stored correctly

### Debug Steps

1. Check browser localStorage for `auth-token`
2. Check browser cookies for `auth-token`
3. Verify JWT token format and expiration
4. Check server logs for authentication errors

## Best Practices

1. **Always use the auth context** instead of directly accessing localStorage
2. **Handle loading states** when checking authentication
3. **Provide clear error messages** for authentication failures
4. **Use HTTPS in production** for secure token transmission
5. **Regularly rotate JWT secrets** in production environments 