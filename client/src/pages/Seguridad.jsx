import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

function Seguridad() {
  const { t, i18n } = useTranslation()

  const normas = [
    {
      numero: '01',
      titulo: t('seguridad.norma_respeto_titulo'),
      texto: t('seguridad.norma_respeto_texto'),
    },
    {
      numero: '02',
      titulo: t('seguridad.norma_privacidad_titulo'),
      texto: t('seguridad.norma_privacidad_texto'),
    },
    {
      numero: '03',
      titulo: t('seguridad.norma_limites_titulo'),
      texto: t('seguridad.norma_limites_texto'),
    },
    {
      numero: '04',
      titulo: t('seguridad.norma_reporte_titulo'),
      texto: t('seguridad.norma_reporte_texto'),
    },
  ]

  return (
    <main className="am-safety-page">
      <section className="am-safety-hero am-page-width">
        <span className="am-safety-eyebrow">
          {t('seguridad.etiqueta')}
        </span>

        <h1 key={i18n.resolvedLanguage}>
          <span>{t('seguridad.titulo')}</span>
          <em>{t('seguridad.titulo_destacado')}</em>
        </h1>

        <p>{t('seguridad.introduccion')}</p>
      </section>

      <section className="am-rules am-page-width">
        <div className="am-safety-heading">
          <span className="am-safety-eyebrow">
            {t('seguridad.normas_etiqueta')}
          </span>
          <h2>{t('seguridad.normas_titulo')}</h2>
        </div>

        <div className="am-rules-grid">
          {normas.map((norma) => (
            <article className="am-rule-card" key={norma.numero}>
              <span>{norma.numero}</span>
              <h3>{norma.titulo}</h3>
              <p>{norma.texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="am-privacy-section">
        <div className="am-page-width am-privacy-content">
          <div>
            <span className="am-safety-eyebrow">
              {t('seguridad.privacidad_etiqueta')}
            </span>
            <h2>{t('seguridad.privacidad_titulo')}</h2>
          </div>

          <div className="am-privacy-list">
            <p>✓ {t('seguridad.privacidad_dato_uno')}</p>
            <p>✓ {t('seguridad.privacidad_dato_dos')}</p>
            <p>✓ {t('seguridad.privacidad_dato_tres')}</p>
          </div>
        </div>
      </section>

      <section className="am-emergency am-page-width">
        <div className="am-emergency-heading">
          <span className="am-safety-eyebrow">
            {t('seguridad.emergencia_etiqueta')}
          </span>
          <h2>{t('seguridad.emergencia_titulo')}</h2>
          <p>{t('seguridad.emergencia_texto')}</p>
        </div>

        <div className="am-emergency-grid">
          <article className="am-emergency-card am-emergency-card--urgent">
            <span>{t('seguridad.emergencia_inmediata')}</span>
            <strong>112</strong>
            <p>{t('seguridad.emergencia_112_texto')}</p>
            <a href="tel:112">{t('seguridad.llamar_112')}</a>
          </article>

          <article className="am-emergency-card">
            <span>{t('seguridad.apoyo_crisis')}</span>
            <strong>024</strong>
            <p>{t('seguridad.emergencia_024_texto')}</p>
            <a href="tel:024">{t('seguridad.llamar_024')}</a>
          </article>
        </div>

        <p className="am-emergency-note">
          {t('seguridad.aviso_profesional')}
        </p>

        <Link className="am-btn am-btn--secondary" to="/apoyo">
          {t('seguridad.ver_recursos')}
        </Link>
      </section>
    </main>
  )
}

export default Seguridad
