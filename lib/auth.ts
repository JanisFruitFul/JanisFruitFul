// Types for authentication
export interface AuthUser {
  id: string
  email: string
  role: string
}

export interface AuthToken {
  user: AuthUser
  exp: number
}

import jwt from 'jsonwebtoken'
import { jwtDecode } from 'jwt-decode'

// JWT secret - should match the backend
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET && typeof window === 'undefined') {
  throw new Error('JWT_SECRET environment variable is required')
}

// Token management
export const authUtils = {
  // Store token in both localStorage and cookies for redundancy
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token)
      // Set cookie with httpOnly: false so client can access it
      document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Strict`
    }
  },

  // Get token from localStorage or cookies
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      const localToken = localStorage.getItem('auth-token')
      const cookieToken = document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1]
      const token = localToken || cookieToken || null
      
      return token
    }
    return null
  },

  // Remove token from both localStorage and cookies
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token')
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    }
  },

  // Verify token and return user data
  verifyToken: async (token: string): Promise<AuthUser | null> => {
    if (typeof window !== 'undefined') {
      // On client: decode only, do not verify
      try {
        const decoded = jwtDecode<AuthToken>(token)
        // Check if token is expired
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          return null
        }
        return decoded.user
      } catch {
        return null
      }
    } else {
      // On server: verify with secret
      if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is missing on the server')
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthToken
        // Check if token is expired
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          return null
        }
        return decoded.user
      } catch {
        return null
      }
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    const token = authUtils.getToken()
    if (!token) return false
    
    const user = await authUtils.verifyToken(token)
    return user !== null
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthUser | null> => {
    const token = authUtils.getToken()
    if (!token) return null
    
    return await authUtils.verifyToken(token)
  }
}

// API helper for authenticated requests
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = authUtils.getToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(url, {
    ...options,
    headers,
  })
} 