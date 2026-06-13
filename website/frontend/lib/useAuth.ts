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

  const logout = useCallback(() => {
    // Clear localStorage
    clearAuth()
    // Clear cookies
    document.cookie = 'gv_token=; path=/; max-age=0'
    document.cookie = 'gv_user=; path=/; max-age=0'
    setUser(null)
    setIsAuthenticated(false)
    router.push('/login')
  }, [router])

  const role: UserRole | null = user ? user.role : null

  return { user, role, isAuthenticated, logout }
}
