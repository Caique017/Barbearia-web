import { useState } from 'react'
import { Link } from 'react-router-dom'
import { lerConsentimento, salvarConsentimento } from '../../utils/consentimento'
import type { Consentimento } from '../../utils/consentimento'

/**
 * Aviso de cookies. Hoje o site só usa o armazenamento essencial do login;
 * qualquer recurso opcional futuro deve checar `aceitouOpcionais()` antes de carregar.
 */
export function AvisoCookies() {
  const [escolha, setEscolha] = useState(lerConsentimento)

  if (escolha) return null

  const escolher = (valor: Consentimento) => {
    salvarConsentimento(valor)
    setEscolha(valor)
  }

  return (
    <section
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-[560px] rounded-card border border-line bg-surface p-4 shadow-card"
    >
      <p className="text-[13px] leading-relaxed text-ink-2">
        Usamos só o armazenamento necessário para manter você conectado. Não usamos cookies de
        rastreamento nem de publicidade. Se um dia houver algo opcional, ele só liga com o seu
        aceite.{' '}
        <Link to="/privacidade" className="font-semibold text-brand underline-offset-2 hover:underline">
          Saiba mais
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => escolher('recusado')}
          className="h-9 flex-1 cursor-pointer rounded-field border-[1.5px] border-ink bg-surface text-[12px] font-semibold uppercase tracking-[0.5px] text-ink hover:bg-screen focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Recusar opcionais
        </button>
        <button
          type="button"
          onClick={() => escolher('aceito')}
          className="h-9 flex-1 cursor-pointer rounded-field border-[1.5px] border-ink bg-surface text-[12px] font-semibold uppercase tracking-[0.5px] text-ink hover:bg-screen focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Aceitar opcionais
        </button>
      </div>
    </section>
  )
}
