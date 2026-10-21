# Barbearia-web · ClipBook

Front-end do **ClipBook**, sistema de agendamento e gestão para o **barbeiro que trabalha sozinho**.

- O cliente agenda pelo link público da barbearia.
- O barbeiro cuida da agenda, dos clientes e dos serviços, e vê o lucro real do mês.
- O sistema reduz as faltas com lembrete no WhatsApp e mostra faturamento, custo de insumos, lucro líquido e o mix de serviços.

A API fica em [Caique017/Barbearia](https://github.com/Caique017/Barbearia).

> **Status (out/2026):** todas as telas estão ligadas à API, sem nenhum dado de mentira, e foram conferidas no navegador contra a API local. O CI roda em todo PR. O deploy na AWS (S3 + CloudFront) está pronto e espera a infraestrutura ser criada.

---

## Sumário

- [Telas](#telas)
- [Stack](#stack)
- [Como rodar](#como-rodar)
- [Scripts](#scripts)
- [Estrutura](#estrutura)
- [Como o front conversa com a API](#como-o-front-conversa-com-a-api)
- [Design](#design)
- [Segurança](#segurança)
- [CI/CD](#cicd)
- [Limitações conhecidas](#limitações-conhecidas)

---

## Telas

Cada tela tem layout de **celular** (coluna de 430px com barra inferior) e de **desktop** (a partir de 1024px, com barra lateral).

### Barbeiro

| Rota | Tela | O que dá para fazer |
|---|---|---|
| `/barbeiro/cadastro`, `/barbeiro/login` | Conta | Criar a barbearia (com 7 dias grátis) e entrar |
| `/barbeiro/agenda` | Agenda do dia | Navegar entre os dias, ver os confirmados e o previsto, concluir, marcar falta, lembrar no WhatsApp |
| `/barbeiro/agendamento/novo` | Novo agendamento | Escolher da carteira ou cadastrar o cliente na hora, o serviço, o dia (14 à frente) e um horário livre; ou "outro horário" fora do expediente |
| `/barbeiro/agendamento/:id` | Detalhe | Concluir, faltou, **remarcar** (dia e hora) e cancelar |
| `/barbeiro/clientes` | Carteira | Buscar, cadastrar, editar; **aprovar ou recusar** quem criou conta com o telefone de um cliente |
| `/barbeiro/servicos` | Serviços | Criar e editar (preço, duração, insumo); ativar e desativar |
| `/barbeiro/dashboard` | Financeiro | Faturamento, insumos e lucro do mês; variação sobre o mês anterior; mix de serviços com dica |
| `/barbeiro/perfil` | Perfil | Nome e horário da barbearia, **link com botão de copiar**, trocar o slug, **faixas de atendimento** por dia, **bloqueios** (dia inteiro, período ou faixa de horas), sair de todos os aparelhos |
| `/barbeiro/plano` | Plano | Teste ou assinatura, **assinar no cartão**, **pagar 1 mês no Pix**, gerenciar no portal do Stripe. É para cá que o Stripe volta (`?pagamento=ok`) |

Quando faltam 2 dias ou menos de acesso, ou quando a API responde **402** (assinatura vencida), aparece uma faixa no topo do painel com o link para o plano.

### Cliente

| Rota | Tela | O que dá para fazer |
|---|---|---|
| `/b/:slug` | Página da barbearia | Ver o nome e o horário; criar conta ou entrar |
| `/b/:slug/cadastro` | Cadastro | Conta já ligada àquela barbearia (o vínculo pode ficar pendente de aprovação) |
| `/login` | Login | Entrar como cliente |
| `/cliente/historico` | Histórico | Próximos horários (com cancelar), atendimentos anteriores, total de cortes e gasto |
| `/cliente/agendar` | Agendar | Serviço → dia → horário livre → confirmar, com "adicionar ao Google Agenda" |

### Senha

| Rota | Tela |
|---|---|
| `/esqueci-senha` | Pede o link (a resposta é a mesma, exista o e-mail ou não) |
| `/redefinir-senha?token=...` | Nova senha; o token sai da URL assim que a tela abre |

## Stack

| | |
|---|---|
| UI | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Estilo | Tailwind CSS 4 (tokens do design em `src/index.css`) |
| Rotas | React Router 7 |
| Formulários | React Hook Form + Zod |
| HTTP | Axios |
| Lint | Oxlint (zero avisos) |

## Como rodar

**Pré-requisitos:**
- Node.js 22;
- a [API](https://github.com/Caique017/Barbearia) rodando em `localhost:8080`.

```bash
npm install
npm run dev        # http://localhost:5173
```

O Vite faz proxy de `/api/*` para `http://localhost:8080`: tira o prefixo `/api` e **remove o header `Origin`**. Para a API, a chamada é de mesma origem, como em produção atrás do CloudFront. Sem isso, o CORS fechado da API recusaria todo POST.

> **Dica:** depois de atualizar dependências, rode o Vite com `--force` (ou apague `node_modules/.vite`). Um pré-bundle velho do `react-dom` com o `react` novo deixa a tela em branco ("Incompatible React versions").

> **Windows:** com o `npm run dev` aberto, o `npm ci` pode falhar com `EPERM`, porque um arquivo nativo fica travado. Feche o Vite ou use `npm install`.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento com HMR |
| `npm run build` | `tsc -b` + build de produção em `dist/` |
| `npm run lint` | Oxlint |
| `npm run preview` | serve o `dist/` localmente |

## Estrutura

```
src/
├── api/              um módulo por assunto, cada um com as rotas da API
│   ├── axios.ts        instância, token, 401 → login, 402 → evento de assinatura
│   ├── auth.ts         conta, sessão, senha, barbearia pública
│   ├── agenda.ts       agenda do barbeiro + disponibilidade
│   ├── barbeiro.ts     perfil, slug, faixas de horário, bloqueios
│   ├── carteira.ts     clientes do barbeiro e vínculo
│   ├── cliente.ts      rotas do cliente logado
│   ├── servico.ts      serviços (e a lista pública)
│   ├── financeiro.ts   resumo
│   └── assinatura.ts   status, checkout, portal
├── components/
│   ├── layout/       AppShell (celular), PanelShell + Sidebar (desktop), BottomNav,
│   │                 navegacao (itens únicos dos dois menus), AvisoAssinatura, ProtectedRoute
│   └── ui/           Button, Input (com mostrar senha), Card, Badge, Modal, Spinner,
│                     Carregando / ErroCarregar / Vazio
├── context/          AuthContext (token + /auth/me)
├── hooks/            useAuth, useCarregar, useMediaQuery / useIsDesktop
├── pages/            auth/, barbeiro/, cliente/, publico/
├── routes/           todas as rotas e a proteção por papel
├── types/            tipos espelhando os DTOs da API
└── utils/            formatação (moeda, data, telefone), dias, rotas de login, status, ícone de serviço
```

## Como o front conversa com a API

- **Token:** fica no `localStorage` e vai no `Authorization: Bearer` de toda requisição. O `AuthContext` hidrata o usuário com `GET /auth/me`.
- **401** fora do login: limpa o token e manda para o login do perfil certo, deduzido da URL.
- **402:** o interceptor dispara o evento `clipbook:assinatura-vencida`, e o `AvisoAssinatura` mostra a faixa "Assinar".
- **Erros:** `apiErrorMessage` lê a `mensagem` do envelope padrão da API; `apiFieldErrors` marca cada campo num 400.
- **Carregamento:** o hook `useCarregar(buscar, deps)` cuida de carregando, erro e "tentar de novo". Ele descarta respostas atrasadas quando as dependências mudam.
- **Sair:** chama `POST /auth/sair`, que encerra as sessões em todos os aparelhos.
- **Datas:** a API usa **hora de parede da barbearia, sem fuso** (`2026-10-22T10:00:00`). O front monta e lê nesse formato (`toLocalDateTime`, `toISODate`).
- **Disponibilidade:** quem calcula é sempre a API (`/barbeiros/publico/{slug}/disponibilidade`). O front só mostra a grade, e um horário tomado no meio do caminho volta como 409 e recarrega a grade.

## Design

O design system vem do arquivo de telas do ClipBook:
- azul `#024ad8` sobre neutros;
- fonte Inter;
- cards com borda e sombra suave;
- a faixa diagonal do "poste de barbeiro" como assinatura visual.

Os tokens (`brand`, `ink`, `muted`, `line`, `danger`, `teal`...) ficam no `@theme` do Tailwind, em `src/index.css`.

## Segurança

- **Nada de HTML vindo da API:** nenhum `dangerouslySetInnerHTML`, e o React escapa tudo.
- **Token de redefinição:** sai da URL assim que a tela abre, para não vazar pelo histórico nem pelo `Referer`.
- **Headers em produção:** o CloudFront aplica CSP (`default-src 'self'`, com Google Fonts liberado), HSTS, `nosniff`, `X-Frame-Options: DENY` e `Referrer-Policy: no-referrer`.
- **Dependências:** `npm audit --audit-level=high` no CI, Dependabot semanal (sem versão principal de TypeScript e `@types/node`) e secret scanning com push protection.

## CI/CD

- **CI (`.github/workflows/ci.yml`), em todo PR e push no `master`:** `npm ci`, lint, build e `npm audit`.
- **Deploy (`.github/workflows/deploy.yml`), depois do CI verde no `master`:**
  1. Login na AWS por **OIDC**, sem chave guardada.
  2. `npm run build` e `aws s3 sync`. Os assets vão com cache de 1 ano (o nome tem hash); o `index.html` vai sem cache.
  3. Invalidação do CloudFront.
- **Antes de existir a infra:** o deploy só roda quando as variáveis do repositório existem (`AWS_ROLE_ARN`, bucket e distribuição, que saem do `terraform output` da API) e quando o environment `producao` está criado.
- **SPA:** em produção, uma função do CloudFront manda as rotas sem extensão (`/barbeiro/agenda`) para o `index.html`. Assim, um 404 da API continua sendo 404.

## Limitações conhecidas

- **Ainda não está no ar.** A infraestrutura AWS espera o `terraform apply`.
- **Agendar online exige conta** (decisão da API). Não existe o fluxo de convidado.
- **Token no `localStorage`**, mitigado pela CSP. Cookie `HttpOnly` exigiria proteção CSRF.
- **Sessão de 2h sem refresh.** Quando vence, a tela volta para o login.
- **Sem testes automatizados de UI.** A conferência é manual no navegador; build, tipos e lint rodam no CI.
- **O bundle passa de 500 kB** (aviso do Vite). Dividir por rota com `import()` é o próximo passo, se o carregamento pesar.
