import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

const items: { to: string; label: string; icon: ReactNode }[] = [
  {
    to: '/barbeiro/agenda',
    label: 'Agenda',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
        <rect x="3" y="4" width="18" height="18" rx="3" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    to: '/barbeiro/servicos',
    label: 'Serviços',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  {
    to: '/barbeiro/dashboard',
    label: 'Financeiro',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18M7 14l4-4 3 3 5-6" />
      </svg>
    ),
  },
]

/** Navegação inferior fixa do perfil barbeiro. */
export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-20 flex border-t border-line bg-surface px-3 pb-6 pt-2.5">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-[3px] ${isActive ? 'text-brand' : 'text-placeholder'}`
          }
        >
          {item.icon}
          <span className="text-[10px] font-semibold uppercase tracking-[0.3px]">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
