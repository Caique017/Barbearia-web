import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { LoginPage } from '../pages/auth/LoginPage'
import { BarbeiroLoginPage } from '../pages/auth/BarbeiroLoginPage'
import { CadastroPage } from '../pages/auth/CadastroPage'
import { AgendaPage } from '../pages/barbeiro/AgendaPage'
import { NovoAgendamentoPage } from '../pages/barbeiro/NovoAgendamentoPage'
import { DetalheAgendamentoPage } from '../pages/barbeiro/DetalheAgendamentoPage'
import { ServicosPage } from '../pages/barbeiro/ServicosPage'
import { DashboardPage } from '../pages/barbeiro/DashboardPage'
import { AgendamentoPage } from '../pages/cliente/AgendamentoPage'
import { HistoricoPage } from '../pages/cliente/HistoricoPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/barbeiro/login" element={<BarbeiroLoginPage />} />
      <Route path="/cadastro" element={<CadastroPage />} />
      <Route path="/agendar" element={<AgendamentoPage />} />

      {/* Barbeiro */}
      <Route element={<ProtectedRoute role="BARBEIRO" />}>
        <Route path="/barbeiro/agenda" element={<AgendaPage />} />
        <Route path="/barbeiro/agendamento/novo" element={<NovoAgendamentoPage />} />
        <Route path="/barbeiro/agendamento/:id" element={<DetalheAgendamentoPage />} />
        <Route path="/barbeiro/servicos" element={<ServicosPage />} />
        <Route path="/barbeiro/dashboard" element={<DashboardPage />} />
      </Route>

      {/* Cliente */}
      <Route element={<ProtectedRoute role="CLIENTE" />}>
        <Route path="/cliente/agendar" element={<AgendamentoPage />} />
        <Route path="/cliente/historico" element={<HistoricoPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
