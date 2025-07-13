"use client"

import { useEffect, useRef, useCallback } from 'react'

interface ReCaptchaProps {
  siteKey: string
  onVerify: (token: string) => void
  onExpired: () => void
  onError: () => void
}

interface ReCaptchaOptions {
  sitekey: string
  callback: (token: string) => void
  'expired-callback': () => void
  'error-callback': () => void
  theme: 'light' | 'dark'
  size: 'normal' | 'compact' | 'invisible'
}

declare global {
  interface Window {
    grecaptcha: {
      render: (container: HTMLElement, options: ReCaptchaOptions) => number
      reset: (widgetId: number) => void
      getResponse: (widgetId: number) => string
    } | undefined
  }
}

export function ReCaptcha({ siteKey, onVerify, onExpired, onError }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)
  const isRenderedRef = useRef(false)

  const handleVerify = useCallback((token: string) => {
    onVerify(token)
  }, [onVerify])

  const handleExpired = useCallback(() => {
    onExpired()
  }, [onExpired])

  const handleError = useCallback(() => {
    onError()
  }, [onError])

  const renderWidget = useCallback(() => {
    if (typeof window !== 'undefined' && window.grecaptcha && containerRef.current && !isRenderedRef.current) {
      try {
        // Clear the container first
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
        }

        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: handleVerify,
          'expired-callback': handleExpired,
          'error-callback': handleError,
          theme: 'light',
          size: 'normal',
        })
        isRenderedRef.current = true
      } catch (error) {
        // Error rendering reCAPTCHA
        onError?.()
      }
    }
  }, [siteKey, handleVerify, handleExpired, handleError, onError])

  useEffect(() => {
    const loadRecaptcha = () => {
      if (typeof window !== 'undefined') {
        if (window.grecaptcha) {
          renderWidget()
        } else {
          // Wait for grecaptcha to be ready
          const checkGrecaptcha = () => {
            if (window.grecaptcha) {
              renderWidget()
            } else {
              setTimeout(checkGrecaptcha, 100)
            }
          }
          checkGrecaptcha()
        }
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadRecaptcha, 100)
    return () => clearTimeout(timer)
  }, [renderWidget])

  const reset = useCallback(() => {
    if (widgetIdRef.current !== null && typeof window !== 'undefined' && window.grecaptcha) {
      try {
        window.grecaptcha.reset(widgetIdRef.current)
      } catch (error) {
        // Error resetting reCAPTCHA
        onError?.()
      }
    }
  }, [onError])

  const getResponse = useCallback(() => {
    if (widgetIdRef.current !== null && typeof window !== 'undefined' && window.grecaptcha) {
      try {
        return window.grecaptcha.getResponse(widgetIdRef.current)
      } catch (error) {
        // Error getting reCAPTCHA response
        onError?.()
      }
    }
    return ''
  }, [onError])

  // Expose methods to parent component
  useEffect(() => {
    if (containerRef.current) {
      ;(containerRef.current as unknown as HTMLDivElement & { reset: () => void; getResponse: () => string }).reset = reset
      ;(containerRef.current as unknown as HTMLDivElement & { reset: () => void; getResponse: () => string }).getResponse = getResponse
    }
  }, [reset, getResponse])

  return <div ref={containerRef} className="flex justify-center" />
} 