import { NextRequest, NextResponse } from 'next/server'
import { rateLimiter, API_LIMITS } from './lib/rate-limiter'

// Rate limiting이 적용될 API 경로 매핑
const API_RATE_LIMITS: Record<string, number> = {
  '/api/auth': API_LIMITS.auth,
  '/api/goals': API_LIMITS.goals,
  '/api/daily-reports': API_LIMITS.reports,
  '/api/stats': API_LIMITS.analytics,
}

function getClientIP(request: NextRequest): string {
  // Vercel, Netlify 등에서 실제 IP 추출
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return request.ip ?? '127.0.0.1'
}

function getAPILimit(pathname: string): number {
  // 정확한 경로 매칭
  for (const [path, limit] of Object.entries(API_RATE_LIMITS)) {
    if (pathname.startsWith(path)) {
      return limit
    }
  }
  
  // 기본 제한
  return API_LIMITS.general
}

export async function middleware(request: NextRequest) {
  // API 경로에만 rate limiting 적용
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = getClientIP(request)
    const limit = getAPILimit(request.nextUrl.pathname)
    
    try {
      const { success, remaining } = await rateLimiter.check(ip, 1)
      
      if (!success) {
        return new NextResponse(
          JSON.stringify({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: 60
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': (Date.now() + 60000).toString(),
            },
          }
        )
      }

      // 성공한 요청에 rate limit 헤더 추가
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', limit.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      response.headers.set('X-RateLimit-Reset', (Date.now() + 60000).toString())
      
      return response
      
    } catch (error) {
      // Rate limiter 오류 시 요청은 통과시키되 로그 남김
      console.error('Rate limiter error:', error)
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // API 경로에만 적용
    '/api/:path*',
    // 정적 파일과 Next.js 내부 경로는 제외
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}