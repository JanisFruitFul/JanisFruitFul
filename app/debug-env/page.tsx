"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function DebugEnvPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({})
  const [recaptchaStatus, setRecaptchaStatus] = useState<{
    loaded: boolean
    siteKey: string
    secretKey: string
  }>({
    loaded: false,
    siteKey: '',
    secretKey: ''
  })

  useEffect(() => {
    // Check reCAPTCHA status
    const checkRecaptcha = () => {
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LdmaIErAAAAAMmVu3WBz-OTBkfMvfH9Syplu3Sm"
      const secretKey = process.env.RECAPTCHA_SECRET_KEY || "6LdmaIErAAAAAFczCJQlafDRyfIOAnfWoi_fd7Ov"
      
      setRecaptchaStatus({
        loaded: typeof window !== 'undefined' && !!window.grecaptcha,
        siteKey,
        secretKey
      })
    }

    checkRecaptcha()
    const interval = setInterval(checkRecaptcha, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Get environment variables (only public ones)
    const vars: Record<string, string> = {}
    
    // Check for reCAPTCHA keys
    if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      vars.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    }
    
    // Add other public env vars as needed
    if (process.env.NEXT_PUBLIC_API_URL) {
      vars.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL
    }

    setEnvVars(vars)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-emerald-600" />
              reCAPTCHA Debug Information
            </CardTitle>
            <CardDescription>
              Check the status of reCAPTCHA integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">reCAPTCHA Status</h3>
                <div className="flex items-center space-x-2">
                  {recaptchaStatus.loaded ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    {recaptchaStatus.loaded ? "Loaded" : "Not Loaded"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Site Key</h3>
                <Badge variant="outline" className="font-mono text-xs">
                  {recaptchaStatus.siteKey ? "Set" : "Not Set"}
                </Badge>
                {recaptchaStatus.siteKey && (
                  <p className="text-xs text-gray-600 truncate">
                    {recaptchaStatus.siteKey.substring(0, 20)}...
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Environment Variables</h3>
              <div className="space-y-2">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                    <span className="text-sm font-mono">{key}</span>
                    <Badge variant="outline" className="text-xs">
                      {value ? "Set" : "Not Set"}
                    </Badge>
                  </div>
                ))}
                {Object.keys(envVars).length === 0 && (
                  <p className="text-sm text-gray-500">No public environment variables found</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Troubleshooting</h3>
              <div className="space-y-2 text-sm">
                {!recaptchaStatus.loaded && (
                  <div className="flex items-start space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">reCAPTCHA not loaded</p>
                      <p className="text-yellow-700">Check if the Google reCAPTCHA script is loading properly</p>
                    </div>
                  </div>
                )}
                
                {!recaptchaStatus.siteKey && (
                  <div className="flex items-start space-x-2 p-2 bg-red-50 border border-red-200 rounded">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Site key not configured</p>
                      <p className="text-red-700">Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY environment variable</p>
                    </div>
                  </div>
                )}

                {recaptchaStatus.loaded && recaptchaStatus.siteKey && (
                  <div className="flex items-start space-x-2 p-2 bg-green-50 border border-green-200 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">reCAPTCHA ready</p>
                      <p className="text-green-700">The reCAPTCHA integration should work properly</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 