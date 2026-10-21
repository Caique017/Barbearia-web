import type { Role } from '../types'

/**
 * Tela de login de cada perfil. O app tem duas portas de entrada, então
 * expulsar todo mundo para /login manda o barbeiro para o lado errado.
 */
export const loginFor = (role: Role) =>
  role === 'BARBEIRO' ? '/barbeiro/login' : '/login'

/**
 * Tela de login deduzida da URL atual — para quando não há usuário carregado
 * (token expirado, sessão perdida) e portanto não se sabe o perfil.
 */
export const loginForPath = (pathname: string) =>
  pathname.startsWith('/barbeiro') ? '/barbeiro/login' : '/login'

/** Home de cada perfil — usada em redirecionamentos. */
export const homeFor = (role: Role) =>
  role === 'BARBEIRO' ? '/barbeiro/agenda' : '/cliente/historico'
