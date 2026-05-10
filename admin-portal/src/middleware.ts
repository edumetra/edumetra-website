import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://www.edumetraglobal.com',
  'https://edumetraglobal.com',
  'https://colleges.edumetraglobal.com',
  'https://www.edumetra.in',
  'https://edumetra.in',
  'https://colleges.edumetra.in',
  // Allow all vercel preview deployments
  'https://edumetra-website.vercel.app',
]

function getCorsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin')

  // ── API Routes: Handle CORS before anything else ──────────────────────────
  if (pathname.startsWith('/api/')) {
    // Short-circuit OPTIONS preflight — must not redirect
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: getCorsHeaders(origin),
      })
    }

    // For actual API requests, add CORS headers to the response
    const response = NextResponse.next()
    const corsHeaders = getCorsHeaders(origin)
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }

  // ── Non-API Routes: Run normal Supabase session update ────────────────────
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
