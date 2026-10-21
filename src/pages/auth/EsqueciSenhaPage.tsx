import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TopBar } from '../../components/layout/TopBar'
import { Button, Input } from '../../components/ui'
import { authApi } from '../../api/auth'
import { apiErrorMessage, apiFieldErrors } from '../../api/axios'
import { loginForPath } from '../../utils/auth-routes'

const schema = z.object({
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
})
type FormData = z.infer<typeof schema>

export function EsqueciSenhaPage() {
  const { state } = useLocation() as { state?: { voltarPara?: string } }
  // Barbeiro e cliente compartilham o fluxo; o voltar respeita de onde veio.
  const voltarPara = state?.voltarPara ?? loginForPath(window.location.pathname)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (data) => {
    setErro(null)
    try {
      await authApi.esqueciSenha({ email: data.email })
      setEnviado(true)
    } catch (e) {
      for (const c of apiFieldErrors(e)) {
        setError(c.campo as keyof FormData, { message: c.mensagem })
      }
      setErro(apiErrorMessage(e, 'Não foi possível enviar o link. Tente novamente.'))
    }
  })

  if (enviado)
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center bg-screen px-[22px] py-8">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">
          Verifique seu e-mail
        </div>
        <h1 className="m-0 mb-1.5 text-[27px] font-medium leading-tight text-ink">
          Link enviado
        </h1>
        {/* A API não diz se o e-mail existe — e a tela não pode inventar isso. */}
        <p className="mb-2 text-[14px] leading-relaxed text-ink-2">
          Se existir uma conta com esse e-mail, enviamos um link para criar uma
          senha nova. O link vale por 30 minutos.
        </p>
        <p className="mb-6 text-[13px] leading-relaxed text-muted">
          Não chegou? Confira a caixa de spam. Você pode pedir outro link depois
          de dois minutos.
        </p>
        <Link to={voltarPara} className="block">
          <Button className="w-full">Voltar para o login</Button>
        </Link>
      </div>
    )

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-screen">
      <TopBar to={voltarPara} />
      <div className="flex flex-1 flex-col px-[22px] pb-7 pt-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">
          Recuperar acesso
        </div>
        <h1 className="m-0 mb-1.5 text-[27px] font-medium leading-tight text-ink">
          Esqueci minha senha
        </h1>
        <p className="mb-5 text-[14px] leading-relaxed text-ink-2">
          Informe o e-mail da sua conta e enviaremos um link para você criar uma
          senha nova.
        </p>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          {erro && (
            <p className="rounded-field bg-danger-tint-2 px-3 py-2 text-[13px] text-danger">
              {erro}
            </p>
          )}

          <Button type="submit" className="mt-1 w-full" loading={isSubmitting}>
            Enviar link
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link to={voltarPara} className="text-[13px] font-semibold text-brand">
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}
