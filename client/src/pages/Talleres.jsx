import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../api/client.js'
import { useAuth } from '../context/useAuth.js'

function Talleres() {
  const { t, i18n } = useTranslation()
  const { usuario } = useAuth()

  const [talleres, setTalleres] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false

    async function cargarTalleres() {
      try {
        const datos = await apiFetch('/api/talleres')

        if (!cancelado) {
          setTalleres(datos)
          setError('')
        }
      } catch (err) {
        if (!cancelado) {
          setError(err.message || t('talleres.error_cargar'))
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    cargarTalleres()

    return () => {
      cancelado = true
    }
  }, [t])

  const idiomaActual = i18n.resolvedLanguage === 'ca' ? 'ca' : 'es'
  const localeFecha = idiomaActual === 'ca' ? 'ca-ES' : 'es-ES'

  const talleresVisibles = talleres.filter(
    (taller) => taller.idioma === idiomaActual
  )

  function formatearFecha(fecha) {
    return new Intl.DateTimeFormat(localeFecha, {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(fecha))
  }

  return (
    <main className="am-workshops-page">
      <section className="am-workshops-hero">
        <div className="am-page-width am-workshops-hero__inner">
          <div>
            <span className="am-page-eyebrow">{t('talleres.etiqueta')}</span>

            <h1>
              {t('talleres.titulo')}{' '}
              <em>{t('talleres.titulo_destacado')}</em>
            </h1>

            <p>{t('talleres.descripcion')}</p>

            {usuario?.gestiona_talleres && (
              <Link
                className="am-btn am-btn--primary am-workshops-manage-link"
                to="/gestion/talleres"
              >
                {t('talleres.gestionar')}
              </Link>
            )}
          </div>

          <div className="am-workshops-hero__visual" aria-hidden="true">
            <span>🌿</span>
            <span>♡</span>
            <span>✦</span>
          </div>
        </div>
      </section>

      <section className="am-workshops-content am-page-width">
        <div className="am-workshops-heading">
          <span>{t('talleres.propuestas_etiqueta')}</span>
          <h2>{t('talleres.propuestas_titulo')}</h2>
          <p>{t('talleres.propuestas_texto')}</p>
        </div>

        {cargando && (
          <div className="am-status-card">
            {t('talleres.cargando')}
          </div>
        )}

        {error && (
          <div className="am-status-card am-status-card--error">
            <span aria-hidden="true">!</span>
            <div>
              <strong>{t('talleres.error_titulo')}</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!cargando && !error && talleresVisibles.length === 0 && (
          <section className="am-workshops-notice">
            <div className="am-workshops-notice__icon" aria-hidden="true">
              🌱
            </div>

            <div>
              <span>{t('talleres.aviso_etiqueta')}</span>
              <h2>{t('talleres.aviso_titulo')}</h2>
              <p>{t('talleres.aviso_texto')}</p>
            </div>

            <Link className="am-btn am-btn--secondary" to="/recursos">
              {t('talleres.boton_recursos')}
            </Link>
          </section>
        )}

        {!cargando && !error && talleresVisibles.length > 0 && (
          <div className="am-workshops-grid">
            {talleresVisibles.map((taller) => (
              <article
                className={`am-workshop-card am-workshop-card--real am-workshop-card--${taller.estado}`}
                key={taller.id}
              >
                <div className="am-workshop-card__top">
                  <span className="am-workshop-card__icon" aria-hidden="true">
                    🌿
                  </span>

                  <span className={`am-workshop-status am-workshop-status--${taller.estado}`}>
                    {t(`gestion_talleres.estados.${taller.estado}`)}
                  </span>
                </div>

                <p className="am-workshop-card__date">
                  {formatearFecha(taller.fecha_inicio)}
                </p>

                <h3>{taller.titulo}</h3>
                <p>{taller.descripcion}</p>

                <dl className="am-workshop-details">
                  <div>
                    <dt>{t('talleres.modalidad')}</dt>
                    <dd>
                      {t(`gestion_talleres.modalidades.${taller.modalidad}`)}
                    </dd>
                  </div>

                  {taller.lugar && (
                    <div>
                      <dt>{t('talleres.lugar')}</dt>
                      <dd>{taller.lugar}</dd>
                    </div>
                  )}

                  {taller.duracion_minutos && (
                    <div>
                      <dt>{t('talleres.duracion')}</dt>
                      <dd>{taller.duracion_minutos} min</dd>
                    </div>
                  )}

                  {taller.plazas && (
                    <div>
                      <dt>{t('talleres.plazas')}</dt>
                      <dd>{taller.plazas}</dd>
                    </div>
                  )}
                </dl>

                {taller.enlace && taller.estado === 'publicado' && (
                  <a
                    className="am-btn am-btn--primary am-workshop-card__link"
                    href={taller.enlace}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t('talleres.abrir_enlace')}
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Talleres
