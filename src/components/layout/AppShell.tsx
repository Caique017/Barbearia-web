import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { AvisoAssinatura } from './AvisoAssinatura'

interface AppShellProps {
  children: ReactNode
  /** Mostra a navegação inferior do barbeiro (e o aviso de assinatura). */
  withNav?: boolean
  /** Classe do container (permite fundo escuro em telas como login/sucesso). */
  className?: string
}

/**
 * Container mobile-first: centraliza o conteúdo numa coluna de até 430px,
 * ocupando a altura toda da tela. Base de todas as telas.
 */
export function AppShell({ children, withNav = false, className = 'bg-screen' }: AppShellProps) {
  return (
    <div
      className={`mx-auto flex min-h-dvh w-full max-w-[430px] flex-col lg:shadow-[0_0_60px_rgba(26,26,26,.10)] ${className}`}
    >
      {withNav && <AvisoAssinatura />}
      <div className="flex flex-1 flex-col">{children}</div>
      {withNav && <BottomNav />}
    </div>
  )
}
