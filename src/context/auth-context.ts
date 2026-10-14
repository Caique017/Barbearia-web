import { createContext } from 'react'
import type { LoginResponse, Usuario } from '../types'

export interface AuthContextValue {
  usuario: Usuario | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (data: LoginResponse) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
