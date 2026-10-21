import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { TopBar } from "../../components/layout/TopBar";
import { Badge, Button, Carregando, ErroCarregar, Input, Modal } from "../../components/ui";
import { useCarregar } from "../../hooks/useCarregar";
import { agendaApi } from "../../api/agenda";
import { apiErrorMessage } from "../../api/axios";
import { statusConfig } from "../../utils/status";
import {
  cap,
  duracaoMinutos,
  formatCurrencyShort,
  formatTelefone,
  formatTime,
  initials,
  whatsappLink,
} from "../../utils/formatters";

const formatDetalheData = (iso: string) => {
  const d = new Date(iso);
  const weekday = cap(
    d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
  );
  const mes = d
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
  return `${weekday}, ${d.getDate()} ${mes} · ${formatTime(iso)}`;
};

export function DetalheAgendamentoPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { dados: ag, setDados, erro, carregando, recarregar } = useCarregar(
    () => agendaApi.detalhe(id),
    [id],
  );
  const [cancelOpen, setCancelOpen] = useState(false);
  const [remarcarOpen, setRemarcarOpen] = useState(false);
  const [novaData, setNovaData] = useState("");
  const [novaHora, setNovaHora] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  if (!ag) {
    return (
      <AppShell className="bg-screen">
        <TopBar title="Detalhes" to="/barbeiro/agenda" />
        {carregando ? (
          <Carregando />
        ) : (
          <ErroCarregar mensagem={erro ?? "Agendamento não encontrado."} onTentar={recarregar} />
        )}
      </AppShell>
    );
  }

  const confirmado = ag.status === "CONFIRMADO";

  const executar = async (acao: () => Promise<void>) => {
    setOcupado(true);
    setErroAcao(null);
    try {
      await acao();
    } catch (e) {
      setErroAcao(apiErrorMessage(e));
    } finally {
      setOcupado(false);
    }
  };

  const concluir = () => executar(async () => setDados(await agendaApi.concluir(ag.id)));
  const falta = () => executar(async () => setDados(await agendaApi.falta(ag.id)));

  const cancelar = () =>
    executar(async () => {
      await agendaApi.cancelar(ag.id);
      navigate("/barbeiro/agenda");
    });

  const abrirRemarcar = () => {
    setNovaData(ag.dataHora.slice(0, 10));
    setNovaHora(ag.dataHora.slice(11, 16));
    setErroAcao(null);
    setRemarcarOpen(true);
  };

  const remarcar = () =>
    executar(async () => {
      if (!novaData || !novaHora) throw new Error();
      const novo = await agendaApi.remarcar(ag.id, `${novaData}T${novaHora}:00`);
      setRemarcarOpen(false);
      navigate(`/barbeiro/agendamento/${novo.id}`, { replace: true });
    });

  return (
    <AppShell className="bg-screen">
      <TopBar title="Detalhes" to="/barbeiro/agenda" />

      <div className="flex flex-1 flex-col px-[22px] pb-6 pt-2">
        {/* Cabeçalho do agendamento */}
        <div
          className={`mb-3.5 rounded-card border border-line border-l-4 ${statusConfig[ag.status].bar} bg-surface p-5 shadow-card`}
        >
          <Badge status={ag.status} />
          <div className="mb-0.5 mt-3 text-[26px] font-semibold text-ink">
            {formatDetalheData(ag.dataHora)}
          </div>
          <div className="text-[14px] text-muted">
            {ag.servico.nome} · {duracaoMinutos(ag.dataHora, ag.terminaEm)} min
          </div>
        </div>

        {/* Cliente */}
        <div className="mb-3.5 flex items-center gap-3 rounded-card border border-line bg-surface p-[15px] shadow-card">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-tint text-[15px] font-bold text-brand">
            {initials(ag.cliente.nome)}
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-semibold text-ink">
              {ag.cliente.nome}
            </div>
            <div className="text-[13px] text-muted">{formatTelefone(ag.cliente.telefone)}</div>
          </div>
          <a
            href={whatsappLink(ag.cliente.telefone, ag.cliente.nome, ag.dataHora)}
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir WhatsApp"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-brand-tint text-brand"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.6 15l-1.4 5 5.1-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.6.7.7-2.5-.2-.3A8 8 0 0 1 12 4z" />
            </svg>
          </a>
        </div>

        {/* Valor */}
        <div className="flex items-center justify-between rounded-card bg-ink p-4">
          <span className="text-[13.5px] font-medium text-white">
            Valor do serviço
          </span>
          <span className="text-[20px] font-semibold text-white">
            {formatCurrencyShort(ag.preco)}
          </span>
        </div>

        {erroAcao && !remarcarOpen && !cancelOpen && (
          <p className="mt-3 text-[13px] text-danger">{erroAcao}</p>
        )}
      </div>

      {/* Ações — só um agendamento confirmado ainda muda */}
      {confirmado && (
        <div className="sticky bottom-0 flex-none border-t border-line bg-surface px-5 pb-6 pt-3 shadow-[0_-2px_8px_rgba(26,26,26,.04)]">
          <div className="mb-2.5 flex gap-2.5">
            <Button size="sm" className="h-[46px] flex-1 text-[12px]" loading={ocupado} onClick={concluir}>
              Concluído
            </Button>
            <Button
              variant="destructiveOutline"
              size="sm"
              className="h-[46px] flex-1 text-[12px]"
              disabled={ocupado}
              onClick={falta}
            >
              Faltou
            </Button>
          </div>
          <div className="flex gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              className="h-[46px] flex-1 text-[12px]"
              disabled={ocupado}
              onClick={abrirRemarcar}
            >
              Remarcar
            </Button>
            <Button
              variant="destructiveOutline"
              size="sm"
              className="h-[46px] flex-1 text-[12px]"
              disabled={ocupado}
              onClick={() => {
                setErroAcao(null);
                setCancelOpen(true);
              }}
            >
              Cancelar
            </Button>
          </div>
          <p className="mt-2 text-center text-[12px] text-muted">
            Concluir e faltou só valem depois do horário marcado.
          </p>
        </div>
      )}

      {/* Modal de remarcação */}
      <Modal open={remarcarOpen} onClose={() => setRemarcarOpen(false)} title="Remarcar horário">
        <p className="mb-4 text-[13.5px] leading-relaxed text-ink-2">
          O horário atual fica livre e um novo agendamento é criado com o mesmo serviço e preço.
          Você pode marcar fora do expediente.
        </p>
        <div className="mb-4 flex gap-2.5">
          <Input
            label="Dia"
            type="date"
            className="flex-1"
            value={novaData}
            onChange={(e) => setNovaData(e.target.value)}
          />
          <Input
            label="Hora"
            type="time"
            step={300}
            className="w-[120px]"
            value={novaHora}
            onChange={(e) => setNovaHora(e.target.value)}
          />
        </div>
        {erroAcao && <p className="mb-3 text-[13px] text-danger">{erroAcao}</p>}
        <Button className="w-full" loading={ocupado} disabled={!novaData || !novaHora} onClick={remarcar}>
          Confirmar novo horário
        </Button>
      </Modal>

      {/* Modal de cancelamento */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)}>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-danger-tint">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#b3262b"
            strokeWidth="2.2"
          >
            <path d="M12 9v4M12 17h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          </svg>
        </div>
        <h2 className="mb-1.5 text-[23px] font-medium leading-tight text-ink">
          Cancelar este agendamento?
        </h2>
        <p className="mb-5 text-[14px] leading-relaxed text-ink-2">
          O horário volta a ficar disponível. Esta ação não pode ser desfeita.
        </p>
        <div className="mb-5 rounded-card border border-line border-l-4 border-l-danger bg-surface px-4 py-3.5 opacity-80">
          <div className="flex items-center gap-3">
            <div className="text-[18px] font-semibold text-ink">
              {formatTime(ag.dataHora)}
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-ink">
                {ag.cliente.nome}
              </div>
              <div className="text-[12.5px] text-muted">
                {ag.servico.nome} · {duracaoMinutos(ag.dataHora, ag.terminaEm)} min
              </div>
            </div>
          </div>
        </div>
        {erroAcao && <p className="mb-3 text-[13px] text-danger">{erroAcao}</p>}
        <Button
          variant="destructive"
          className="w-full"
          loading={ocupado}
          onClick={cancelar}
        >
          Confirmar cancelamento
        </Button>
        <Button
          variant="secondary"
          className="mt-2.5 w-full border-input-border text-ink"
          onClick={() => setCancelOpen(false)}
        >
          Voltar
        </Button>
      </Modal>
    </AppShell>
  );
}
