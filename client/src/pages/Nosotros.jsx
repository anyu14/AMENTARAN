import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

function Nosotros() {
  const { t, i18n } = useTranslation()

  const valores = [
    {
      icono: '♡',
      titulo: t('nosotros.valor_escucha_titulo'),
      texto: t('nosotros.valor_escucha_texto'),
      clase: 'violeta',
    },
    {
      icono: '✦',
      titulo: t('nosotros.valor_respeto_titulo'),
      texto: t('nosotros.valor_respeto_texto'),
      clase: 'menta',
    },
    {
      icono: '⌁',
      titulo: t('nosotros.valor_comunidad_titulo'),
      texto: t('nosotros.valor_comunidad_texto'),
      clase: 'coral',
    },
  ]

  return (
    <main className="am-about">
      <section className="am-about-hero am-page-width">
        <div className="am-about-hero__copy">
          <span className="am-about-eyebrow">{t('nosotros.etiqueta')}</span>

          <h1 key={i18n.resolvedLanguage}>
            <span>{t('nosotros.titulo')}</span>
            <em>{t('nosotros.titulo_destacado')}</em>
          </h1>

          <p>{t('nosotros.introduccion')}</p>

          <div className="am-about-actions">
            <Link className="am-btn am-btn--primary" to="/historias">
              {t('nosotros.boton_comunidad')}
            </Link>

            <Link className="am-btn am-btn--secondary" to="/apoyo">
              {t('nosotros.boton_recursos')}
            </Link>
          </div>
        </div>

        <div className="am-about-hero__visual" aria-hidden="true">
          <div className="am-about-circle am-about-circle--large">A</div>
          <div className="am-about-circle am-about-circle--small">♡</div>
          <span className="am-about-note">{t('nosotros.nota')}</span>
        </div>
      </section>

      <section className="am-about-mission">
        <div className="am-page-width am-about-mission__inner">
          <span className="am-about-section-number">01</span>

          <div>
            <span className="am-about-eyebrow">
              {t('nosotros.mision_etiqueta')}
            </span>
            <h2>{t('nosotros.mision_titulo')}</h2>
          </div>

          <p>{t('nosotros.mision_texto')}</p>
        </div>
      </section>

      <section className="am-about-values am-page-width">
        <div className="am-about-heading">
          <span className="am-about-eyebrow">
            {t('nosotros.valores_etiqueta')}
          </span>
          <h2>{t('nosotros.valores_titulo')}</h2>
        </div>

        <div className="am-about-grid">
          {valores.map((valor) => (
            <article
              className={`am-about-card am-about-card--${valor.clase}`}
              key={valor.titulo}
            >
              <span>{valor.icono}</span>
              <h3>{valor.titulo}</h3>
              <p>{valor.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="am-about-disclaimer am-page-width">
        <span aria-hidden="true">i</span>
        <div>
          <h2>{t('nosotros.aviso_titulo')}</h2>
          <p>{t('nosotros.aviso_texto')}</p>
        </div>
      </section>
    </main>
  )
}

export default Nosotros
