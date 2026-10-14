import { useNavigate } from 'react-router-dom'

interface TopBarProps {
  title?: string
  /** Destino do botão voltar. Sem valor, volta para a tela anterior. */
  to?: string
}

/** Barra superior com botão voltar e título — telas internas do fluxo. */
export function TopBar({ title, to }: TopBarProps) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-none items-center gap-2.5 px-[22px] pb-1 pt-4">
      <button
        onClick={() => (to ? navigate(to) : navigate(-1))}
        aria-label="Voltar"
        className="flex h-[34px] w-[34px] items-center justify-center rounded-field border-[1.5px] border-line bg-surface text-[18px] leading-none text-ink-2 hover:bg-screen"
      >
        ‹
      </button>
      {title && <h2 className="m-0 text-[18px] font-semibold text-ink">{title}</h2>}
    </div>
  )
}
