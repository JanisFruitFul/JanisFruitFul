"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/config"
import { ReCaptcha } from "@/components/ReCaptcha"
import { Shield } from "lucide-react"

export default function TestBackendPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState("")
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const { toast } = useToast()

  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LdmaIErAAAAAMmVu3WBz-OTBkfMvfH9Syplu3Sm"

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token)
    setCaptchaVerified(true)
    toast({
      title: "reCAPTCHA Verified",
      description: "Security verification completed",
    })
  }

  const handleCaptchaExpired = () => {
    setCaptchaToken("")
    setCaptchaVerified(false)
  }

  const handleCaptchaError = () => {
    setCaptchaToken("")
    setCaptchaVerified(false)
    toast({
      title: "reCAPTCHA Error",
      description: "Please try again",
      variant: "destructive",
    })
  }

  const testRecaptcha = async () => {
    if (!captchaVerified) {
      toast({
        title: "Verification Required",
        description: "Please complete the reCAPTCHA verification first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(getApiUrl('api/admin/login'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: "test@example.com", 
          password: "testpassword", 
          captchaToken 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "reCAPTCHA Test Successful",
          description: "The reCAPTCHA verification is working correctly",
        })
      } else {
        toast({
          title: "reCAPTCHA Test Failed",
          description: data.message || "Verification failed",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Test Error",
        description: "Failed to test reCAPTCHA verification",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-emerald-600" />
              reCAPTCHA Test
            </CardTitle>
            <CardDescription>
              Test the Google reCAPTCHA v2 integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Security Verification</label>
              <div className="flex justify-center">
                <ReCaptcha
                  siteKey={RECAPTCHA_SITE_KEY}
                  onVerify={handleCaptchaVerify}
                  onExpired={handleCaptchaExpired}
                  onError={handleCaptchaError}
                />
              </div>
              {captchaVerified && (
                <p className="text-sm text-green-600 flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Verification completed
                </p>
              )}
            </div>

            <Button 
              onClick={testRecaptcha}
              disabled={isLoading || !captchaVerified}
              className="w-full"
            >
              {isLoading ? "Testing..." : "Test reCAPTCHA Verification"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 