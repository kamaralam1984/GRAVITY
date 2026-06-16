// Token/user management utilities for GRAVITY auth system

export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin'

export interface AuthUser {
  id: number
  name: string
  email: string
  phone?: string
  role: UserRole
  family_role?: 'parent' | 'child' | 'none'
  is_active: boolean
}

const TOKEN_KEY = 'gv_token'
const USER_KEY = 'gv_user'

export function setAuth(token: string, user: AuthUser): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function getRole(): UserRole | null {
  const user = getUser()
  return user ? user.role : null
}

export function clearAuth(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function updateUser(updates: Partial<AuthUser>): void {
  const user = getUser()
  if (!user) return
  localStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...updates }))
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getUser()
}

export function getRoleRedirect(role: UserRole): string {
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
