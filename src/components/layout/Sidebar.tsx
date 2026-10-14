import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Logo } from './Logo'
import { useAuth } from '../../hooks/useAuth'
import { initials } from '../../utils/formatters'

const items: { to: string; label: string; icon: ReactNode }[] = [
  {
    to: '/barbeiro/agenda',
    label: 'Agenda',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
        <rect x="3" y="4" width="18" height="18" rx="3" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    to: '/barbeiro/servicos',
    label: 'Serviços',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
  },
  {
    to: '/barbeiro/dashboard',
    label: 'Financeiro',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18M7 14l4-4 3 3 5-6" />
      </svg>
    ),
  },
]

/** Navegação lateral do painel do barbeiro no desktop (design D3/D4/D7/D8). */
export function Sidebar() {
  const { usuario, logout } = useAuth()
  const nome = usuario?.nome ?? 'Ricardo Nunes'

  return (
    <aside className="sticky top-0 hidden h-dvh w-[220px] flex-none flex-col bg-surface-dark px-[18px] py-7 lg:flex">
      <div className="mb-[34px] flex items-center gap-2.5 px-1.5">
        <Logo size={24} />
        <span className="text-[16px] font-semibold text-white">ClipBook</span>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[13.5px] font-semibold transition-colors ${
                isActive ? 'bg-brand-light/[0.18] text-white' : 'text-placeholder hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-brand-ink' : ''}>{item.icon}</span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2.5 border-t border-white/10 px-1.5 pt-3.5">
        <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-brand-tint text-[12px] font-bold text-brand">
          {initials(nome)}
        </div>
        <span className="flex-1 truncate text-[12.5px] font-semibold text-white">{nome}</span>
        <button
          onClick={logout}
          aria-label="Sair"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-md text-placeholder hover:bg-white/5 hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
