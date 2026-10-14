import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Logo } from '../../components/layout/Logo'
import { Button, GoogleButton, Input } from '../../components/ui'
import { authApi } from '../../api/auth'
import { apiErrorMessage } from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'
import { homeFor } from '../../components/layout/ProtectedRoute'

const schema = z.object({
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  senha: z.string().min(1, 'Informe sua senha'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [erro, setErro] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (data) => {
    setErro(null)
    try {
      const res = await authApi.login({ email: data.email, senha: data.senha })
      login(res)
      navigate(homeFor(res.role), { replace: true })
    } catch (e) {
      // Mensagem genérica por segurança
      setErro(apiErrorMessage(e, 'E-mail ou senha incorretos'))
    }
  })

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-surface lg:max-w-none lg:flex-row">
      {/* Hero / painel de marca (esquerda no desktop) */}
      <div className="relative h-[266px] flex-none overflow-hidden bg-ink text-white lg:h-auto lg:flex-1">
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,17,17,.96),rgba(17,17,17,.35)_60%,rgba(17,17,17,.55))] lg:bg-[linear-gradient(160deg,rgba(17,17,17,.9),rgba(17,17,17,.35))]" />
        <div className="absolute right-[52px] top-[34px] h-[150px] w-[30px] bg-brand [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)] lg:right-[64px] lg:top-[60px] lg:h-[180px] lg:w-[34px]" />
        <div className="absolute right-4 top-[34px] h-[150px] w-[30px] bg-brand-light [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)] lg:right-[24px] lg:top-[60px] lg:h-[180px] lg:w-[34px]" />
        <div className="absolute inset-x-[22px] bottom-[22px] lg:inset-x-auto lg:bottom-16 lg:left-14 lg:right-14">
          <div className="mb-2 flex items-center gap-2.5 lg:mb-3.5">
            <Logo size={30} />
            <span className="text-[21px] font-semibold text-white lg:text-[24px]">ClipBook</span>
          </div>
          <h2 className="mb-2.5 hidden max-w-[400px] text-[34px] font-medium leading-tight text-white lg:block">
            Agende seu horário em qualquer barbearia parceira
          </h2>
          <div className="flex items-center gap-2 text-[12.5px] text-white/80 lg:text-[13px] lg:text-white/75">
            <span className="inline-flex items-center gap-1 font-semibold text-white">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffb800">
                <path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7-6.2-3.5L6 21l1.4-7L2.2 9.3l7-.8z" />
              </svg>
              4,9
            </span>
            <span className="opacity-60">·</span>
            <span>320 avaliações</span>
            <span className="opacity-60">·</span>
            <span>Centro, SP</span>
          </div>
        </div>
      </div>

      {/* Formulário (direita no desktop) */}
      <div className="flex flex-1 flex-col px-[22px] pb-7 pt-5 lg:w-[460px] lg:flex-none lg:justify-center lg:px-[60px] lg:py-16">
        <div className="mb-2.5 hidden text-[11px] font-semibold uppercase tracking-[0.9px] text-brand lg:block">
          Bem-vindo de volta
        </div>
        <h2 className="mb-6 hidden text-[28px] font-medium text-ink lg:block">Entrar na sua conta</h2>
        {/* TODO: integrar com API — login com Google (OAuth) ainda não implementado no backend */}
        <GoogleButton />
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-muted">
            ou com e-mail
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={onSubmit} noValidate>
          <Input
            label="E-mail"
            type="email"
            placeholder="voce@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="mt-3"
            error={errors.senha?.message}
            {...register('senha')}
          />
          <div className="mb-4 mt-2 text-right">
            <span className="text-[12.5px] font-medium text-brand">Esqueci a senha</span>
          </div>
          {erro && (
            <p className="mb-3 rounded-field bg-danger-tint-2 px-3 py-2 text-[13px] text-danger">
              {erro}
            </p>
          )}
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Entrar
          </Button>
        </form>

        <Link to="/cadastro" className="mt-3 block">
          <Button variant="secondary" className="w-full" type="button">
            Criar conta
          </Button>
        </Link>

        <div className="mt-5 border-t border-line pt-4 text-center">
          <Link to="/agendar" className="text-[14px] font-semibold text-brand">
            Continuar sem cadastro →
          </Link>
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
            Você agenda normalmente, mas o histórico só fica salvo com uma conta.
          </p>
        </div>
      </div>
    </div>
  )
}
