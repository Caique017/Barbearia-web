import { NavLink } from 'react-router-dom'
import { itensNavegacao } from './navegacao'

/** Navegação inferior fixa do perfil barbeiro. */
export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-20 flex border-t border-line bg-surface px-1.5 pb-6 pt-2.5">
      {itensNavegacao
        .filter((item) => !item.soDesktop)
        .map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-[3px] ${isActive ? 'text-brand' : 'text-placeholder'}`
            }
          >
            {item.icon(21)}
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.3px]">{item.label}</span>
          </NavLink>
        ))}
    </nav>
  )
}
