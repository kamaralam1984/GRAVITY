'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getToken, clearAuth } from './auth'
import type { AuthUser, UserRole } from './auth'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = getToken()
    const storedUser = getUser()
    if (token && storedUser) {
      setUser(storedUser)
      setIsAuthenticated(true)
    } else {
      setUser(null)
      setIsAuthenticated(false)
    }
  }, [])

  const logout = useCallback((currentRole?: string) => {
    const role = currentRole || user?.role
    clearAuth()
    document.cookie = 'gv_token=; path=/; max-age=0'
    document.cookie = 'gv_user=; path=/; max-age=0'
    setUser(null)
    setIsAuthenticated(false)
    if (role === 'super_admin') router.push('/super-admin/login')
    else if (role === 'admin') router.push('/admin/login')
    else router.push('/login')
  }, [router, user])

  const role: UserRole | null = user ? user.role : null

  return { user, role, isAuthenticated, logout }
}
