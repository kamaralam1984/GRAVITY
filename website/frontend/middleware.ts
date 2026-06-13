import { NextRequest, NextResponse } from 'next/server'
import type { UserRole } from './lib/auth'

// Route access rules: maps path prefix → allowed roles
const PROTECTED_ROUTES: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: '/super-admin', roles: ['super_admin'] },
  { prefix: '/admin', roles: ['admin', 'super_admin'] },
  { prefix: '/moderator', roles: ['moderator', 'admin', 'super_admin'] },
  { prefix: '/dashboard', roles: ['user', 'moderator', 'admin', 'super_admin'] },
]

function getRoleRedirect(role: UserRole): string {
  switch (role) {
    case 'user':
      return '/dashboard'
    case 'moderator':
      return '/moderator'
    case 'admin':
      return '/admin'
    case 'super_admin':
      return '/super-admin'
    default:
      return '/dashboard'
  }
}

function parseUserFromCookie(req: NextRequest): { role: UserRole } | null {
  // Read the gv_user cookie which stores the JSON-encoded user object
  const userCookie = req.cookies.get('gv_user')?.value
  if (!userCookie) return null
  try {
    const decoded = decodeURIComponent(userCookie)
    const user = JSON.parse(decoded) as { role: UserRole }
    if (!user.role) return null
    return user
  } catch {
    return null
  }
}

function isLoggedIn(req: NextRequest): boolean {
  const token = req.cookies.get('gv_token')?.value
  return !!token
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Find the first matching protected route
  const matched = PROTECTED_ROUTES.find((r) => pathname.startsWith(r.prefix))

  // Not a protected route — let through
  if (!matched) return NextResponse.next()

  // Not authenticated → redirect to login
  if (!isLoggedIn(req)) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated — check role
  const user = parseUserFromCookie(req)

  if (!user) {
    // Token exists but no user cookie — redirect to login to re-authenticate
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Role has access → allow
  if ((matched.roles as string[]).includes(user.role)) {
    return NextResponse.next()
  }

  // Wrong role → redirect to correct dashboard
  const correctPath = getRoleRedirect(user.role)
  const redirectUrl = req.nextUrl.clone()
  redirectUrl.pathname = correctPath
  redirectUrl.search = ''
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: ['/dashboard/:path*', '/moderator/:path*', '/admin/:path*', '/super-admin/:path*'],
}
