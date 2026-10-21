import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input } from '../../components/ui'
import { authApi } from '../../api/auth'
import { apiErrorMessage, apiFieldErrors } from '../../api/axios'

const schema = z
  .object({
    novaSenha: z
      .string()
      .min(8, 'Mínimo de 8 caracteres')
      .max(64, 'Máximo de 64 caracteres'),
    confirmar: z.string().min(1, 'Repita a senha'),
  })
  .refine((d) => d.novaSenha === d.confirmar, {
    path: ['confirmar'],
    message: 'As senhas não conferem',
  })
type FormData = z.infer<typeof schema>

export function RedefinirSenhaPage() {
  const navigate = useNavigate()
  // O e-mail da API aponta para /redefinir-senha?token=...
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [pronto, setPronto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = handleSubmit(async (data) => {
    if (!token) return
    setErro(null)
    try {
      await authApi.redefinirSenha({ token, novaSenha: data.novaSenha })
      setPronto(true)
    } catch (e) {
      for (const c of apiFieldErrors(e)) {
        // O campo "token" não tem input: a mensagem dele cai na geral.
        if (c.campo === 'novaSenha') {
          setError('novaSenha', { message: c.mensagem })
        }
      }
      setErro(apiErrorMessage(e, 'Não foi possível redefinir a senha. Tente novamente.'))
    }
  })

  // Link sem token: não há o que redefinir.
  if (!token)
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center bg-screen px-[22px] py-8">
        <h1 className="m-0 mb-1.5 text-[22px] font-medium leading-tight text-ink">
          Link inválido
        </h1>
        <p className="mb-6 text-[14px] leading-relaxed text-ink-2">
          Este link está incompleto. Peça um novo para redefinir sua senha.
        </p>
        <Link to="/esqueci-senha" className="block">
          <Button className="w-full">Pedir novo link</Button>
        </Link>
      </div>
    )

  if (pronto)
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center bg-screen px-[22px] py-8">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">
          Tudo certo
        </div>
        <h1 className="m-0 mb-1.5 text-[27px] font-medium leading-tight text-ink">
          Senha redefinida
        </h1>
        <p className="mb-6 text-[14px] leading-relaxed text-ink-2">
          Já pode entrar com a senha nova.
        </p>
        <Button className="w-full" type="button" onClick={() => navigate('/login')}>
          Entrar como cliente
        </Button>
        <Button
          variant="secondary"
          className="mt-2 w-full"
          type="button"
          onClick={() => navigate('/barbeiro/login')}
        >
          Entrar como barbeiro
        </Button>
      </div>
    )

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center bg-screen px-[22px] py-8">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">
        Recuperar acesso
      </div>
      <h1 className="m-0 mb-1.5 text-[27px] font-medium leading-tight text-ink">
        Criar senha nova
      </h1>
      <p className="mb-5 text-[14px] leading-relaxed text-ink-2">
        Escolha uma senha de 8 a 64 caracteres.
      </p>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <Input
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo de 8 caracteres"
          error={errors.novaSenha?.message}
          {...register('novaSenha')}
        />
        <Input
          label="Repetir senha"
          type="password"
          autoComplete="new-password"
          error={errors.confirmar?.message}
          {...register('confirmar')}
        />

        {erro && (
          <div className="rounded-field bg-danger-tint-2 px-3 py-2">
            <p className="m-0 text-[13px] text-danger">{erro}</p>
            <Link
              to="/esqueci-senha"
              className="mt-1 inline-block text-[12.5px] font-semibold text-danger underline"
            >
              Pedir um novo link
            </Link>
          </div>
        )}

        <Button type="submit" className="mt-1 w-full" loading={isSubmitting}>
          Salvar senha nova
        </Button>
      </form>
    </div>
  )
}
