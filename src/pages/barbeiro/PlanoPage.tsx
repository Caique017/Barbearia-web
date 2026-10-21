import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../../components/layout/AppShell'
import { PanelShell } from '../../components/layout/PanelShell'
import { TopBar } from '../../components/layout/TopBar'
import { Button, Card, Carregando, ErroCarregar } from '../../components/ui'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { useCarregar } from '../../hooks/useCarregar'
import { assinaturaApi } from '../../api/assinatura'
import { apiErrorMessage } from '../../api/axios'
import type { Assinatura, FormaPagamento } from '../../types'
import { formatCurrency } from '../../utils/formatters'

const dataLonga = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

function resumo(a: Assinatura) {
  if (!a.ativa) {
    return {
      titulo: 'Assinatura vencida',
      texto: 'Sua agenda e seus dados continuam aqui, só para consulta. Assine para voltar a agendar, editar e receber agendamentos pelo link.',
      cor: 'text-danger',
    }
  }
  const ate = a.liberadaAte ?? a.testeAte
  const dias = `${a.diasRestantes} ${a.diasRestantes === 1 ? 'dia' : 'dias'}`
  switch (a.status) {
    case 'TESTE':
      return { titulo: 'Teste grátis', texto: `Faltam ${dias} — até ${dataLonga(a.testeAte)}.`, cor: 'text-brand' }
    case 'PAGAMENTO_PENDENTE':
      return {
        titulo: 'Pagamento pendente',
        texto: `A última cobrança falhou. O acesso vale até ${dataLonga(ate)}; atualize o cartão para não perder.`,
        cor: 'text-alert',
      }
    case 'CANCELADA':
      return { titulo: 'Assinatura cancelada', texto: `O acesso vale até ${dataLonga(ate)}.`, cor: 'text-alert' }
    default:
      return {
        titulo: 'Assinatura ativa',
        texto:
          a.formaPagamento === 'PIX'
            ? `Pago no Pix até ${dataLonga(ate)} (${dias}). Avisamos por e-mail 3 dias antes.`
            : `Renova sozinha no cartão. Período atual até ${dataLonga(ate)}.`,
        cor: 'text-brand',
      }
  }
}

export function PlanoPage() {
  const [params] = useSearchParams()
  const voltouDoPagamento = params.get('pagamento') === 'ok'
  const { dados: a, erro, carregando, recarregar } = useCarregar(assinaturaApi.consultar)
  const [indo, setIndo] = useState<FormaPagamento | 'PORTAL' | null>(null)
  const [erroAcao, setErroAcao] = useState<string | null>(null)
  const isDesktop = useIsDesktop()

  const redirecionar = async (alvo: FormaPagamento | 'PORTAL') => {
    setIndo(alvo)
    setErroAcao(null)
    try {
      const url = alvo === 'PORTAL' ? await assinaturaApi.portal() : await assinaturaApi.checkout(alvo)
      window.location.href = url
    } catch (e) {
      setErroAcao(apiErrorMessage(e))
      setIndo(null)
    }
  }

  const conteudo = !a ? (
    carregando ? (
      <Carregando />
    ) : (
      <ErroCarregar mensagem={erro ?? 'Não foi possível carregar.'} onTentar={recarregar} />
    )
  ) : (
    (() => {
      const r = resumo(a)
      const assinaNoCartao = a.formaPagamento === 'CARTAO' && a.status !== 'CANCELADA'
      return (
        <div className="flex max-w-[560px] flex-col gap-4">
          {voltouDoPagamento && (
            <div className="rounded-card bg-brand-tint-2 px-4 py-3 text-[13px] leading-relaxed text-brand-hover">
              Pagamento recebido pelo Stripe. A liberação chega em instantes — no Pix, assim que o banco confirmar.{' '}
              <button onClick={recarregar} className="font-semibold underline">
                Atualizar
              </button>
            </div>
          )}

          <Card className="p-5">
            <div className={`text-[11px] font-semibold uppercase tracking-[0.7px] ${r.cor}`}>{r.titulo}</div>
            <p className="m-0 mt-2 text-[14px] leading-relaxed text-ink-2">{r.texto}</p>
          </Card>

          <div className="relative overflow-hidden rounded-card bg-ink p-5 text-white">
            <div className="absolute right-[34px] top-0 h-[90px] w-[22px] bg-brand opacity-85 [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
            <div className="absolute right-3 top-0 h-[90px] w-[22px] bg-brand-light opacity-85 [clip-path:polygon(0_0,100%_0,55%_100%,-45%_100%)]" />
            <div className="relative">
              <div className="text-[11px] font-semibold uppercase tracking-[0.7px] text-white/55">ClipBook · tudo incluso</div>
              <div className="mt-1 text-[34px] font-semibold leading-none">
                {formatCurrency(a.precoMensal)}
                <span className="text-[14px] font-medium text-white/60"> /mês</span>
              </div>
              <ul className="m-0 mt-4 flex list-none flex-col gap-1.5 p-0 text-[13px] text-white/75">
                <li>✓ Agenda, link público e horários livres</li>
                <li>✓ Carteira de clientes e lembretes no WhatsApp</li>
                <li>✓ Financeiro com lucro real e mix de serviços</li>
              </ul>
            </div>
          </div>

          {!assinaNoCartao && (
            <>
              <Button className="w-full" loading={indo === 'CARTAO'} disabled={indo !== null} onClick={() => redirecionar('CARTAO')}>
                Assinar no cartão
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                loading={indo === 'PIX'}
                disabled={indo !== null}
                onClick={() => redirecionar('PIX')}
              >
                Pagar 1 mês no Pix
              </Button>
              <p className="m-0 text-center text-[12px] leading-relaxed text-muted">
                Cartão renova sozinho todo mês. Pix libera 30 dias, somados ao que ainda resta.
              </p>
            </>
          )}

          {a.formaPagamento && (
            <Button
              variant="secondary"
              className="w-full border-input-border text-ink"
              loading={indo === 'PORTAL'}
              disabled={indo !== null}
              onClick={() => redirecionar('PORTAL')}
            >
              Gerenciar pagamento
            </Button>
          )}

          {erroAcao && <p className="m-0 text-center text-[13px] text-danger">{erroAcao}</p>}
          <p className="m-0 text-center text-[11.5px] text-muted-2">O pagamento é feito na página segura do Stripe.</p>
        </div>
      )
    })()
  )

  if (isDesktop) {
    return (
      <PanelShell>
        <h2 className="mb-6 text-[26px] font-medium text-ink">Plano</h2>
        {conteudo}
      </PanelShell>
    )
  }

  return (
    <AppShell className="bg-screen">
      <TopBar title="Plano" to="/barbeiro/perfil" />
      <div className="flex flex-1 flex-col px-[22px] pb-6 pt-3">{conteudo}</div>
    </AppShell>
  )
}
