import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../api/client.js'
import { useAuth } from '../context/useAuth.js'

function MiCuenta() {
  const { t, i18n } = useTranslation()
  const { usuario, actualizarUsuario, logout } = useAuth()
  const navigate = useNavigate()

  const [perfil, setPerfil] = useState({
    nombre: usuario?.nombre || '',
    alias: usuario?.alias || '',
    email: usuario?.email || '',
    idioma_preferido: usuario?.idioma_preferido || i18n.resolvedLanguage || 'es',
    password_actual: '',
  })

  const [passwords, setPasswords] = useState({
    password_actual: '',
    password_nueva: '',
    password_confirmacion: '',
  })

  const [eliminacion, setEliminacion] = useState({
    abierta: false,
    password_actual: '',
    confirmacion: '',
  })

  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [guardandoPassword, setGuardandoPassword] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  const [mensajePerfil, setMensajePerfil] = useState('')
  const [errorPerfil, setErrorPerfil] = useState('')
  const [mensajePassword, setMensajePassword] = useState('')
  const [errorPassword, setErrorPassword] = useState('')
  const [errorEliminar, setErrorEliminar] = useState('')

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  function cambiarPerfil(evento) {
    const { name, value } = evento.target
    setPerfil((actual) => ({ ...actual, [name]: value }))
  }

  function cambiarPasswords(evento) {
    const { name, value } = evento.target
    setPasswords((actual) => ({ ...actual, [name]: value }))
  }

  function cambiarEliminacion(evento) {
    const { name, value } = evento.target
    setEliminacion((actual) => ({ ...actual, [name]: value }))
  }

  async function guardarPerfil(evento) {
    evento.preventDefault()
    setGuardandoPerfil(true)
    setMensajePerfil('')
    setErrorPerfil('')

    try {
      const respuesta = await apiFetch('/api/auth/perfil', {
        method: 'PATCH',
        body: perfil,
      })

      actualizarUsuario(respuesta.usuario)
      await i18n.changeLanguage(respuesta.usuario.idioma_preferido)

      setPerfil((actual) => ({
        ...actual,
        password_actual: '',
      }))

      setMensajePerfil(t('cuenta.perfil_guardado'))
    } catch (err) {
      setErrorPerfil(err.message || t('cuenta.error_perfil'))
    } finally {
      setGuardandoPerfil(false)
    }
  }

  async function cambiarPassword(evento) {
    evento.preventDefault()
    setGuardandoPassword(true)
    setMensajePassword('')
    setErrorPassword('')

    try {
      await apiFetch('/api/auth/cambiar-password', {
        method: 'POST',
        body: passwords,
      })

      setPasswords({
        password_actual: '',
        password_nueva: '',
        password_confirmacion: '',
      })

      setMensajePassword(t('cuenta.password_guardada'))
    } catch (err) {
      setErrorPassword(err.message || t('cuenta.error_password'))
    } finally {
      setGuardandoPassword(false)
    }
  }

  async function eliminarCuenta(evento) {
    evento.preventDefault()
    setEliminando(true)
    setErrorEliminar('')

    try {
      await apiFetch('/api/auth/cuenta', {
        method: 'DELETE',
        body: {
          password_actual: eliminacion.password_actual,
          confirmacion: eliminacion.confirmacion,
        },
      })

      logout()
      navigate('/')
    } catch (err) {
      setErrorEliminar(err.message || t('cuenta.error_eliminar'))
      setEliminando(false)
    }
  }

  const inicial = (
    usuario.nombre ||
    usuario.alias ||
    usuario.email
  ).charAt(0).toUpperCase()

  return (
    <main className="am-settings-page">
      <header className="am-page-width am-settings-hero">
        <span className="am-page-eyebrow">{t('cuenta.etiqueta')}</span>
        <h1>{t('cuenta.titulo')}</h1>
        <p>{t('cuenta.descripcion_ajustes')}</p>
      </header>

      <div className="am-page-width am-settings-layout">
        <aside className="am-settings-summary">
          <div className="am-settings-summary__avatar">{inicial}</div>
          <h2>{usuario.nombre || usuario.alias || t('cuenta.tu_cuenta')}</h2>
          <p>{usuario.email}</p>

          <span className="am-settings-summary__role">
            {usuario.rol === 'voluntario'
              ? t('cuenta.rol_voluntario')
              : t('cuenta.rol_apoyo')}
          </span>

          <div className="am-settings-privacy-note">
            <span aria-hidden="true">♡</span>
            <div>
              <strong>{t('cuenta.privacidad_titulo')}</strong>
              <p>{t('cuenta.privacidad_texto')}</p>
            </div>
          </div>
        </aside>

        <div className="am-settings-sections">
          <section className="am-settings-card">
            <div className="am-settings-card__heading">
              <span aria-hidden="true">♙</span>
              <div>
                <h2>{t('cuenta.informacion_titulo')}</h2>
                <p>{t('cuenta.informacion_texto')}</p>
              </div>
            </div>

            <form className="am-settings-form" onSubmit={guardarPerfil}>
              <div className="am-settings-form__grid">
                <label>
                  {t('cuenta.nombre')}
                  <input
                    name="nombre"
                    value={perfil.nombre}
                    onChange={cambiarPerfil}
                    maxLength="100"
                    placeholder={t('cuenta.nombre_placeholder')}
                  />
                </label>

                <label>
                  {t('cuenta.alias')}
                  <div className="am-input-prefix">
                    <span>@</span>
                    <input
                      name="alias"
                      value={perfil.alias}
                      onChange={cambiarPerfil}
                      maxLength="40"
                      placeholder={t('cuenta.alias_placeholder')}
                    />
                  </div>
                  <small>{t('cuenta.alias_ayuda')}</small>
                </label>
              </div>

              <label>
                {t('cuenta.correo')}
                <input
                  type="email"
                  name="email"
                  value={perfil.email}
                  onChange={cambiarPerfil}
                  maxLength="120"
                  required
                />
              </label>

              {perfil.email !== usuario.email && (
                <label>
                  {t('cuenta.password_para_email')}
                  <input
                    type="password"
                    name="password_actual"
                    value={perfil.password_actual}
                    onChange={cambiarPerfil}
                    autoComplete="current-password"
                    required
                  />
                  <small>{t('cuenta.password_para_email_ayuda')}</small>
                </label>
              )}

              <label>
                {t('cuenta.idioma')}
                <select
                  name="idioma_preferido"
                  value={perfil.idioma_preferido}
                  onChange={cambiarPerfil}
                >
                  <option value="es">Español</option>
                  <option value="ca">Català</option>
                </select>
              </label>

              {errorPerfil && <p className="am-inline-error">{errorPerfil}</p>}
              {mensajePerfil && <p className="am-session-notice">{mensajePerfil}</p>}

              <button className="am-btn am-btn--primary" type="submit" disabled={guardandoPerfil}>
                {guardandoPerfil
                  ? t('cuenta.guardando')
                  : t('cuenta.guardar_perfil')}
              </button>
            </form>
          </section>

          <section className="am-settings-card">
            <div className="am-settings-card__heading">
              <span aria-hidden="true">◇</span>
              <div>
                <h2>{t('cuenta.seguridad_titulo')}</h2>
                <p>{t('cuenta.seguridad_descripcion')}</p>
              </div>
            </div>

            <form className="am-settings-form" onSubmit={cambiarPassword}>
              <label>
                {t('cuenta.password_actual')}
                <input
                  type="password"
                  name="password_actual"
                  value={passwords.password_actual}
                  onChange={cambiarPasswords}
                  autoComplete="current-password"
                  required
                />
              </label>

              <div className="am-settings-form__grid">
                <label>
                  {t('cuenta.password_nueva')}
                  <input
                    type="password"
                    name="password_nueva"
                    value={passwords.password_nueva}
                    onChange={cambiarPasswords}
                    autoComplete="new-password"
                    minLength="8"
                    required
                  />
                </label>

                <label>
                  {t('cuenta.password_confirmacion')}
                  <input
                    type="password"
                    name="password_confirmacion"
                    value={passwords.password_confirmacion}
                    onChange={cambiarPasswords}
                    autoComplete="new-password"
                    minLength="8"
                    required
                  />
                </label>
              </div>

              <small>{t('cuenta.password_ayuda')}</small>

              {errorPassword && <p className="am-inline-error">{errorPassword}</p>}
              {mensajePassword && <p className="am-session-notice">{mensajePassword}</p>}

              <button className="am-btn am-btn--secondary" type="submit" disabled={guardandoPassword}>
                {guardandoPassword
                  ? t('cuenta.guardando')
                  : t('cuenta.cambiar_password')}
              </button>
            </form>
          </section>

          <section className="am-settings-card am-settings-card--privacy">
            <div className="am-settings-card__heading">
              <span aria-hidden="true">♡</span>
              <div>
                <h2>{t('cuenta.privacidad_titulo')}</h2>
                <p>{t('cuenta.privacidad_descripcion')}</p>
              </div>
            </div>

            <ul className="am-privacy-list">
              <li>{t('cuenta.privacidad_correo')}</li>
              <li>{t('cuenta.privacidad_historias')}</li>
              <li>{t('cuenta.privacidad_chat')}</li>
              <li>{t('cuenta.privacidad_datos')}</li>
            </ul>
          </section>

          <section className="am-settings-card am-settings-card--danger">
            <div className="am-settings-card__heading">
              <span aria-hidden="true">!</span>
              <div>
                <h2>{t('cuenta.eliminar_titulo')}</h2>
                <p>{t('cuenta.eliminar_texto')}</p>
              </div>
            </div>

            {!eliminacion.abierta ? (
              <button
                className="am-danger-outline"
                type="button"
                onClick={() => setEliminacion((actual) => ({
                  ...actual,
                  abierta: true,
                }))}
              >
                {t('cuenta.eliminar_boton')}
              </button>
            ) : (
              <form className="am-settings-form am-delete-account-form" onSubmit={eliminarCuenta}>
                <div className="am-delete-warning">
                  <strong>{t('cuenta.eliminar_aviso_titulo')}</strong>
                  <p>{t('cuenta.eliminar_aviso_texto')}</p>
                </div>

                <label>
                  {t('cuenta.password_actual')}
                  <input
                    type="password"
                    name="password_actual"
                    value={eliminacion.password_actual}
                    onChange={cambiarEliminacion}
                    autoComplete="current-password"
                    required
                  />
                </label>

                <label>
                  {t('cuenta.eliminar_confirmacion')}
                  <input
                    name="confirmacion"
                    value={eliminacion.confirmacion}
                    onChange={cambiarEliminacion}
                    placeholder="ELIMINAR"
                    autoComplete="off"
                    required
                  />
                </label>

                {errorEliminar && <p className="am-inline-error">{errorEliminar}</p>}

                <div className="am-delete-account-actions">
                  <button
                    type="button"
                    onClick={() => setEliminacion({
                      abierta: false,
                      password_actual: '',
                      confirmacion: '',
                    })}
                  >
                    {t('cuenta.cancelar')}
                  </button>

                  <button
                    className="am-danger-button"
                    type="submit"
                    disabled={
                      eliminando ||
                      eliminacion.confirmacion !== 'ELIMINAR'
                    }
                  >
                    {eliminando
                      ? t('cuenta.eliminando')
                      : t('cuenta.eliminar_definitivamente')}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

export default MiCuenta
