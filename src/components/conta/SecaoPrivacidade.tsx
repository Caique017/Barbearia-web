import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Checkbox, Input, Modal } from '../ui'
import { contaApi } from '../../api/conta'
import { apiErrorMessage } from '../../api/axios'
import { loginFor } from '../../utils/auth-routes'
import type { Preferencias, Role } from '../../types'

interface SecaoPrivacidadeProps {
  role: Role
}

/** Direitos do titular (LGPD): preferências de e-mail, baixar os dados e excluir a conta. */
export function SecaoPrivacidade({ role }: SecaoPrivacidadeProps) {
  const [preferencias, setPreferencias] = useState<Preferencias | null>(null)
  const [baixando, setBaixando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  useEffect(() => {
    contaApi.preferencias().then(setPreferencias).catch(() => undefined)
  }, [])

  const mudar = async (campo: keyof Preferencias, valor: boolean) => {
    setErro(null)
    try {
      setPreferencias(await contaApi.atualizarPreferencias({ [campo]: valor }))
    } catch (e) {
      setErro(apiErrorMessage(e, 'Não foi possível salvar a preferência.'))
    }
  }

  const baixar = async () => {
    setErro(null)
    setBaixando(true)
    try {
      const arquivo = await contaApi.baixarDados()
      const url = URL.createObjectURL(arquivo)
      const link = document.createElement('a')
      link.href = url
      link.download = 'meus-dados-clipbook.json'
      link.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setErro(apiErrorMessage(e, 'Não foi possível baixar os dados.'))
    } finally {
      setBaixando(false)
    }
  }

  return (
    <Card className="p-5">
      <h2 className="m-0 text-[16px] font-semibold text-ink">Privacidade e dados</h2>
      <p className="m-0 mt-1 text-[12.5px] leading-relaxed text-muted">
        Seus direitos pela LGPD. Veja a{' '}
        <Link to="/privacidade" className="font-semibold text-brand">
          Política de Privacidade
        </Link>
        .
      </p>

      {preferencias && (
        <fieldset className="mt-4 flex flex-col gap-2.5 border-0 p-0">
          <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.4px] text-muted">
            E-mails
          </legend>
          <Checkbox checked={preferencias.marketing} onChange={(e) => mudar('marketing', e.target.checked)}>
            Receber novidades do ClipBook
          </Checkbox>
          {role === 'BARBEIRO' && (
            <Checkbox checked={preferencias.lembretes} onChange={(e) => mudar('lembretes', e.target.checked)}>
              Receber o lembrete de renovação do Pix
            </Checkbox>
          )}
        </fieldset>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button variant="secondary" className="flex-1" loading={baixando} onClick={baixar}>
          Baixar meus dados
        </Button>
        <Button variant="destructiveOutline" className="flex-1" onClick={() => setExcluindo(true)}>
          Excluir minha conta
        </Button>
      </div>
      {erro && <p className="m-0 mt-2 text-[13px] text-danger">{erro}</p>}

      <ModalExcluir role={role} open={excluindo} onClose={() => setExcluindo(false)} />
    </Card>
  )
}

function ModalExcluir({ role, open, onClose }: { role: Role; open: boolean; onClose: () => void }) {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const confirmar = async () => {
    setErro(null)
    setEnviando(true)
    try {
      await contaApi.excluir(senha)
      localStorage.removeItem('token')
      window.location.href = loginFor(role)
    } catch (e) {
      setErro(apiErrorMessage(e, 'Não foi possível excluir a conta.'))
      setEnviando(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Excluir minha conta">
      <p className="mb-3 text-[14px] leading-relaxed text-ink-2">
        {role === 'BARBEIRO'
          ? 'Isso cancela a assinatura e apaga para sempre a barbearia, a agenda, os clientes e o caixa. Baixe os seus dados antes, se quiser guardar uma cópia.'
          : 'Isso cancela os seus agendamentos futuros e apaga a sua conta. O histórico de atendimentos continua com a barbearia.'}
      </p>
      <p className="mb-4 text-[13px] font-semibold text-danger">Não dá para desfazer.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          confirmar()
        }}
      >
        <Input
          label="Digite sua senha para confirmar"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          error={erro ?? undefined}
        />
        <div className="mt-4 flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Voltar
          </Button>
          <Button type="submit" variant="destructive" className="flex-1" loading={enviando} disabled={!senha}>
            Excluir
          </Button>
        </div>
      </form>
    </Modal>
  )
}
