import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import { useAuth } from '../context/useAuth.js'

function MountainLogo() {
  return (
    <span className="am-logo-mark" aria-hidden="true">
      <svg viewBox="0 0 38 38">
        <circle cx="27.5" cy="10.5" r="3.5" />
        <path d="M5 27.5 13.2 17c.7-.9 1.9-.9 2.6 0l3.2 4.1 3.5-4.6c.7-.9 2-.9 2.7 0L33 27.5" />
        <path d="m10.5 27.5 4-5.1 3.7 4.7 3.1-4 3.6 4.4" />
        <path d="M5 27.5c4.5 1.5 9.1 1.8 14 .8 4.9-1 9.6-.8 14 .7" />
      </svg>
    </span>
  )
}

function Header() {
  const { t } = useTranslation()
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const [menuAbierto, setMenuAbierto] = useState(false)
  const [cuentaAbierta, setCuentaAbierta] = useState(false)
  const cuentaRef = useRef(null)

  useEffect(() => {
    function cerrarAlPulsarFuera(evento) {
      if (cuentaRef.current && !cuentaRef.current.contains(evento.target)) {
        setCuentaAbierta(false)
      }
    }

    document.addEventListener('pointerdown', cerrarAlPulsarFuera)

    return () => {
      document.removeEventListener('pointerdown', cerrarAlPulsarFuera)
    }
  }, [])

  function cerrarMenus() {
    setMenuAbierto(false)
    setCuentaAbierta(false)
  }

  function manejarLogout() {
    logout()
    cerrarMenus()
    navigate('/')
  }

  const claseEnlace = ({ isActive }) =>
    isActive
      ? 'am-nav__link am-nav__link--active'
      : 'am-nav__link'

  const inicial = usuario?.email?.charAt(0).toUpperCase() || 'A'

  return (
    <header className="am-site-header">
      <div className="am-nav-wrap">
        <Link
          to="/"
          className="am-logo"
          onClick={cerrarMenus}
          aria-label="Amentaran - Inicio"
        >
          <MountainLogo />
          <span>Amentaran</span>
        </Link>

        <nav
          className={`am-nav ${menuAbierto ? 'am-nav--open' : ''}`}
          aria-label={t('nav.navegacion_principal')}
        >
          <NavLink to="/historias" className={claseEnlace} onClick={cerrarMenus}>
            {t('nav.comunidad')}
          </NavLink>

          <NavLink to="/conectar" className={claseEnlace} onClick={cerrarMenus}>
            {t('nav.chat')}
          </NavLink>

          <NavLink to="/apoyo" className={claseEnlace} onClick={cerrarMenus}>
            {t('nav.recursos')}
          </NavLink>

          <NavLink to="/talleres" className={claseEnlace} onClick={cerrarMenus}>
            {t('nav.talleres')}
          </NavLink>

          {!usuario && (
            <div className="am-nav__mobile-auth">
              <Link to="/login" onClick={cerrarMenus}>{t('nav.login')}</Link>
              <Link className="am-header-btn" to="/registro" onClick={cerrarMenus}>
                {t('nav.crear_cuenta')}
              </Link>
            </div>
          )}
        </nav>

        <div className="am-header-actions">
          <LanguageSwitcher />

          {usuario ? (
            <div className="am-account-menu" ref={cuentaRef}>
              <button
                type="button"
                className={`am-account-trigger ${cuentaAbierta ? 'am-account-trigger--open' : ''}`}
                aria-label={t('cuenta.abrir_menu')}
                aria-expanded={cuentaAbierta}
                onClick={() => setCuentaAbierta((abierta) => !abierta)}
              >
                <span className="am-account-avatar">{inicial}</span>
                <span className="am-account-chevron" aria-hidden="true">⌄</span>
              </button>

              {cuentaAbierta && (
                <div className="am-account-dropdown">
                  <div className="am-account-dropdown__identity">
                    <span className="am-account-avatar">{inicial}</span>
                    <div>
                      <strong>{t('cuenta.tu_cuenta')}</strong>
                      <small>{usuario.email}</small>
                    </div>
                  </div>

                  <div className="am-account-dropdown__links">
                    <Link to="/" onClick={cerrarMenus}>
                      <span aria-hidden="true">⌂</span>
                      {t('nav.inicio')}
                    </Link>

                    <Link to="/mi-cuenta" onClick={cerrarMenus}>
                      <span aria-hidden="true">♙</span>
                      {t('cuenta.mi_cuenta')}
                    </Link>

                    {usuario.gestiona_talleres && (
                      <Link to="/gestion/talleres" onClick={cerrarMenus}>
                        <span aria-hidden="true">✦</span>
                        {t('nav.gestion_talleres')}
                      </Link>
                    )}

                    {usuario.es_moderador && (
                      <Link to="/moderacion" onClick={cerrarMenus}>
                        <span aria-hidden="true">◉</span>
                        {t('nav.moderacion')}
                      </Link>
                    )}

                    <Link to="/seguridad" onClick={cerrarMenus}>
                      <span aria-hidden="true">♡</span>
                      {t('cuenta.seguridad')}
                    </Link>
                  </div>

                  <button
                    type="button"
                    className="am-account-logout"
                    onClick={manejarLogout}
                  >
                    <span aria-hidden="true">↪</span>
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="am-auth-actions">
              <Link to="/login">{t('nav.login')}</Link>
              <Link className="am-header-btn" to="/registro">
                {t('nav.crear_cuenta')}
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="am-menu-toggle"
          aria-label={menuAbierto ? t('nav.cerrar_menu') : t('nav.abrir_menu')}
          aria-expanded={menuAbierto}
          onClick={() => {
            setMenuAbierto((abierto) => !abierto)
            setCuentaAbierta(false)
          }}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}

export default Header
