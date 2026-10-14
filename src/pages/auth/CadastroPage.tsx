import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TopBar } from '../../components/layout/TopBar'
import { Logo } from '../../components/layout/Logo'
import { Button, GoogleButton, Input } from '../../components/ui'
import { authApi } from '../../api/auth'
import { apiErrorMessage } from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'

const schema = z
  .object({
    nome: z.string().min(1, 'Informe seu nome'),
    email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
    whatsapp: z.string().min(8, 'Informe seu WhatsApp'),
    senha: z.string().min(6, 'Mínimo de 6 caracteres'),
    confirmar: z.string().min(1, 'Repita a senha'),
  })
  .refine((d) => d.senha === d.confirmar, {
    path: ['confirmar'],
    message: 'As senhas não conferem',
  })
type FormData = z.infer<typeof schema>

export function CadastroPage() {
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
      const res = await authApi.registrarCliente({
        nome: data.nome,
        email: data.email,
        whatsapp: data.whatsapp,
        senha: data.senha,
      })
      login(res)
      navigate('/cliente/historico', { replace: true })
    } catch (e) {
      setErro(apiErrorMessage(e, 'Não foi possível criar sua conta. Tente novamente.'))
    }
  })

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-screen lg:max-w-none lg:flex-row lg:bg-surface">
      {/* Painel de marca — só no desktop (design D5) */}
      <div className="relative hidden flex-1 overflow-hidden bg-ink text-white lg:block">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#1a1a1a,#111)]" />
        <div className="absolute right-[64px] top-[60px] h-[180px] w-[34px] bg-brand [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
        <div className="absolute right-[24px] top-[60px] h-[180px] w-[34px] bg-brand-light [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
        <div className="absolute bottom-16 left-14 right-14">
          <div className="mb-3.5 flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-[24px] font-semibold text-white">ClipBook</span>
          </div>
          <h2 className="max-w-[400px] text-[34px] font-medium leading-tight text-white">
            Crie sua conta e guarde seu histórico de cortes
          </h2>
        </div>
      </div>

      {/* Painel do formulário (direita no desktop) */}
      <div className="flex flex-1 flex-col lg:w-[460px] lg:flex-none lg:justify-center lg:overflow-y-auto lg:px-[60px] lg:py-14">
        <div className="lg:hidden">
          <TopBar to="/login" />
        </div>
        <div className="flex flex-1 flex-col px-[22px] pb-7 pt-3 lg:flex-none lg:px-0 lg:pb-0 lg:pt-0">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">
            Novo cliente
          </div>
          <h1 className="m-0 mb-1.5 text-[27px] font-medium leading-tight text-ink">Criar sua conta</h1>
          <p className="mb-5 text-[14px] leading-relaxed text-ink-2 lg:hidden">
            Guarde seu histórico e agende ainda mais rápido da próxima vez.
          </p>

          {/* TODO: integrar com API — cadastro com Google (OAuth) ainda não implementado no backend */}
        <GoogleButton label="Cadastrar com Google" />
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-muted">ou</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
          <Input
            label="Nome completo"
            placeholder="Seu nome"
            autoComplete="name"
            error={errors.nome?.message}
            {...register('nome')}
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="voce@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="WhatsApp"
            type="tel"
            placeholder="(11) 9 8888-7777"
            autoComplete="tel"
            error={errors.whatsapp?.message}
            {...register('whatsapp')}
          />
          <div className="flex gap-2.5">
            <Input
              label="Senha"
              type="password"
              placeholder="mín. 6"
              autoComplete="new-password"
              className="flex-1"
              error={errors.senha?.message}
              {...register('senha')}
            />
            <Input
              label="Confirmar"
              type="password"
              placeholder="repita"
              autoComplete="new-password"
              className="flex-1"
              error={errors.confirmar?.message}
              {...register('confirmar')}
            />
          </div>
          <p className="text-[12px] text-muted">Seu e-mail será usado para login.</p>
          {erro && (
            <p className="rounded-field bg-danger-tint-2 px-3 py-2 text-[13px] text-danger">{erro}</p>
          )}
          <Button type="submit" className="mt-1 w-full" loading={isSubmitting}>
            Criar conta
          </Button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-[13px] text-muted">Já tenho conta </span>
          <Link to="/login" className="text-[13px] font-semibold text-brand">
            Entrar
          </Link>
        </div>
        </div>
      </div>
    </div>
  )
}
