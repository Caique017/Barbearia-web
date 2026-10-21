import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Logo } from '../../components/layout/Logo'
import { Button, Card, Spinner } from '../../components/ui'
import { authApi } from '../../api/auth'
import { apiErrorMessage } from '../../api/axios'
import type { BarbeariaPublica } from '../../types'

/**
 * Página do link público da barbearia — é por aqui que o cliente chega.
 * Mostra nome e horário, e oferece o cadastro já com o slug na URL.
 */
export function BarbeariaPage() {
  const { slug } = useParams<{ slug: string }>()
  const [barbearia, setBarbearia] = useState<BarbeariaPublica | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let active = true
    authApi
      .buscarBarbearia(slug)
      .then((b) => {
        if (!active) return
        setBarbearia(b)
        setErro(null)
      })
      .catch((e) => {
        if (active) setErro(apiErrorMessage(e))
      })
    return () => {
      active = false
    }
  }, [slug])

  if (!barbearia && erro)
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-screen px-[22px] text-center">
        <p className="m-0 text-[16px] font-medium text-danger">{erro}</p>
        <p className="m-0 text-[13px] leading-relaxed text-muted">
          Confira o link que a barbearia enviou.
        </p>
      </div>
    )

  if (!barbearia)
    return (
      <div className="flex min-h-dvh items-center justify-center bg-screen text-brand">
        <Spinner className="h-8 w-8" />
      </div>
    )

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-screen">
      {/* Cabeçalho de marca */}
      <div className="relative flex-none overflow-hidden bg-ink px-[22px] pb-7 pt-8 text-white">
        <div className="absolute right-[52px] top-0 h-[120px] w-[26px] bg-brand [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
        <div className="absolute right-4 top-0 h-[120px] w-[26px] bg-brand-light [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
        <div className="relative flex items-center gap-2.5">
          <Logo size={28} />
          <span className="text-[19px] font-semibold text-white">ClipBook</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-[22px] pb-7 pt-6">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">
          Barbearia parceira
        </div>
        <h1 className="m-0 mb-1.5 text-[27px] font-medium leading-tight text-ink">
          {barbearia.nome}
        </h1>
        <p className="mb-5 text-[14px] leading-relaxed text-ink-2">
          Crie sua conta para agendar em segundos e guardar seu histórico de
          cortes.
        </p>

        {/* O horário é opcional na API — só mostra se o barbeiro informou. */}
        {barbearia.horarioFuncionamento && (
          <Card className="mb-5 px-4 py-3.5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-muted">
              Horário de funcionamento
            </div>
            <div className="mt-1 whitespace-pre-line text-[14px] leading-relaxed text-ink">
              {barbearia.horarioFuncionamento}
            </div>
          </Card>
        )}

        <Link to={`/b/${slug}/cadastro`} className="block">
          <Button className="w-full">Criar minha conta</Button>
        </Link>

        <div className="mt-5 border-t border-line pt-4 text-center">
          <Link to="/login" className="text-[13.5px] font-semibold text-brand">
            Já tenho conta
          </Link>
        </div>
      </div>
    </div>
  )
}
