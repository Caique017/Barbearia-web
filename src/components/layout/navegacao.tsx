import type { ReactNode } from 'react'

const svg = (size: number, children: ReactNode, strokeWidth = 2) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
    {children}
  </svg>
)

/**
 * Itens do menu do barbeiro — uma lista só para a Sidebar (desktop) e a
 * BottomNav (celular). `soDesktop` tira o item da barra do celular, que
 * só comporta cinco; no celular o Plano abre pelo Perfil e pelo aviso.
 */
export const itensNavegacao: {
  to: string
  label: string
  icon: (size: number) => ReactNode
  soDesktop?: boolean
}[] = [
  {
    to: '/barbeiro/agenda',
    label: 'Agenda',
    icon: (s) =>
      svg(
        s,
        <>
          <rect x="3" y="4" width="18" height="18" rx="3" />
          <path d="M8 2v4M16 2v4M3 10h18" />
        </>,
        2.1,
      ),
  },
  {
    to: '/barbeiro/clientes',
    label: 'Clientes',
    icon: (s) =>
      svg(
        s,
        <>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.7a3.5 3.5 0 0 1 0 6.6M18.5 14.8c1.6.8 2.7 2.5 3 5.2" />
        </>,
      ),
  },
  {
    to: '/barbeiro/servicos',
    label: 'Serviços',
    icon: (s) => svg(s, <path d="M4 6h16M4 12h16M4 18h16" />),
  },
  {
    to: '/barbeiro/dashboard',
    label: 'Financeiro',
    icon: (s) => svg(s, <path d="M3 3v18h18M7 14l4-4 3 3 5-6" />),
  },
  {
    to: '/barbeiro/perfil',
    label: 'Perfil',
    icon: (s) =>
      svg(
        s,
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </>,
        1.8,
      ),
  },
  {
    to: '/barbeiro/plano',
    label: 'Plano',
    soDesktop: true,
    icon: (s) =>
      svg(
        s,
        <>
          <rect x="2" y="5" width="20" height="14" rx="2.5" />
          <path d="M2 10h20M6 15h4" />
        </>,
      ),
  },
]
