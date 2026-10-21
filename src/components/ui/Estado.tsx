import type { ReactNode } from 'react'
import { Button } from './Button'
import { Spinner } from './Spinner'

/** Spinner centralizado enquanto a primeira resposta não chega. */
export function Carregando({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-1 items-center justify-center py-16 text-brand ${className}`}>
      <Spinner className="h-7 w-7" />
    </div>
  )
}

/** Falha ao carregar, com botão para tentar de novo. */
export function ErroCarregar({ mensagem, onTentar }: { mensagem: string; onTentar: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <p className="m-0 text-[14px] text-danger">{mensagem}</p>
      <Button variant="secondary" size="sm" onClick={onTentar}>
        Tentar de novo
      </Button>
    </div>
  )
}

/** Lista vazia: ícone, título e uma dica do que fazer. */
export function Vazio({ icone, titulo, dica }: { icone: ReactNode; titulo: string; dica?: string }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint text-2xl">
        {icone}
      </div>
      <p className="m-0 text-[15px] font-semibold text-ink">{titulo}</p>
      {dica && <p className="m-0 mt-1 text-[13px] text-muted">{dica}</p>}
    </div>
  )
}
