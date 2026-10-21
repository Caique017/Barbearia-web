import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TopBar } from '../../components/layout/TopBar'
import { Logo } from '../../components/layout/Logo'
import { Button, Card, Input } from '../../components/ui'
import { authApi } from '../../api/auth'
import { apiErrorMessage, apiFieldErrors } from '../../api/axios'
import { useAuth } from '../../hooks/useAuth'

// Espelha as restrições de BarbeiroCadastroRequest, para o barbeiro saber antes de enviar.
const schema = z
  .object({
    nome: z.string().min(1, 'Informe seu nome').max(100, 'Máximo de 100 caracteres'),
    nomeBarbearia: z
      .string()
      .min(1, 'Informe o nome da barbearia')
      .max(120, 'Máximo de 120 caracteres')
      .regex(/[\p{L}\p{N}]/u, 'Use pelo menos uma letra ou número'),
    horarioFuncionamento: z.string().max(255, 'Máximo de 255 caracteres'),
    email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
    senha: z
      .string()
      .min(8, 'Mínimo de 8 caracteres')
      .max(64, 'Máximo de 64 caracteres'),
    confirmar: z.string().min(1, 'Repita a senha'),
  })
  .refine((d) => d.senha === d.confirmar, {
    path: ['confirmar'],
    message: 'As senhas não conferem',
  })
type FormData = z.infer<typeof schema>

export function BarbeiroCadastroPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [erro, setErro] = useState<string | null>(null)
  const [slug, setSlug] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (data) => {
    setErro(null)
    try {
      const res = await authApi.registrarBarbeiro({
        nome: data.nome,
        nomeBarbearia: data.nomeBarbearia,
        // A API aceita omitir o horário, mas recusa string vazia — por isso o undefined.
        horarioFuncionamento: data.horarioFuncionamento.trim() || undefined,
        email: data.email,
        senha: data.senha,
      })
      await login(res.token)
      // Mostra o link antes de navegar: é o que o barbeiro vai mandar aos clientes.
      setSlug(res.slug)
    } catch (e) {
      for (const c of apiFieldErrors(e)) {
        setError(c.campo as keyof FormData, { message: c.mensagem })
      }
      setErro(apiErrorMessage(e, 'Não foi possível criar sua conta. Tente novamente.'))
    }
  })

  if (slug) {
    const link = `${window.location.origin}/b/${slug}`
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center bg-screen px-[22px] py-8">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">
          Barbearia criada
        </div>
        <h1 className="m-0 mb-1.5 text-[27px] font-medium leading-tight text-ink">
          Este é o seu link
        </h1>
        <p className="mb-5 text-[14px] leading-relaxed text-ink-2">
          Mande para seus clientes. É por aqui que eles criam a conta e agendam
          com você.
        </p>

        <Card className="mb-3 px-4 py-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-muted">
            Link da barbearia
          </div>
          <div className="mt-1 break-all text-[14px] font-medium text-ink">{link}</div>
        </Card>

        <Button
          variant="secondary"
          className="mb-2 w-full"
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(link)
            setCopiado(true)
          }}
        >
          {copiado ? 'Link copiado' : 'Copiar link'}
        </Button>

        <Button className="w-full" type="button" onClick={() => navigate('/barbeiro/agenda')}>
          Ir para minha agenda
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-screen lg:max-w-none lg:flex-row lg:bg-surface">
      {/* Painel de marca — só no desktop */}
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
            Sua agenda e seu caixa no mesmo lugar
          </h2>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex flex-1 flex-col lg:w-[460px] lg:flex-none lg:justify-center lg:overflow-y-auto lg:px-[60px] lg:py-14">
        <div className="lg:hidden">
          <TopBar to="/barbeiro/login" />
        </div>
        <div className="flex flex-1 flex-col px-[22px] pb-7 pt-3 lg:flex-none lg:px-0 lg:pb-0 lg:pt-0">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">
            Nova barbearia
          </div>
          <h1 className="m-0 mb-1.5 text-[27px] font-medium leading-tight text-ink">
            Criar conta de barbeiro
          </h1>
          <p className="mb-5 text-[14px] leading-relaxed text-ink-2">
            Ao final você recebe o link para divulgar aos seus clientes.
          </p>

          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
            <Input
              label="Seu nome"
              placeholder="Como seus clientes te chamam"
              error={errors.nome?.message}
              {...register('nome')}
            />
            <Input
              label="Nome da barbearia"
              placeholder="Barbearia do João"
              error={errors.nomeBarbearia?.message}
              {...register('nomeBarbearia')}
            />
            <Input
              label="Horário de funcionamento (opcional)"
              placeholder="Seg a sáb, 9h às 19h"
              error={errors.horarioFuncionamento?.message}
              {...register('horarioFuncionamento')}
            />
            <Input
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Senha"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo de 8 caracteres"
              error={errors.senha?.message}
              {...register('senha')}
            />
            <Input
              label="Repetir senha"
              type="password"
              autoComplete="new-password"
              error={errors.confirmar?.message}
              {...register('confirmar')}
            />

            {erro && (
              <p className="rounded-field bg-danger-tint-2 px-3 py-2 text-[13px] text-danger">
                {erro}
              </p>
            )}

            <Button type="submit" className="mt-1 w-full" loading={isSubmitting}>
              Criar barbearia
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-[13px] text-muted">Já tenho conta </span>
            <Link to="/barbeiro/login" className="text-[13px] font-semibold text-brand">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
