import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { LoginPage } from "../pages/auth/LoginPage";
import { BarbeiroLoginPage } from "../pages/auth/BarbeiroLoginPage";
import { CadastroPage } from "../pages/auth/CadastroPage";
import { BarbeiroCadastroPage } from "../pages/auth/BarbeiroCadastroPage";
import { BarbeariaPage } from "../pages/publico/BarbeariaPage";
import { EsqueciSenhaPage } from "../pages/auth/EsqueciSenhaPage";
import { RedefinirSenhaPage } from "../pages/auth/RedefinirSenhaPage";
import { AgendaPage } from "../pages/barbeiro/AgendaPage";
import { NovoAgendamentoPage } from "../pages/barbeiro/NovoAgendamentoPage";
import { DetalheAgendamentoPage } from "../pages/barbeiro/DetalheAgendamentoPage";
import { ServicosPage } from "../pages/barbeiro/ServicosPage";
import { DashboardPage } from "../pages/barbeiro/DashboardPage";
import { ClientesPage } from "../pages/barbeiro/ClientesPage";
import { PerfilPage } from "../pages/barbeiro/PerfilPage";
import { PlanoPage } from "../pages/barbeiro/PlanoPage";
import { AgendamentoPage } from "../pages/cliente/AgendamentoPage";
import { HistoricoPage } from "../pages/cliente/HistoricoPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/barbeiro/login" element={<BarbeiroLoginPage />} />
      <Route path="/barbeiro/cadastro" element={<BarbeiroCadastroPage />} />
      <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
      {/* Destino do link que a API manda por e-mail: /redefinir-senha?token=... */}
      <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
      <Route path="/b/:slug" element={<BarbeariaPage />} />
      <Route path="/b/:slug/cadastro" element={<CadastroPage />} />
      {/* Agendar online exige conta: o fluxo é o do cliente logado. */}
      <Route path="/agendar" element={<Navigate to="/cliente/agendar" replace />} />

      {/* Barbeiro */}
      <Route element={<ProtectedRoute role="BARBEIRO" />}>
        <Route path="/barbeiro/agenda" element={<AgendaPage />} />
        <Route
          path="/barbeiro/agendamento/novo"
          element={<NovoAgendamentoPage />}
        />
        <Route
          path="/barbeiro/agendamento/:id"
          element={<DetalheAgendamentoPage />}
        />
        <Route path="/barbeiro/servicos" element={<ServicosPage />} />
        <Route path="/barbeiro/dashboard" element={<DashboardPage />} />
        <Route path="/barbeiro/clientes" element={<ClientesPage />} />
        <Route path="/barbeiro/perfil" element={<PerfilPage />} />
        {/* Destino de volta do Stripe: /barbeiro/plano?pagamento=ok */}
        <Route path="/barbeiro/plano" element={<PlanoPage />} />
      </Route>

      {/* Cliente */}
      <Route element={<ProtectedRoute role="CLIENTE" />}>
        <Route path="/cliente/agendar" element={<AgendamentoPage />} />
        <Route path="/cliente/historico" element={<HistoricoPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
