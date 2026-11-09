import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AppRoutes } from './routes'
import { AvisoCookies } from './components/layout/AvisoCookies'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <AvisoCookies />
      </AuthProvider>
    </BrowserRouter>
  )
}
