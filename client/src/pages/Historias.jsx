import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../api/client.js'
import { useAuth } from '../context/useAuth.js'

function Historias() {
  const { t, i18n } = useTranslation()
  const { usuario } = useAuth()

  const [historias, setHistorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  const [contenido, setContenido] = useState('')
  const [publicando, setPublicando] = useState(false)
  const [errorPublicar, setErrorPublicar] = useState('')

  // Estado del reporte de cada historia, por id: 'reportando', 'reportado',
  // o un mensaje de error. Así cada tarjeta reacciona de forma
  // independiente sin necesitar un estado por separado por historia.
  const [estadoReportes, setEstadoReportes] = useState({})

  useEffect(() => {
    // Solo se usa aquí, al montar la página, así que vive dentro del
    // propio efecto en vez de como función aparte.
    async function cargarHistorias() {
      setCargando(true)
      setErrorCarga('')
      try {
        const datos = await apiFetch('/api/historias')
        setHistorias(datos)
      } catch {
        setErrorCarga(t('historias.error_cargar'))
      } finally {
        setCargando(false)
      }
    }

    cargarHistorias()
  }, [t])

  async function manejarPublicar(evento) {
    evento.preventDefault()
    setErrorPublicar('')
    setPublicando(true)

    try {
      const nuevaHistoria = await apiFetch('/api/historias', {
        method: 'POST',
        body: { contenido, idioma: i18n.resolvedLanguage },
      })
      setHistorias((actuales) => [nuevaHistoria, ...actuales])
      setContenido('')
    } catch (err) {
      setErrorPublicar(err.message || t('historias.error_publicar'))
    } finally {
      setPublicando(false)
    }
  }

  async function manejarReportar(historiaId) {
    setEstadoReportes((actuales) => ({ ...actuales, [historiaId]: 'reportando' }))

    try {
      await apiFetch(`/api/historias/${historiaId}/reportar`, { method: 'POST' })
      setEstadoReportes((actuales) => ({ ...actuales, [historiaId]: 'reportado' }))
    } catch (err) {
      setEstadoReportes((actuales) => ({
        ...actuales,
        [historiaId]: err.message || t('historias.error_reportar'),
      }))
    }
  }

  const localeFecha = i18n.resolvedLanguage === 'ca' ? 'ca-ES' : 'es-ES'

  return (
    <main className="am-community-page">
      <section className="am-community-hero">
        <div className="am-page-width am-community-hero__inner">
          <div>
            <span className="am-page-eyebrow">{t('historias.etiqueta')}</span>
            <h1>{t('historias.titulo')}</h1>
            <p>{t('historias.descripcion')}</p>
          </div>
          <div className="am-community-hero__note" aria-hidden="true">
            <span>♡</span>
            <strong>{t('historias.nota_titulo')}</strong>
            <small>{t('historias.nota_texto')}</small>
          </div>
        </div>
      </section>

      <section className="am-page-width am-community-layout">
        <div className="am-community-main">
          {usuario ? (
            <form className="am-composer" onSubmit={manejarPublicar}>
              <div className="am-composer__heading"><span aria-hidden="true">✎</span><div><strong>{t('historias.comparte_titulo')}</strong><small>{t('historias.comparte_texto')}</small></div></div>
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder={t('historias.placeholder_formulario')}
                rows={4}
                maxLength={5000}
                required
              />
              {errorPublicar && <p className="am-inline-error">{errorPublicar}</p>}
              <div className="am-composer__footer"><small>{contenido.length}/5000</small><button type="submit" disabled={publicando}>{publicando ? t('historias.publicando') : t('historias.boton_publicar')}</button></div>
            </form>
          ) : (
            <div className="am-join-card">
              <span className="am-join-card__icon" aria-hidden="true">☺</span>
              <div><h2>{t('historias.unete_titulo')}</h2><p>{t('historias.unete_texto')}</p></div>
              <div className="am-join-card__actions"><Link to="/login">{t('historias.inicia_sesion_enlace')}</Link><Link className="am-btn am-btn--primary" to="/registro">{t('historias.registrate_enlace')}</Link></div>
            </div>
          )}

          <div className="am-feed-heading"><div><span aria-hidden="true" />{t('historias.feed_etiqueta')}</div><h2>{t('historias.feed_titulo')}</h2></div>
          {cargando && <div className="am-status-card">{t('historias.cargando')}</div>}
          {errorCarga && <div className="am-status-card am-status-card--error"><span aria-hidden="true">!</span><div><strong>{t('historias.error_titulo')}</strong><p>{errorCarga}</p><small>{t('historias.error_ayuda')}</small></div></div>}
          {!cargando && !errorCarga && historias.length === 0 && <div className="am-status-card">{t('historias.vacio')}</div>}

          <div className="am-story-list">{historias.map((historia) => {
        const estadoReporte = estadoReportes[historia.id]
        const yaReportado = estadoReporte === 'reportado'
        const reportando = estadoReporte === 'reportando'
        const errorReporte = estadoReporte && !yaReportado && !reportando ? estadoReporte : ''

        return (
          <article key={historia.id} className="am-story-card">
            <div className="am-story-card__meta"><span className="am-story-avatar" aria-hidden="true">A</span><div><strong>{t('historias.autor_anonimo')}</strong><small>{new Date(historia.fecha_creacion).toLocaleDateString(localeFecha)} · {historia.idioma.toUpperCase()}</small></div></div>
            <p>{historia.contenido}</p>

            {usuario && (
              <div className="am-story-card__actions">
                <button
                  type="button"
                  onClick={() => manejarReportar(historia.id)}
                  disabled={reportando || yaReportado}
                >
                  {reportando
                    ? t('historias.reportando')
                    : yaReportado
                      ? t('historias.reportado')
                      : t('historias.boton_reportar')}
                </button>
                {errorReporte && (
                  <small className="am-inline-error">{errorReporte}</small>
                )}
              </div>
            )}
          </article>
        )
      })}</div>
        </div>

        <aside className="am-community-aside">
          <div className="am-aside-card"><span aria-hidden="true">🌿</span><h3>{t('historias.aside_titulo')}</h3><p>{t('historias.aside_texto')}</p><Link to="/nosotros">{t('historias.aside_enlace')} →</Link></div>
          <div className="am-aside-card am-aside-card--soft"><span aria-hidden="true">💬</span><h3>{t('historias.escucha_titulo')}</h3><p>{t('historias.escucha_texto')}</p><Link to="/conectar">{t('historias.escucha_enlace')} →</Link></div>
        </aside>
      </section>
    </main>
  )
}

export default Historias
