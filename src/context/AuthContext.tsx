import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../api/auth'
import type { LoginResponse, Usuario } from '../types'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState<boolean>(!!localStorage.getItem('token'))

  // Hidrata o usuário a partir do token salvo (GET /auth/me)
  useEffect(() => {
    const saved = localStorage.getItem('token')
    if (!saved) {
      setLoading(false)
      return
    }
    let active = true
    authApi
      .me()
      .then((u) => {
        if (active) setUsuario(u)
      })
      .catch(() => {
        localStorage.removeItem('token')
        if (active) {
          setToken(null)
          setUsuario(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback((data: LoginResponse) => {
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUsuario({ id: data.email, nome: data.nome, email: data.email, role: data.role })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUsuario(null)
    window.location.href = '/login'
  }, [])

  const value = useMemo(
    () => ({
      usuario,
      token,
      isAuthenticated: !!token,
      loading,
      login,
      logout,
    }),
    [usuario, token, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
