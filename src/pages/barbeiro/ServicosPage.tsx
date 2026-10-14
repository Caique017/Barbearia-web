import { useState } from 'react'
import { AppShell } from '../../components/layout/AppShell'
import { PanelShell } from '../../components/layout/PanelShell'
import { Button, Input, Modal } from '../../components/ui'
import { useIsDesktop } from '../../hooks/useMediaQuery'
import { mockServicos } from '../../data/mock'
import type { Servico } from '../../types'
import { formatCurrencyShort } from '../../utils/formatters'

interface FormState {
  nome: string
  preco: string
  duracaoMinutos: string
  custoInsumo: string
}

const emptyForm: FormState = { nome: '', preco: '', duracaoMinutos: '', custoInsumo: '' }

export function ServicosPage() {
  // TODO: integrar com API — GET /barbeiro/servicos
  const [servicos, setServicos] = useState<Servico[]>(mockServicos)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Servico | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [erro, setErro] = useState<string | null>(null)

  const ativos = servicos.filter((s) => s.ativo).length

  const alternarAtivo = (id: string) =>
    // TODO: integrar com API — PATCH /barbeiro/servicos/:id/ativo
    setServicos((prev) => prev.map((s) => (s.id === id ? { ...s, ativo: !s.ativo } : s)))

  const abrirNovo = () => {
    setEditando(null)
    setForm(emptyForm)
    setErro(null)
    setModalOpen(true)
  }

  const abrirEdicao = (s: Servico) => {
    setEditando(s)
    setForm({
      nome: s.nome,
      preco: String(s.preco),
      duracaoMinutos: String(s.duracaoMinutos),
      custoInsumo: String(s.custoInsumo),
    })
    setErro(null)
    setModalOpen(true)
  }

  const salvar = () => {
    const preco = Number(form.preco)
    const duracao = Number(form.duracaoMinutos)
    const custo = Number(form.custoInsumo)
    if (!form.nome.trim()) return setErro('Informe o nome do serviço.')
    if (!(preco > 0) || !(duracao > 0)) return setErro('Preço e duração devem ser maiores que zero.')

    // TODO: integrar com API — POST/PUT /barbeiro/servicos
    if (editando) {
      setServicos((prev) =>
        prev.map((s) =>
          s.id === editando.id
            ? { ...s, nome: form.nome, preco, duracaoMinutos: duracao, custoInsumo: custo }
            : s,
        ),
      )
    } else {
      setServicos((prev) => [
        ...prev,
        {
          id: `novo-${Date.now()}`,
          nome: form.nome,
          preco,
          duracaoMinutos: duracao,
          custoInsumo: custo,
          ativo: true,
        },
      ])
    }
    setModalOpen(false)
  }

  const servicoModal = (
    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar serviço' : 'Novo serviço'}>
      <div className="flex flex-col gap-3">
        <Input
          label="Nome"
          placeholder="Ex: Corte + Barba"
          value={form.nome}
          onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
        />
        <div className="flex gap-2.5">
          <Input
            label="Preço (R$)"
            type="number"
            inputMode="decimal"
            placeholder="65"
            className="flex-1"
            value={form.preco}
            onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
          />
          <Input
            label="Duração (min)"
            type="number"
            inputMode="numeric"
            placeholder="45"
            className="flex-1"
            value={form.duracaoMinutos}
            onChange={(e) => setForm((f) => ({ ...f, duracaoMinutos: e.target.value }))}
          />
        </div>
        <Input
          label="Custo de insumo (R$)"
          type="number"
          inputMode="decimal"
          placeholder="5"
          value={form.custoInsumo}
          onChange={(e) => setForm((f) => ({ ...f, custoInsumo: e.target.value }))}
        />
        {erro && <p className="text-[13px] text-danger">{erro}</p>}
        <Button className="mt-1 w-full" onClick={salvar}>
          {editando ? 'Salvar alterações' : 'Criar serviço'}
        </Button>
      </div>
    </Modal>
  )

  const isDesktop = useIsDesktop()

  /* ------------------------------- Desktop (D8) ------------------------------ */
  if (isDesktop) {
    return (
      <PanelShell>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[26px] font-medium text-ink">Serviços</h2>
          <Button className="h-11 px-5" onClick={abrirNovo}>
            + Novo serviço
          </Button>
        </div>

        <div className="max-w-[640px] rounded-card border border-line bg-surface px-5 shadow-card">
          {servicos.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 py-4 transition-opacity ${
                i < servicos.length - 1 ? 'border-b border-line-2' : ''
              } ${s.ativo ? 'opacity-100' : 'opacity-50'}`}
            >
              <div className="flex-1">
                <div className="text-[15px] font-semibold text-ink">{s.nome}</div>
                <div className="mt-0.5 text-[12px] text-muted">
                  {s.duracaoMinutos} min · insumo {formatCurrencyShort(s.custoInsumo)}
                </div>
              </div>
              <div className="text-[15px] font-semibold text-ink">{formatCurrencyShort(s.preco)}</div>
              <button
                onClick={() => abrirEdicao(s)}
                aria-label={`Editar ${s.nome}`}
                className="flex h-8 w-8 items-center justify-center rounded-field border-[1.5px] border-line bg-surface hover:bg-screen"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3d3d3d" strokeWidth="2">
                  <path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
                </svg>
              </button>
              <button
                onClick={() => alternarAtivo(s.id)}
                role="switch"
                aria-checked={s.ativo}
                aria-label={`${s.ativo ? 'Desativar' : 'Ativar'} ${s.nome}`}
                className={`relative h-[26px] w-11 flex-none rounded-full transition-colors ${
                  s.ativo ? 'bg-brand' : 'bg-input-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-[22px] w-[22px] rounded-full bg-white shadow transition-transform ${
                    s.ativo ? 'translate-x-[20px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
        {servicoModal}
      </PanelShell>
    )
  }

  /* -------------------------------- Mobile (2.7) ----------------------------- */
  return (
    <AppShell withNav>
      <div className="flex flex-none items-center justify-between px-[22px] pb-3 pt-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.9px] text-brand">Gestão</div>
          <h1 className="m-0 mt-0.5 text-[22px] font-medium text-ink">Serviços</h1>
        </div>
        <span className="rounded-lg border border-line bg-surface px-2.5 py-[5px] text-[12px] text-muted">
          {ativos} ativos
        </span>
      </div>

      <div className="flex flex-1 flex-col px-[22px] pb-4">
        {servicos.map((s) => (
          <div
            key={s.id}
            className={`flex items-center gap-3 border-b border-line-2 py-[15px] transition-opacity ${
              s.ativo ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <div className="flex-1">
              <div className="text-[15px] font-semibold text-ink">{s.nome}</div>
              <div className="mt-0.5 text-[12px] text-muted">
                {s.duracaoMinutos} min · insumo {formatCurrencyShort(s.custoInsumo)}
              </div>
            </div>
            <div className="text-[15px] font-semibold text-ink">{formatCurrencyShort(s.preco)}</div>
            <button
              onClick={() => abrirEdicao(s)}
              aria-label={`Editar ${s.nome}`}
              className="flex h-8 w-8 items-center justify-center rounded-field border-[1.5px] border-line bg-surface hover:bg-screen"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3d3d3d" strokeWidth="2">
                <path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
              </svg>
            </button>
            <button
              onClick={() => alternarAtivo(s.id)}
              role="switch"
              aria-checked={s.ativo}
              aria-label={`${s.ativo ? 'Desativar' : 'Ativar'} ${s.nome}`}
              className={`relative h-[26px] w-11 flex-none rounded-full transition-colors ${
                s.ativo ? 'bg-brand' : 'bg-input-border'
              }`}
            >
              <span
                className={`absolute top-0.5 h-[22px] w-[22px] rounded-full bg-white shadow transition-transform ${
                  s.ativo ? 'translate-x-[20px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 flex-none border-t border-line bg-surface px-5 pb-6 pt-3.5 shadow-[0_-2px_8px_rgba(26,26,26,.04)]">
        <Button className="w-full" onClick={abrirNovo}>
          + Novo serviço
        </Button>
      </div>

      {servicoModal}
    </AppShell>
  )
}
