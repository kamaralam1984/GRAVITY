'use client'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface User {
  id: number
  name: string
  email: string
  phone: string | null
  is_active: boolean
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null)

// ─────────────────────────────────────────────────────────────
// Storage keys — must match lib/auth.ts (gv_token / gv_user)
// ─────────────────────────────────────────────────────────────
const TOKEN_KEY = 'gv_token'
const USER_KEY = 'gv_user'

// ─────────────────────────────────────────────────────────────
// AuthProvider
// ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ── Fetch current user from /auth/me ────────────────────────
  const fetchMe = useCallback(async (authToken: string): Promise<User | null> => {
    try {
      const res = await fetch('/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        // Abort after 8 seconds
        signal: AbortSignal.timeout(8000),
      })

      if (res.status === 401 || res.status === 403) {
        // Token expired or invalid — clear everything
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
        }
        return null
      }

      if (!res.ok) {
        // Server error — keep token but don't crash
        const cached = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null
        if (cached) {
          try { return JSON.parse(cached) as User } catch { return null }
        }
        return null
      }

      const data: User = await res.json()

      // Cache user in localStorage for instant subsequent loads
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(data))
      }

      return data
    } catch (err: unknown) {
      // Network error — try to use cached user
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(USER_KEY)
        if (cached) {
          try { return JSON.parse(cached) as User } catch { return null }
        }
      }
      return null
    }
  }, [])

  // ── Bootstrap on mount ──────────────────────────────────────
  useEffect(() => {
    async function bootstrap() {
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      const storedToken = localStorage.getItem(TOKEN_KEY)

      if (!storedToken) {
        setIsLoading(false)
        return
      }

      // Optimistically show cached user while verifying
      const cachedUser = localStorage.getItem(USER_KEY)
      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser) as User
          setUser(parsed)
          setToken(storedToken)
        } catch { /* ignore */ }
      }

      // Validate token with server
      const freshUser = await fetchMe(storedToken)

      if (freshUser) {
        setUser(freshUser)
        setToken(storedToken)
      } else {
        // Token invalid
        setUser(null)
        setToken(null)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }

      setIsLoading(false)
    }

    bootstrap()
  }, [fetchMe])

  // ── login ────────────────────────────────────────────────────
  const login = useCallback((newToken: string, newUser: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, newToken)
      localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    }
    setToken(newToken)
    setUser(newUser)
  }, [])

  // ── logout ───────────────────────────────────────────────────
  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem('gravity_device_token')
      // Clear any session storage too
      try { sessionStorage.clear() } catch { /* ignore */ }
    }
    setToken(null)
    setUser(null)
    router.push('/login')
  }, [router])

  // ── refreshUser ──────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : token
    if (!currentToken) return

    const freshUser = await fetchMe(currentToken)
    if (freshUser) {
      setUser(freshUser)
    } else {
      // Token no longer valid
      logout()
    }
  }, [token, fetchMe, logout])

  // ── Context value ────────────────────────────────────────────
  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─────────────────────────────────────────────────────────────
// useAuth hook
// ─────────────────────────────────────────────────────────────
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>. Wrap your layout or page with <AuthProvider>.')
  }
  return ctx
}

// ─────────────────────────────────────────────────────────────
// withAuth HOC — wraps a component and redirects if unauthenticated
// ─────────────────────────────────────────────────────────────
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  const WithAuthComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`)
      }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0B0D13',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            {/* Animated KVL TRACK logo while loading */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '2px solid transparent',
                borderTopColor: '#D4A853',
                borderRightColor: 'rgba(212,168,83,0.3)',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <p
              style={{
                color: 'rgba(212,168,83,0.6)',
                fontSize: 12,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                margin: 0,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Authenticating
            </p>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) return null

    return <WrappedComponent {...props} />
  }

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`
  return WithAuthComponent
}

// ─────────────────────────────────────────────────────────────
// Default export (also named export above)
// ─────────────────────────────────────────────────────────────
export default AuthContext
