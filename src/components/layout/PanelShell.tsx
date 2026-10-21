import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { AvisoAssinatura } from './AvisoAssinatura'

/** Moldura do painel do barbeiro no desktop: barra lateral fixa + área de conteúdo rolável. */
export function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AvisoAssinatura />
        <main className="min-w-0 flex-1 px-11 py-8">{children}</main>
      </div>
    </div>
  )
}
