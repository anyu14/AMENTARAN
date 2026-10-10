import { Link, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './App.css'
import Header from './components/Header.jsx'
import Inicio from './pages/Inicio.jsx'
import Apoyo from './pages/Apoyo.jsx'
import Nosotros from './pages/Nosotros.jsx'
import Registro from './pages/Registro.jsx'
import Login from './pages/Login.jsx'
import Historias from './pages/Historias.jsx'
import Conectar from './pages/Conectar.jsx'
import Moderacion from './pages/Moderacion.jsx'
import { useAuth } from './context/useAuth.js'

function App() {
  const { t } = useTranslation()
  const { sesionCaducada, limpiarAvisoSesion } = useAuth()

  return (
    <main>
      <Header />

      {sesionCaducada && (
        <div className="am-session-expired" role="alert">
          <span>{t('auth.sesion_caducada')}</span>
          <Link to="/login" onClick={limpiarAvisoSesion}>{t('auth.volver_login')}</Link>
          <button type="button" onClick={limpiarAvisoSesion} aria-label={t('auth.cerrar_aviso')}>×</button>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/apoyo" element={<Apoyo />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/historias" element={<Historias />} />
        <Route path="/conectar" element={<Conectar />} />
        <Route path="/moderacion" element={<Moderacion />} />
      </Routes>
    </main>
  )
}

export default App
