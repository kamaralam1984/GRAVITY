import { NextRequest, NextResponse } from 'next/server'
import type { UserRole } from './lib/auth'

type FamilyRole = 'parent' | 'child' | 'none'

const PROTECTED_ROUTES: Array<{ prefix: string; roles: UserRole[]; family_roles?: FamilyRole[] }> = [
  { prefix: '/super-admin', roles: ['super_admin'] },
  { prefix: '/admin', roles: ['admin', 'super_admin'] },
  { prefix: '/moderator', roles: ['moderator', 'admin', 'super_admin'] },
  { prefix: '/dashboard', roles: ['user', 'moderator', 'admin', 'super_admin'] },
  { prefix: '/parent', roles: ['user'], family_roles: ['parent', 'none'] },
  { prefix: '/child', roles: ['user'], family_roles: ['child'] },
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

function parseUserFromCookie(req: NextRequest): { role: UserRole; family_role?: FamilyRole } | null {
  const userCookie = req.cookies.get('gv_user')?.value
  if (!userCookie) return null
  try {
    const decoded = decodeURIComponent(userCookie)
    const user = JSON.parse(decoded) as { role: UserRole; family_role?: FamilyRole }
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

  // Skip auth check for dedicated login pages
  if (pathname === '/super-admin/login' || pathname === '/admin/login') {
    return NextResponse.next()
  }

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

  // System role check
  if (!(matched.roles as string[]).includes(user.role)) {
    const correctPath = getRoleRedirect(user.role)
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = correctPath
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  // Family role check (only for /parent and /child routes)
  if (matched.family_roles) {
    const userFamilyRole: FamilyRole = user.family_role ?? 'none'
    if (!matched.family_roles.includes(userFamilyRole)) {
      // Child trying to access /parent → send to /child
      // Parent trying to access /child → send to /parent (or /dashboard)
      const correctPath = userFamilyRole === 'child' ? '/child' : '/dashboard'
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = correctPath
      redirectUrl.search = ''
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/moderator/:path*',
    '/admin/:path*',
    '/super-admin/:path*',
    '/parent/:path*',
    '/child/:path*',
  ],
}
