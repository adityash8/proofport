'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          setError('Authentication failed. Please try again.')
          return
        }

        if (data.session) {
          // User is authenticated, redirect to dashboard
          router.push('/dashboard')
        } else {
          // No session found, redirect to home
          router.push('/')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        setError('An unexpected error occurred. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    // Check for auth code in URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const authCode = urlParams.get('code')
    const errorCode = urlParams.get('error')

    if (errorCode) {
      setError('Authentication was cancelled or failed.')
      setLoading(false)
      return
    }

    if (authCode) {
      // Exchange auth code for session
      supabase.auth.exchangeCodeForSession(authCode).then(({ data, error }) => {
        if (error) {
          console.error('Code exchange error:', error)
          setError('Failed to complete authentication.')
        } else if (data.session) {
          router.push('/dashboard')
        } else {
          router.push('/')
        }
        setLoading(false)
      })
    } else {
      // No auth code, check existing session
      handleAuthCallback()
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Completing Authentication...</h2>
          <p className="text-gray-400">Please wait while we sign you in.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go to Homepage
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-green-500 text-5xl mb-4">✅</div>
        <h2 className="text-xl font-semibold text-white mb-2">Authentication Successful</h2>
        <p className="text-gray-400">Redirecting you to the dashboard...</p>
      </div>
    </div>
  )
}