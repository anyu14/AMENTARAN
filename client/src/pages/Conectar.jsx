import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../api/client.js'
import { useAuth } from '../context/useAuth.js'
import Chat from '../components/Chat.jsx'
import chatConversation from '../assets/chat-conversation.jpg'

function Conectar() {
  const { t } = useTranslation()
  const { usuario } = useAuth()

  const [sesion, setSesion] = useState(null)
  const [disponible, setDisponible] = useState(usuario?.disponible ?? false)
  // Solo hay algo que cargar si hay sesión iniciada; si no, no hace
  // falta pedir nada al backend ni mostrar un estado de carga.
  const [cargando, setCargando] = useState(!!usuario)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    if (!usuario) {
      return
    }

    async function cargarSesionActiva() {
      try {
        const datos = await apiFetch('/api/matching/activa')
        setSesion(datos)
      } catch {
        // Si falla, simplemente no mostramos ninguna sesión activa.
      } finally {
        setCargando(false)
      }
    }

    cargarSesionActiva()
  }, [usuario])

  async function manejarDisponibilidad() {
    setError('')
    setProcesando(true)
    try {
      const datos = await apiFetch('/api/matching/disponibilidad', {
        method: 'PATCH',
        body: { disponible: !disponible },
      })
      setDisponible(datos.disponible)
    } catch (err) {
      setError(err.message || t('conectar.error_generico'))
    } finally {
      setProcesando(false)
    }
  }

  async function manejarConectar() {
    setError('')
    setAviso('')
    setProcesando(true)
    try {
      const nuevaSesion = await apiFetch('/api/matching/conectar', { method: 'POST' })
      setSesion(nuevaSesion)
    } catch (err) {
      // 409 = "no hay voluntarios disponibles": usamos nuestro propio
      // texto traducido en vez del mensaje del backend, que siempre
      // viene en español.
      if (err.status === 409) {
        setError(t('conectar.busca_sin_voluntarios'))
      } else {
        setError(err.message || t('conectar.error_generico'))
      }
    } finally {
      setProcesando(false)
    }
  }

  async function manejarFinalizar() {
    setError('')
    setProcesando(true)
    try {
      await apiFetch(`/api/matching/${sesion.id}/finalizar`, { method: 'POST' })
      setSesion(null)
      // El backend nunca reactiva la disponibilidad automáticamente al
      // finalizar, así que reflejamos eso mismo acá para no mostrar un
      // estado "disponible" que ya no es cierto.
      if (usuario.rol === 'voluntario') {
        setDisponible(false)
      }
    } catch (err) {
      setError(err.message || t('conectar.error_generico'))
    } finally {
      setProcesando(false)
    }
  }

  const manejarFinalizacionRemota = useCallback(() => {
    setSesion(null)
    setError('')
    setAviso(t('conectar.sesion_finalizada_otro'))
  }, [t])

  if (!usuario) {
    return (
      <main className="am-connect-page">
        <section className="am-connect-guest am-page-width">
          <div className="am-connect-guest__visual">
            <img src={chatConversation} alt={t('conectar.imagen_alt')} />
            <span className="am-chat-bubble am-chat-bubble--one" aria-hidden="true">{t('conectar.burbuja')}</span>
            <span className="am-chat-bubble am-chat-bubble--two" aria-hidden="true">♡</span>
          </div>
          <div className="am-connect-guest__copy">
            <span className="am-page-eyebrow">{t('conectar.etiqueta')}</span>
            <h1>{t('conectar.titulo')}</h1>
            <p>{t('conectar.descripcion')}</p>
            <div className="am-connect-benefits"><span>✓ {t('conectar.beneficio_uno')}</span><span>✓ {t('conectar.beneficio_dos')}</span><span>✓ {t('conectar.beneficio_tres')}</span></div>
            <div className="am-connect-actions"><Link className="am-btn am-btn--primary" to="/login">{t('conectar.inicia_sesion_enlace')}</Link><Link className="am-btn am-btn--secondary" to="/registro">{t('conectar.registrate_enlace')}</Link></div>
            <small>{t('conectar.aviso')}</small>
          </div>
        </section>
      </main>
    )
  }

  if (cargando) {
    return (
      <main className="am-connect-page"><section className="am-connect-panel am-page-width"><h1>{t('conectar.titulo')}</h1><p>{t('auth.cargando')}</p></section></main>
    )
  }

  return (
    <main className="am-connect-page">
      <section className="am-connect-panel am-page-width">
      <div className="am-connect-panel__heading"><span className="am-page-eyebrow">{t('conectar.etiqueta')}</span><h1>{t('conectar.titulo')}</h1><p>{t('conectar.descripcion_usuario')}</p></div>

      {error && <p className="am-inline-error">{error}</p>}
      {aviso && <p className="am-session-notice">{aviso}</p>}

      {sesion ? (
        <div className="am-chat-session">
          <header className="am-chat-session__header">
            <div className="am-chat-session__avatar" aria-hidden="true">A</div>
            <div>
              <h3>{t('conectar.sesion_activa_titulo')}</h3>
              <p>
                <span className="am-chat-online-dot" aria-hidden="true" />
                {t('conectar.sesion_activa_desde')}{' '}
                {new Date(sesion.fecha_inicio).toLocaleString()}
              </p>
            </div>
          </header>

          <Chat sesionId={sesion.id} onSesionFinalizada={manejarFinalizacionRemota} />

          <footer className="am-chat-session__footer">
            <button className="am-danger-button" onClick={manejarFinalizar} disabled={procesando}>
              {procesando ? t('conectar.finalizando') : t('conectar.boton_finalizar')}
            </button>
          </footer>
        </div>
      ) : usuario.rol === 'voluntario' ? (
        <div className="am-connect-role-card">
          <span className="am-connect-role-card__icon" aria-hidden="true">♡</span><h2>{t('conectar.voluntario_titulo')}</h2><p>
            {disponible
              ? t('conectar.voluntario_disponible_true')
              : t('conectar.voluntario_disponible_false')}
          </p>
          <button className="am-btn am-btn--primary" onClick={manejarDisponibilidad} disabled={procesando}>
            {disponible
              ? t('conectar.voluntario_boton_marcar_no_disponible')
              : t('conectar.voluntario_boton_marcar_disponible')}
          </button>
        </div>
      ) : (
        <div className="am-connect-role-card">
          <span className="am-connect-role-card__icon" aria-hidden="true">💬</span><h2>{t('conectar.busca_titulo')}</h2><p>{t('conectar.busca_sin_sesion_texto')}</p>
          <button className="am-btn am-btn--primary" onClick={manejarConectar} disabled={procesando}>
            {procesando ? t('conectar.busca_conectando') : t('conectar.busca_boton_conectar')}
          </button>
        </div>
      )}
      </section>
    </main>
  )
}

export default Conectar
