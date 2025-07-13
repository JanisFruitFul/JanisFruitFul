import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { AuthUser } from './auth'

// JWT secret - should match the backend
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export interface AuthToken {
  user: AuthUser
  exp: number
}

// Extract token from request headers or cookies
export function getTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check cookies
  const token = request.cookies.get('auth-token')?.value
  return token || null
}

// Verify token and return user data
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthToken
    
    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return null
    }
    
    return decoded.user
  } catch {
    // Token verification failed
    return null
  }
}

// Get authenticated user from request
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthUser | null> {
  const token = getTokenFromRequest(request)
  if (!token) {
    return null
  }
  
  return await verifyToken(token)
}

// Middleware function for API routes
export async function requireAuth(request: NextRequest): Promise<{ user: AuthUser } | { error: string }> {
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    return { error: 'Unauthorized' }
  }
  
  return { user }
} 