import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Logo } from '../../components/layout/Logo'
import { RodapeLegal } from '../../components/layout/RodapeLegal'
import { Card, Spinner } from '../../components/ui'
import { contaApi } from '../../api/conta'
import { apiErrorMessage } from '../../api/axios'

type Estado = 'enviando' | 'pronto' | 'erro'

/** Destino do link "parar de receber" dos e-mails: /descadastro?token=... */
export function DescadastroPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [estado, setEstado] = useState<Estado>(token ? 'enviando' : 'erro')
  const [mensagem, setMensagem] = useState('Link incompleto. Abra de novo o link do e-mail.')

  useEffect(() => {
    if (!token) return
    let ativo = true
    contaApi
      .descadastrar(token)
      .then(() => ativo && setEstado('pronto'))
      .catch((e) => {
        if (!ativo) return
        setMensagem(apiErrorMessage(e, 'Não foi possível concluir. Tente de novo pelo link do e-mail.'))
        setEstado('erro')
      })
    return () => {
      ativo = false
    }
  }, [token])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-screen px-[22px] py-10">
      <div className="mb-6 flex items-center gap-2.5">
        <Logo size={26} light="#f7f7f7" />
        <span className="text-[20px] font-semibold text-ink">ClipBook</span>
      </div>
      <Card className="w-full max-w-[460px] p-6 text-center" aria-live="polite">
        {estado === 'enviando' && (
          <div className="flex items-center justify-center gap-2 text-[14px] text-muted">
            <Spinner className="h-4 w-4" /> Atualizando suas preferências…
          </div>
        )}
        {estado === 'pronto' && (
          <>
            <h1 className="mb-2 text-[22px] font-medium text-ink">Pronto, você não recebe mais</h1>
            <p className="text-[14px] leading-relaxed text-ink-2">
              Desligamos os lembretes e as novidades por e-mail. E-mails que você mesmo pedir, como a
              recuperação de senha, continuam chegando. Dá para religar no seu perfil.
            </p>
          </>
        )}
        {estado === 'erro' && (
          <>
            <h1 className="mb-2 text-[22px] font-medium text-ink">Não deu certo</h1>
            <p className="text-[14px] leading-relaxed text-ink-2">{mensagem}</p>
          </>
        )}
        <Link to="/login" className="mt-5 inline-block text-[13px] font-semibold text-brand">
          Ir para o login
        </Link>
      </Card>
      <RodapeLegal className="mt-8" />
    </div>
  )
}
