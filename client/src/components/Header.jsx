import { Link, NavLink, useNavigate } from 'react-router-dom'
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

  const claseEnlace = ({ isActive }) =>
    isActive
      ? 'amentaran-nav__enlace amentaran-nav__enlace--activo'
      : 'amentaran-nav__enlace'

  return (
    <header className="amentaran-header">
      <Link to="/" className="amentaran-marca">
        <span className="amentaran-marca__hojas" aria-hidden="true">
          <span></span>
          <span></span>
        </span>

        <span className="amentaran-marca__texto">
          <strong>AMENTARAN</strong>
          <small>CONVERSACIONES QUE SOSTIENEN</small>
        </span>
      </Link>

      <nav className="amentaran-nav">
        <NavLink to="/" end className={claseEnlace}>
          {t('nav.inicio')}
        </NavLink>

        <NavLink to="/apoyo" className={claseEnlace}>
          {t('nav.apoyo')}
        </NavLink>

        <NavLink to="/nosotros" className={claseEnlace}>
          {t('nav.nosotros')}
        </NavLink>
      </nav>

      <div className="amentaran-header__acciones">
        <LanguageSwitcher />

        <span className="amentaran-header__separador"></span>

        {usuario ? (
          <div className="amentaran-usuario">
            {usuario.es_moderador && (
              <NavLink to="/moderacion" className={claseEnlace}>
                {t('nav.moderacion')}
              </NavLink>
            )}

            <span className="amentaran-usuario__email">
              {usuario.email}
            </span>

            <button
              type="button"
              className="amentaran-header__logout"
              onClick={manejarLogout}
            >
              {t('nav.logout')}
            </button>
          </div>
        ) : (
          <div className="amentaran-auth">
            <Link to="/login" className="amentaran-auth__login">
              {t('nav.login')}
            </Link>

            <Link to="/registro" className="amentaran-auth__registro">
              {t('nav.registro')}
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header