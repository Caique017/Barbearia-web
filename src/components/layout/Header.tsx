import { useAuth } from '../../hooks/useAuth'
import { Logo } from './Logo'

/** Cabeçalho branco do painel do barbeiro: marca, nome do profissional e logout. */
export function Header() {
  const { usuario, logout } = useAuth()

  return (
    <header className="flex items-center justify-between px-5 pb-3 pt-4">
      <div className="flex items-center gap-2.5">
        <Logo size={28} light="#f7f7f7" />
        <div>
          <div className="text-[15px] font-semibold leading-none text-ink">ClipBook</div>
          <div className="mt-0.5 text-[11px] text-muted">{usuario?.nome ?? 'Barbeiro'}</div>
        </div>
      </div>
      <button
        onClick={logout}
        aria-label="Sair"
        className="flex h-9 w-9 items-center justify-center rounded-field border border-line bg-surface text-ink-2 hover:bg-screen"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      </button>
    </header>
  )
}
