import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import { useAuth } from '../context/useAuth.js'

function Header() {
  const { t } = useTranslation()
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  function manejarLogout() {
    logout()
    navigate('/')
  }

  return (
    <header>
      <h1>AMENTARAN</h1>

      <nav>
        <Link to="/">{t('nav.inicio')}</Link>
        <Link to="/apoyo">{t('nav.apoyo')}</Link>
        <Link to="/nosotros">{t('nav.nosotros')}</Link>
      </nav>

      {usuario ? (
        <div>
          <span>{usuario.email}</span>{' '}
          <button onClick={manejarLogout}>{t('nav.logout')}</button>
        </div>
      ) : (
        <div>
          <Link to="/login">{t('nav.login')}</Link>{' '}
          <Link to="/registro">{t('nav.registro')}</Link>
        </div>
      )}

      <LanguageSwitcher />
    </header>
  )
}

export default Header
