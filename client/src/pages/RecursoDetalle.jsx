import { useTranslation } from 'react-i18next'
import { Link, Navigate, useParams } from 'react-router-dom'

const recursosDisponibles = [
  'ansiedad',
  'crisis',
  'soledad',
  'autocuidado',
]

function RecursoDetalle() {
  const { slug } = useParams()
  const { t } = useTranslation()

  if (!recursosDisponibles.includes(slug)) {
    return <Navigate to="/recursos" replace />
  }

  const pasos = [1, 2, 3, 4]

  return (
    <main className="am-resource-detail">
      <section className="am-resource-detail__hero am-page-width">
        <Link className="am-resource-back" to="/recursos">
          ← {t('recurso_detalle.volver')}
        </Link>

        <span className="am-resources-eyebrow">
          {t(`recursos.${slug}.categoria`)}
        </span>

        <h1>{t(`recursos.${slug}.titulo`)}</h1>
        <p>{t(`recursos.${slug}.introduccion`)}</p>
      </section>

      <section className="am-resource-detail__content am-page-width">
        <article className="am-resource-guide">
          <h2>{t(`recursos.${slug}.pasos_titulo`)}</h2>

          <div className="am-resource-steps">
            {pasos.map((paso) => (
              <div className="am-resource-step" key={paso}>
                <span>{paso}</span>
                <div>
                  <h3>
                    {t(`recursos.${slug}.paso_${paso}_titulo`)}
                  </h3>
                  <p>
                    {t(`recursos.${slug}.paso_${paso}_texto`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="am-resource-aside">
          <div className="am-resource-reminder">
            <span aria-hidden="true">♡</span>
            <h2>{t('recurso_detalle.recordatorio_titulo')}</h2>
            <p>{t('recurso_detalle.recordatorio_texto')}</p>
          </div>

          <div className="am-resource-professional">
            <h2>{t('recurso_detalle.profesional_titulo')}</h2>
            <p>{t('recurso_detalle.profesional_texto')}</p>
            <Link to="/seguridad">
              {t('recurso_detalle.profesional_boton')}
            </Link>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default RecursoDetalle
