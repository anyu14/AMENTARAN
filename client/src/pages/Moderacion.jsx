import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../api/client.js'
import { useAuth } from '../context/useAuth.js'

function Moderacion() {
  const { t } = useTranslation()
  const { usuario } = useAuth()

  const [historias, setHistorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  // Estado de la acción (ocultar/mostrar) en curso por historia, igual
  // que en Historias.jsx con los reportes: cada tarjeta reacciona sola.
  const [accionEnCurso, setAccionEnCurso] = useState({})
  const [errorAccion, setErrorAccion] = useState({})

  useEffect(() => {
    if (!usuario || !usuario.es_moderador) {
      setCargando(false)
      return
    }

    async function cargarReportadas() {
      setCargando(true)
      setErrorCarga('')
      try {
        const datos = await apiFetch('/api/moderacion/historias-reportadas')
        setHistorias(datos)
      } catch {
        setErrorCarga(t('moderacion.error_cargar'))
      } finally {
        setCargando(false)
      }
    }

    cargarReportadas()
  }, [usuario, t])

  async function manejarAccion(historiaId, accion) {
    setAccionEnCurso((actuales) => ({ ...actuales, [historiaId]: accion }))
    setErrorAccion((actuales) => ({ ...actuales, [historiaId]: '' }))

    try {
      const actualizada = await apiFetch(`/api/moderacion/historias/${historiaId}/${accion}`, {
        method: 'POST',
      })
      setHistorias((actuales) =>
        actuales.map((h) => (h.id === historiaId ? { ...h, oculta: actualizada.oculta } : h))
      )
    } catch (err) {
      setErrorAccion((actuales) => ({
        ...actuales,
        [historiaId]: err.message || t('moderacion.error_accion'),
      }))
    } finally {
      setAccionEnCurso((actuales) => ({ ...actuales, [historiaId]: null }))
    }
  }

  if (!usuario || !usuario.es_moderador) {
    return (
      <section style={{ maxWidth: '640px', margin: '60px auto', padding: '0 20px' }}>
        <p>{t('moderacion.sin_permiso')}</p>
      </section>
    )
  }

  return (
    <section style={{ maxWidth: '640px', margin: '60px auto', padding: '0 20px' }}>
      <h2>{t('moderacion.titulo')}</h2>

      {cargando && <p>{t('moderacion.cargando')}</p>}
      {errorCarga && <p style={{ color: '#c0392b' }}>{errorCarga}</p>}
      {!cargando && !errorCarga && historias.length === 0 && <p>{t('moderacion.vacio')}</p>}

      {historias.map((historia) => {
        const accion = accionEnCurso[historia.id]
        const error = errorAccion[historia.id]

        return (
          <div
            key={historia.id}
            className="tarjeta"
            style={{ marginBottom: '16px', textAlign: 'left' }}
          >
            <p style={{ whiteSpace: 'pre-wrap' }}>{historia.contenido}</p>
            <small>
              {historia.idioma.toUpperCase()} ·{' '}
              {new Date(historia.fecha_creacion).toLocaleDateString()} ·{' '}
              {historia.cantidad_reportes} {t('moderacion.cantidad_reportes')}
              {historia.oculta && (
                <>
                  {' · '}
                  <strong>{t('moderacion.etiqueta_oculta')}</strong>
                </>
              )}
            </small>

            {historia.motivos.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <small>
                  <strong>{t('moderacion.motivos_titulo')}</strong> {historia.motivos.join(' · ')}
                </small>
              </div>
            )}

            <div style={{ marginTop: '8px' }}>
              {historia.oculta ? (
                <button
                  onClick={() => manejarAccion(historia.id, 'mostrar')}
                  disabled={accion === 'mostrar'}
                >
                  {accion === 'mostrar' ? t('moderacion.mostrando') : t('moderacion.boton_mostrar')}
                </button>
              ) : (
                <button
                  onClick={() => manejarAccion(historia.id, 'ocultar')}
                  disabled={accion === 'ocultar'}
                >
                  {accion === 'ocultar' ? t('moderacion.ocultando') : t('moderacion.boton_ocultar')}
                </button>
              )}
              {error && <small style={{ color: '#c0392b', marginLeft: '8px' }}>{error}</small>}
            </div>
          </div>
        )
      })}
    </section>
  )
}

export default Moderacion
