import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { Role } from '../../types'
import { loginFor } from '../../utils/auth-routes'
import { Spinner } from '../ui/Spinner'

/** Home de cada perfil — usada em redirecionamentos. */
export const homeFor = (role: Role) =>
  role === 'BARBEIRO' ? '/barbeiro/agenda' : '/cliente/historico'

function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-screen text-brand">
      <Spinner className="h-8 w-8" />
    </div>
  )
}

/**
 * Bloqueia rotas por autenticação e papel.
 * Sem login → /login. Papel errado → home do perfil correto.
 */
export function ProtectedRoute({ role }: { role: Role }) {
  const { isAuthenticated, usuario, loading } = useAuth()

  if (loading) return <FullScreenLoader />
  if (!isAuthenticated) return <Navigate to={loginFor(role)} replace />
  if (isAuthenticated && !usuario) return <FullScreenLoader />
  if (usuario && usuario.role !== role) {
    return <Navigate to={homeFor(usuario.role)} replace />
  }

  return <Outlet />
}
