import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import heroAmentaran from '../assets/hero-amentaran.png'

function Icon({ name, size = 20 }) {
  const icons = {
    community: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    message: <><path d="M21 12a8.4 8.4 0 0 1-9 8 9.3 9.3 0 0 1-4-.9L3 21l1.7-4.5A8.6 8.6 0 0 1 3 12a8.4 8.4 0 0 1 9-8 8.4 8.4 0 0 1 9 8Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  }

  return <svg aria-hidden="true" className="am-icon" fill="none" height={size} viewBox="0 0 24 24" width={size}>{icons[name]}</svg>
}

function Inicio() {
  const { t } = useTranslation()
  const opciones = [
    { numero: '01', clase: 'violeta', icono: 'heart', titulo: t('inicio.hablar_titulo'), texto: t('inicio.hablar_texto'), ruta: '/historias' },
    { numero: '02', clase: 'menta', icono: 'book', titulo: t('inicio.recursos_titulo'), texto: t('inicio.recursos_texto'), ruta: '/recursos' },
    { numero: '03', clase: 'coral', icono: 'message', titulo: t('inicio.escuchar_titulo'), texto: t('inicio.escuchar_texto'), ruta: '/conectar' },
  ]

  return (
    <main className="am-home">
      <section className="am-hero am-page-width">
        <svg aria-hidden="true" className="am-mountain-backdrop" viewBox="0 0 1160 430">
          <path d="M-40 390 190 185c14-13 36-12 49 2l94 101 82-79c13-13 34-13 47 0l174 181" />
          <path d="m520 390 173-159c13-12 33-12 46 0l68 62 87-104c13-16 38-17 53-2l252 203" />
          <path d="M-30 406c177-43 333-43 468 0 155 49 319 49 492 0 93-27 185-27 276 0" />
        </svg>

        <div className="am-hero__copy">
          <div className="am-welcome-pill"><span className="am-pulse-dot" />{t('inicio.figma_etiqueta')}</div>
          <h1>{t('inicio.figma_titulo')} <em>{t('inicio.figma_destacado')}</em></h1>
          <p className="am-hero__text">{t('inicio.figma_descripcion')}</p>

          <div className="am-hero__actions">
            <Link className="am-btn am-btn--primary" to="/historias"><Icon name="community" size={18} />{t('inicio.figma_boton_comunidad')}</Link>
            <Link className="am-btn am-btn--secondary" to="/recursos"><Icon name="book" size={18} />{t('inicio.figma_boton_recursos')}</Link>
          </div>

          <div className="am-trust-row">
            <span className="am-avatar-stack" aria-hidden="true">
              <span className="am-avatar am-avatar--coral">L</span><span className="am-avatar am-avatar--mint">N</span><span className="am-avatar am-avatar--blue">I</span>
            </span>
            <span><strong>{t('inicio.figma_confianza_titulo')}</strong>{t('inicio.figma_confianza_texto')}</span>
          </div>
        </div>

        <div className="am-hero__visual">
          <div className="am-hero__blob" />
          <div className="am-photo-card"><img src={heroAmentaran} alt={t('inicio.imagen_alt')} /></div>
          <div className="am-floating-note am-note--top"><span className="am-mini-icon am-mini-icon--coral"><Icon name="heart" size={17} /></span><div><strong>{t('inicio.figma_nota_animo')}</strong><span>{t('inicio.figma_nota_calma')}</span></div></div>
          <div className="am-floating-note am-note--bottom"><span className="am-mini-icon am-mini-icon--mint"><Icon name="message" size={17} /></span><div><strong>{t('inicio.figma_nota_escucha')}</strong><span>{t('inicio.figma_nota_respeto')}</span></div></div>
          <span className="am-doodle am-doodle--one" aria-hidden="true">✦</span><span className="am-doodle am-doodle--two" aria-hidden="true">⌁</span>
        </div>
      </section>

      <section className="am-help-section">
        <div className="am-page-width">
          <div className="am-section-heading"><span>{t('inicio.figma_ritmo')}</span><h2>{t('inicio.figma_ayuda_titulo')}</h2><p>{t('inicio.figma_ayuda_texto')}</p></div>
          <div className="am-feature-grid">
            {opciones.map((opcion) => (
              <article className={`am-feature-card am-feature-card--${opcion.clase}`} key={opcion.numero}>
                <span className="am-feature-card__number">{opcion.numero}</span><span className="am-feature-card__icon"><Icon name={opcion.icono} size={25} /></span>
                <h3>{opcion.titulo}</h3><p>{opcion.texto}</p>
                <Link to={opcion.ruta}>{t('inicio.figma_descubrir')} <Icon name="arrow" size={17} /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="am-safety am-page-width">
        <div className="am-safety__symbol" aria-hidden="true"><Icon name="heart" size={38} /></div>
        <div><span>{t('inicio.figma_cuidado_etiqueta')}</span><h2>{t('inicio.figma_cuidado_titulo')}</h2><p>{t('inicio.figma_cuidado_texto')}</p><Link to="/seguridad">{t('inicio.figma_normas')} <Icon name="arrow" size={17} /></Link></div>
      </section>
    </main>
  )
}

export default Inicio
