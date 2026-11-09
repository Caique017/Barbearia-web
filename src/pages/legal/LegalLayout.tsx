import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../../components/layout/Logo'
import { RodapeLegal } from '../../components/layout/RodapeLegal'
import { VERSAO_DOCUMENTOS } from '../../utils/legal'

interface LegalLayoutProps {
  titulo: string
  resumo: string
  children: ReactNode
}

export function LegalLayout({ titulo, resumo, children }: LegalLayoutProps) {
  return (
    <div className="min-h-dvh bg-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[760px] items-center gap-2.5 px-[22px] py-4">
          <Link to="/" className="flex items-center gap-2.5" aria-label="ClipBook, página inicial">
            <Logo size={24} light="#f7f7f7" />
            <span className="text-[18px] font-semibold text-ink">ClipBook</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-[22px] py-8 lg:py-12">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">
          Atualizado em {VERSAO_DOCUMENTOS}
        </div>
        <h1 className="mb-3 text-[28px] font-medium leading-tight text-ink lg:text-[34px]">{titulo}</h1>
        <p className="mb-8 text-[15px] leading-relaxed text-ink-2">{resumo}</p>
        <div className="flex flex-col gap-7">{children}</div>
      </main>

      <RodapeLegal className="pb-28 pt-4" />
    </div>
  )
}

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2.5 text-[18px] font-semibold text-ink">{titulo}</h2>
      <div className="flex flex-col gap-2.5 text-[14.5px] leading-relaxed text-ink-2">{children}</div>
    </section>
  )
}

export function Lista({ itens }: { itens: ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5">
      {itens.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}
