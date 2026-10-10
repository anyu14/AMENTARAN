import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import { useAuth } from '../context/useAuth.js'

function MountainLogo() {
  return <span className="am-logo-mark" aria-hidden="true"><svg viewBox="0 0 38 38"><circle cx="27.5" cy="10.5" r="3.5" /><path d="M5 27.5 13.2 17c.7-.9 1.9-.9 2.6 0l3.2 4.1 3.5-4.6c.7-.9 2-.9 2.7 0L33 27.5" /><path d="m10.5 27.5 4-5.1 3.7 4.7 3.1-4 3.6 4.4" /><path d="M5 27.5c4.5 1.5 9.1 1.8 14 .8 4.9-1 9.6-.8 14 .7" /></svg></span>
}

function Header() {
  const { t } = useTranslation()
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)

  function manejarLogout() { logout(); setMenuAbierto(false); navigate('/') }
  const claseEnlace = ({ isActive }) => isActive ? 'am-nav__link am-nav__link--active' : 'am-nav__link'
  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <header className="am-site-header">
      <div className="am-nav-wrap">
        <Link to="/" className="am-logo" onClick={cerrarMenu} aria-label="Amentaran - Inicio"><MountainLogo /><span>Amentaran</span></Link>
        <nav className={`am-nav ${menuAbierto ? 'am-nav--open' : ''}`} aria-label="Navegación principal">
          <NavLink to="/" end className={claseEnlace} onClick={cerrarMenu}>{t('nav.inicio')}</NavLink>
          <NavLink to="/historias" className={claseEnlace} onClick={cerrarMenu}>{t('nav.comunidad')}</NavLink>
          <NavLink to="/apoyo" className={claseEnlace} onClick={cerrarMenu}>{t('nav.recursos')}</NavLink>
          <NavLink to="/conectar" className={claseEnlace} onClick={cerrarMenu}>{t('nav.chat')}</NavLink>
          <div className="am-nav__mobile-auth">{!usuario && <><Link to="/login" onClick={cerrarMenu}>{t('nav.login')}</Link><Link className="am-header-btn" to="/registro" onClick={cerrarMenu}>{t('nav.crear_cuenta')}</Link></>}</div>
        </nav>

        <div className="am-header-actions">
          <LanguageSwitcher />
          {usuario ? (
            <div className="am-user-actions">{usuario.es_moderador && <Link to="/moderacion">{t('nav.moderacion')}</Link>}<span title={usuario.email}>{usuario.email}</span><button type="button" onClick={manejarLogout}>{t('nav.logout')}</button></div>
          ) : (
            <div className="am-auth-actions"><Link to="/login">{t('nav.login')}</Link><Link className="am-header-btn" to="/registro">{t('nav.crear_cuenta')}</Link></div>
          )}
        </div>

        <button type="button" className="am-menu-toggle" aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuAbierto} onClick={() => setMenuAbierto(!menuAbierto)}><span /><span /><span /></button>
      </div>
    </header>
  )
}

export default Header
