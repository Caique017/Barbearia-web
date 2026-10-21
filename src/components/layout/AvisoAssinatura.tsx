import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { assinaturaApi } from '../../api/assinatura'
import { EVENTO_ASSINATURA_VENCIDA } from '../../api/axios'
import type { Assinatura } from '../../types'

/**
 * Faixa no topo do painel do barbeiro: avisa quando faltam 2 dias ou menos
 * e quando a assinatura venceu (a API passa a responder 402 nas escritas).
 */
export function AvisoAssinatura() {
  const { pathname } = useLocation()
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null)
  const [mensagem402, setMensagem402] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true
    assinaturaApi
      .consultar()
      .then((a) => {
        if (ativo) setAssinatura(a)
      })
      .catch(() => undefined)
    return () => {
      ativo = false
    }
  }, [])

  useEffect(() => {
    const aoVencer = (e: Event) => setMensagem402((e as CustomEvent<string>).detail)
    window.addEventListener(EVENTO_ASSINATURA_VENCIDA, aoVencer)
    return () => window.removeEventListener(EVENTO_ASSINATURA_VENCIDA, aoVencer)
  }, [])

  if (pathname === '/barbeiro/plano') return null

  const vencida = mensagem402 !== null || (assinatura !== null && !assinatura.ativa)
  const acabando = assinatura?.ativa && assinatura.diasRestantes <= 2
  if (!vencida && !acabando) return null

  const texto = vencida
    ? (mensagem402 ?? 'Sua assinatura venceu. A agenda está só para consulta.')
    : assinatura!.diasRestantes === 0
      ? 'Seu acesso termina hoje.'
      : `Faltam ${assinatura!.diasRestantes} ${assinatura!.diasRestantes === 1 ? 'dia' : 'dias'} do seu acesso.`

  return (
    <div
      role="status"
      className={`flex items-center gap-3 px-5 py-2.5 text-[12.5px] ${
        vencida ? 'bg-danger-tint text-danger' : 'bg-brand-tint-2 text-brand-hover'
      }`}
    >
      <span className="flex-1 leading-snug">{texto}</span>
      <Link
        to="/barbeiro/plano"
        className="flex-none text-[11.5px] font-bold uppercase tracking-[0.4px] underline-offset-2 hover:underline"
      >
        {vencida ? 'Assinar' : 'Ver plano'}
      </Link>
    </div>
  )
}
