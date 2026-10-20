import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

function Recursos() {
  const { t } = useTranslation()

  const recursos = [
    { id: 'ansiedad', icono: '〰', color: 'violeta' },
    { id: 'crisis', icono: '♡', color: 'coral' },
    { id: 'soledad', icono: '⌁', color: 'azul' },
    { id: 'autocuidado', icono: '✦', color: 'menta' },
  ]

  return (
    <main className="am-resources-page">
      <section className="am-resources-hero am-page-width">
        <span className="am-resources-eyebrow">
          {t('recursos.etiqueta')}
        </span>
        <h1>
          <span>{t('recursos.titulo')}</span>
          <em>{t('recursos.titulo_destacado')}</em>
        </h1>
        <p>{t('recursos.descripcion')}</p>
      </section>

      <section className="am-resources-list am-page-width">
        <div className="am-resources-grid">
          {recursos.map((recurso) => (
            <article
              className={`am-resource-card am-resource-card--${recurso.color}`}
              key={recurso.id}
            >
              <span className="am-resource-card__icon">
                {recurso.icono}
              </span>
              <p className="am-resource-card__type">
                {t(`recursos.${recurso.id}.categoria`)}
              </p>
              <h2>{t(`recursos.${recurso.id}.titulo`)}</h2>
              <p>{t(`recursos.${recurso.id}.resumen`)}</p>
              <Link to={`/recursos/${recurso.id}`}>
                {t('recursos.leer')} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="am-resources-help am-page-width">
        <div>
          <span className="am-resources-eyebrow">
            {t('recursos.ayuda_etiqueta')}
          </span>
          <h2>{t('recursos.ayuda_titulo')}</h2>
          <p>{t('recursos.ayuda_texto')}</p>
        </div>
        <Link className="am-btn am-btn--primary" to="/seguridad">
          {t('recursos.ayuda_boton')}
        </Link>
      </section>
    </main>
  )
}

export default Recursos
