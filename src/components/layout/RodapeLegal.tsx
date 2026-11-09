import { Link } from 'react-router-dom'
import { CONTATO, RESPONSAVEL } from '../../utils/legal'

interface RodapeLegalProps {
  escuro?: boolean
  className?: string
}

/** Links de Termos, Privacidade e contato — presentes em todas as telas públicas. */
export function RodapeLegal({ escuro = false, className = '' }: RodapeLegalProps) {
  const cor = escuro ? 'text-white/60' : 'text-muted'
  const link = `underline-offset-2 hover:underline focus-visible:underline ${escuro ? 'text-white/80' : 'text-ink-2'}`

  return (
    <footer className={`text-center text-[11.5px] leading-relaxed ${cor} ${className}`}>
      <nav aria-label="Informações legais" className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        <Link to="/termos" className={link}>
          Termos de uso
        </Link>
        <Link to="/privacidade" className={link}>
          Privacidade
        </Link>
        <a href={`mailto:${CONTATO}`} className={link}>
          Contato
        </a>
      </nav>
      <p className="mt-1">
        ClipBook · {RESPONSAVEL} · {CONTATO}
      </p>
    </footer>
  )
}
