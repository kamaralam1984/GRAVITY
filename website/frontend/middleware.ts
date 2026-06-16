import { NextRequest, NextResponse } from 'next/server'
import type { UserRole } from './lib/auth'

const PROTECTED_ROUTES: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: '/super-admin', roles: ['super_admin'] },
  { prefix: '/admin', roles: ['admin', 'super_admin'] },
  { prefix: '/moderator', roles: ['moderator', 'admin', 'super_admin'] },
  { prefix: '/dashboard', roles: ['user', 'moderator', 'admin', 'super_admin'] },
]

const KNOWN_ROLES: UserRole[] = ['user', 'moderator', 'admin', 'super_admin']

function getRoleRedirect(role: UserRole): string {
  switch (role) {
    case 'user':      return '/dashboard'
    case 'moderator': return '/moderator'
    case 'admin':     return '/admin'
    case 'super_admin': return '/super-admin'
    default:          return '/login'
  }
}

function parseUserFromCookie(req: NextRequest): { role: UserRole } | null {
  const userCookie = req.cookies.get('gv_user')?.value
  if (!userCookie) return null
  try {
    const decoded = decodeURIComponent(userCookie)
    const user = JSON.parse(decoded) as { role: UserRole }
    if (!user.role || !KNOWN_ROLES.includes(user.role)) return null
    return user
  } catch {
    return null
  }
}

function clearAuthCookies(res: NextResponse) {
  res.cookies.delete('gv_token')
  res.cookies.delete('gv_user')
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const matched = PROTECTED_ROUTES.find((r) => pathname.startsWith(r.prefix))
  if (!matched) return NextResponse.next()

  const token = req.cookies.get('gv_token')?.value

  // Pick the right login page based on the route being accessed
  function getLoginPath(prefix: string): string {
    if (prefix === '/super-admin') return '/super-admin/login'
    if (prefix === '/admin') return '/admin/login'
    return '/login'
  }
  const loginPath = getLoginPath(matched.prefix)

  // No token → redirect to the correct login page
  if (!token) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = loginPath
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const user = parseUserFromCookie(req)

  // Token present but user cookie missing or invalid → clear cookies + redirect to correct login
  if (!user) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = loginPath
    loginUrl.search = ''
    const res = NextResponse.redirect(loginUrl)
    clearAuthCookies(res)
    return res
  }

  // Role has access → allow
  if ((matched.roles as string[]).includes(user.role)) {
    return NextResponse.next()
  }

  // Wrong role → send to that role's correct dashboard (never loops — all known roles map to distinct paths)
  const correctPath = getRoleRedirect(user.role)
  const redirectUrl = req.nextUrl.clone()
  redirectUrl.pathname = correctPath
  redirectUrl.search = ''
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/moderator/:path*',
    '/admin/((?!login).*)',
    '/super-admin/((?!login).*)',
  ],
}
