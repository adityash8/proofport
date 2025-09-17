import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define protected routes
  const protectedRoutes = ['/dashboard']
  const authRoutes = ['/auth/callback']

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isAuthRoute = authRoutes.some(route => path.startsWith(route))

  // Allow auth routes to proceed without authentication check
  if (isAuthRoute) {
    return NextResponse.next()
  }

  // For protected routes, check authentication
  if (isProtectedRoute) {
    // Get the session token from cookies
    const token = request.cookies.get('sb-access-token')?.value ||
                  request.cookies.get('supabase-auth-token')?.value

    // If no token is found, redirect to login
    if (!token) {
      const loginUrl = new URL('/', request.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }

    // In a real implementation, you would validate the token here
    // For now, we'll assume the token is valid if it exists
    try {
      // Mock token validation
      if (token && token.length > 10) {
        return NextResponse.next()
      } else {
        throw new Error('Invalid token')
      }
    } catch (error) {
      // Token is invalid, redirect to login
      const loginUrl = new URL('/', request.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  // For all other routes, proceed normally
  return NextResponse.next()
}

export const config = {
  // Match all paths except static files and API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}