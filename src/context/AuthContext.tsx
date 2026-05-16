import { createContext, useContext, useState, useCallback } from 'react'

export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  createdAt: number
}

interface AuthCtx {
  user: User | null
  isAdmin: boolean
  login: (email: string, name: string) => User
  logout: () => void
  updateProfile: (data: Partial<Pick<User, 'name' | 'email'>>) => void
}

const Ctx = createContext<AuthCtx | null>(null)
const ADMIN_EMAILS = ['admin@theclass.it']
const KEY = 'theclass_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') } catch { return null }
  })

  const login = useCallback((email: string, name: string): User => {
    const u: User = {
      id: `u_${email.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
      name: name || email.split('@')[0],
      email,
      role: ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user',
      createdAt: Date.now(),
    }
    localStorage.setItem(KEY, JSON.stringify(u))
    // Migrate guest favorites to user namespace
    const guest = localStorage.getItem('theclass_favorites_guest')
    if (guest && !localStorage.getItem(`theclass_favorites_${u.id}`)) {
      localStorage.setItem(`theclass_favorites_${u.id}`, guest)
    }
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(KEY)
    setUser(null)
  }, [])

  const updateProfile = useCallback((data: Partial<Pick<User, 'name' | 'email'>>) => {
    setUser(prev => {
      if (!prev) return null
      const updated = { ...prev, ...data }
      localStorage.setItem(KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <Ctx.Provider value={{ user, isAdmin: user?.role === 'admin', login, logout, updateProfile }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}

export function getCurrentUserId(): string {
  try {
    const u = JSON.parse(localStorage.getItem(KEY) ?? 'null') as User | null
    return u?.id ?? 'guest'
  } catch { return 'guest' }
}
