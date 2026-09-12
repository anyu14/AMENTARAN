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

  return (
    <section style={{ maxWidth: '640px', margin: '60px auto', padding: '0 20px' }}>
      <h2>{t('historias.titulo')}</h2>

      {usuario ? (
        <form onSubmit={manejarPublicar} style={{ marginBottom: '32px' }}>
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder={t('historias.placeholder_formulario')}
            rows={4}
            maxLength={5000}
            required
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
          {errorPublicar && <p style={{ color: '#c0392b' }}>{errorPublicar}</p>}
          <button type="submit" disabled={publicando}>
            {publicando ? t('historias.publicando') : t('historias.boton_publicar')}
          </button>
        </form>
      ) : (
        <p style={{ marginBottom: '32px' }}>
          {t('historias.inicia_sesion_pre')} <Link to="/login">{t('historias.inicia_sesion_enlace')}</Link>{' '}
          {t('historias.inicia_sesion_o')} <Link to="/registro">{t('historias.registrate_enlace')}</Link>.
        </p>
      )}

      {cargando && <p>{t('historias.cargando')}</p>}
      {errorCarga && <p style={{ color: '#c0392b' }}>{errorCarga}</p>}
      {!cargando && !errorCarga && historias.length === 0 && <p>{t('historias.vacio')}</p>}

      {historias.map((historia) => {
        const estadoReporte = estadoReportes[historia.id]
        const yaReportado = estadoReporte === 'reportado'
        const reportando = estadoReporte === 'reportando'
        const errorReporte = estadoReporte && !yaReportado && !reportando ? estadoReporte : ''

        return (
          <div
            key={historia.id}
            className="tarjeta"
            style={{ marginBottom: '16px', textAlign: 'left' }}
          >
            <p style={{ whiteSpace: 'pre-wrap' }}>{historia.contenido}</p>
            <small>
              {historia.idioma.toUpperCase()} ·{' '}
              {new Date(historia.fecha_creacion).toLocaleDateString()}
            </small>

            {usuario && (
              <div style={{ marginTop: '8px' }}>
                <button
                  onClick={() => manejarReportar(historia.id)}
                  disabled={reportando || yaReportado}
                  style={{ fontSize: '0.85em' }}
                >
                  {reportando
                    ? t('historias.reportando')
                    : yaReportado
                      ? t('historias.reportado')
                      : t('historias.boton_reportar')}
                </button>
                {errorReporte && (
                  <small style={{ color: '#c0392b', marginLeft: '8px' }}>{errorReporte}</small>
                )}
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}

export default Historias
