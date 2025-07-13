"use client"

import type React from "react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/config"
import { useAuth } from "@/contexts/AuthContext"
import { Eye, EyeOff, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { ReCaptcha } from "@/components/ReCaptcha"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState("")
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [captchaError, setCaptchaError] = useState(false)
  const [captchaLoading, setCaptchaLoading] = useState(true)
  const recaptchaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LdmaIErAAAAAMmVu3WBz-OTBkfMvfH9Syplu3Sm"

  // Check if reCAPTCHA is loaded
  useEffect(() => {
    const checkRecaptcha = () => {
      if (typeof window !== 'undefined' && window.grecaptcha) {
        setCaptchaLoading(false)
      } else {
        setTimeout(checkRecaptcha, 100)
      }
    }
    checkRecaptcha()
  }, [])

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token)
    setCaptchaVerified(true)
    setCaptchaError(false)
    toast({
      title: "Security Verified",
      description: "reCAPTCHA verification completed successfully",
    })
  }

  const handleCaptchaExpired = () => {
    setCaptchaToken("")
    setCaptchaVerified(false)
    setCaptchaError(false)
    toast({
      title: "Verification Expired",
      description: "Please complete the reCAPTCHA verification again",
      variant: "destructive",
    })
  }

  const handleCaptchaError = () => {
    setCaptchaToken("")
    setCaptchaVerified(false)
    setCaptchaError(true)
    // Only show error toast once to avoid spam
    if (!captchaError) {
      toast({
        title: "Verification Error",
        description: "Please refresh the page and try again",
        variant: "destructive",
      })
    }
  }

  const resetCaptcha = () => {
    const recaptchaElement = recaptchaRef.current as unknown as HTMLDivElement & { reset?: () => void }
    if (recaptchaElement && recaptchaElement.reset) {
      try {
        recaptchaElement.reset()
      } catch (error) {
        console.error('Error resetting reCAPTCHA:', error)
      }
    }
    setCaptchaToken("")
    setCaptchaVerified(false)
    setCaptchaError(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!captchaVerified) {
      toast({
        title: "Security Verification Required",
        description: "Please complete the reCAPTCHA verification to continue",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const apiUrl = getApiUrl('api/admin/login');
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          password, 
          captchaToken 
        }),
      })

      if (!response.ok) {
        // Handle different HTTP status codes
        if (response.status === 0 || response.status >= 500) {
          throw new Error(`Backend server error (${response.status}). Please check if your backend is running.`);
        } else if (response.status === 404) {
          throw new Error('Backend endpoint not found. Please check your API configuration.');
        } else if (response.status === 403) {
          throw new Error('CORS error. Please check your backend CORS configuration.');
        }
      }

      const data = await response.json()

      if (response.ok && data.success) {
        // Use the auth context to handle login
        if (data.token) {
          login(data.token)
          toast({
            title: "Login successful",
            description: "Welcome to the admin dashboard!",
          })
          router.push("/dashboard")
        } else {
          toast({
            title: "Login failed",
            description: "No authentication token received",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        })
        // Reset captcha on failed login
        resetCaptcha()
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      let errorMessage = "Something went wrong. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = "Cannot connect to backend server. Please check your internet connection and try again.";
        } else if (error.message.includes('Backend server error')) {
          errorMessage = error.message;
        } else if (error.message.includes('CORS error')) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      })
      // Reset captcha on error
      resetCaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Shield className="h-8 w-8 text-emerald-600 mr-2" />
            <CardTitle className="text-2xl font-bold text-gray-800">Admin Login</CardTitle>
          </div>
          <CardDescription>Sign in to access the drinks admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@drinks.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {/* reCAPTCHA */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-emerald-600" />
                Security Verification
              </Label>
              <div ref={recaptchaRef} className="flex justify-center min-h-[78px]">
                {captchaLoading ? (
                  <p>Loading reCAPTCHA...</p>
                ) : (
                  <ReCaptcha
                    key="login-captcha"
                    siteKey={RECAPTCHA_SITE_KEY}
                    onVerify={handleCaptchaVerify}
                    onExpired={handleCaptchaExpired}
                    onError={handleCaptchaError}
                  />
                )}
              </div>
              {captchaVerified && (
                <p className="text-sm text-green-600 flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Verification completed
                </p>
              )}
              {captchaError && (
                <div className="space-y-2">
                  <p className="text-sm text-red-600 flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    Verification failed - please refresh the page
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCaptchaError(false)
                      setCaptchaLoading(true)
                      setTimeout(() => setCaptchaLoading(false), 100)
                    }}
                    className="w-full"
                  >
                    Retry reCAPTCHA
                  </Button>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700" 
              disabled={isLoading || !captchaVerified}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
