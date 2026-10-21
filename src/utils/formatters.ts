export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

/** "R$ 8.240" — sem centavos, como no design (stats e preços). */
export const formatCurrencyShort = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

/** "Terça, 7 de julho" — cabeçalho do seletor de dia da agenda. */
export const formatAgendaDate = (date: Date) => {
  const weekday = date
    .toLocaleDateString("pt-BR", { weekday: "long" })
    .replace(/-feira$/, "");
  const rest = date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${rest}`;
};

export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

export const formatTime = (dateStr: string) =>
  new Date(dateStr).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

/** "Terça, 7 de julho" — cabeçalho da agenda */
export const formatLongDate = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

/** YYYY-MM-DD para query params da API */
export const toISODate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const initials = (nome: string) =>
  nome
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/** "(11) 9 8123-4567" a partir dos dígitos que a API guarda. */
export const formatTelefone = (telefone: string) => {
  const d = telefone.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d[2]} ${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return telefone;
};

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Ter, 15 jul" — data curta de cards. */
export const dataCurta = (iso: string | Date) => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const dow = cap(d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""));
  const mes = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `${dow}, ${d.getDate()} ${mes}`;
};

/** Minutos entre o início e o fim de um agendamento. */
export const duracaoMinutos = (inicio: string, fim: string) =>
  Math.round((new Date(fim).getTime() - new Date(inicio).getTime()) / 60_000);

/** "09:00:00" ou "09:00" → "09:00". */
export const horaCurta = (hora: string) => hora.slice(0, 5);

/**
 * Data + "HH:mm" no formato que a API espera ("2026-10-21T09:00:00"):
 * hora de parede da barbearia, sem fuso.
 */
export const toLocalDateTime = (dia: Date, hora: string) =>
  `${toISODate(dia)}T${horaCurta(hora)}:00`;

/** "hoje", "amanhã" ou "em 21/10" — para mensagens. */
const quandoRelativo = (iso: string) => {
  const alvo = toISODate(new Date(iso));
  const hoje = new Date();
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);
  if (alvo === toISODate(hoje)) return "hoje";
  if (alvo === toISODate(amanha)) return "amanhã";
  return `em ${new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;
};

/** Link do WhatsApp com o lembrete do horário já escrito. */
export const whatsappLink = (telefone: string, nome: string, dataHora: string) =>
  `https://wa.me/55${telefone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Olá ${nome}, confirmando seu horário ${quandoRelativo(dataHora)} às ${formatTime(dataHora)}. Te esperamos! ✂️`,
  )}`;
