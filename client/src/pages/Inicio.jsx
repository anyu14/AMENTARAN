import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import heroAmentaran from '../assets/hero-amentaran.png'

function Inicio() {
  const { t } = useTranslation()

  return (
    <div className="amentaran-home">
      <section id="inicio" className="amentaran-hero">
        <div className="amentaran-hero__texto">
          <p className="amentaran-hero__etiqueta">
            {t('inicio.etiqueta')}
          </p>

          <h2 className="amentaran-hero__titulo">
            {t('inicio.titulo_pre')}{' '}
            <span>{t('inicio.titulo_destacado')}</span>
          </h2>

          <p className="amentaran-hero__descripcion">
            {t('inicio.descripcion_linea1')}
            <br />
            {t('inicio.descripcion_linea2')}
          </p>

          <div className="amentaran-hero__acciones">
            <Link
              to="/conectar"
              className="amentaran-boton amentaran-boton--principal"
            >
              <span aria-hidden="true">💬</span>
              {t('hero.boton_hablar').replace('💬 ', '')}
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              to="/conectar"
              className="amentaran-boton amentaran-boton--secundario"
            >
              <span aria-hidden="true">🤝</span>
              {t('hero.boton_escuchar').replace('♡ ', '')}
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              to="/historias"
              className="amentaran-boton amentaran-boton--historias"
            >
              <span aria-hidden="true">📖</span>
              {t('apoyo.tarjeta_historias.boton')}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="amentaran-hero__visual">
          <img
            src={heroAmentaran}
            alt={t('inicio.imagen_alt')}
          />

          <p className="amentaran-hero__frase">
            {t('inicio.frase_imagen_linea1')}
            <br />
            {t('inicio.frase_imagen_linea2')}
          </p>
        </div>
      </section>

      <section
        className="amentaran-opciones"
        aria-label={t('inicio.opciones_aria')}
      >
        <article className="amentaran-opcion">
          <span className="amentaran-opcion__icono" aria-hidden="true">
            💬
          </span>

          <div>
            <h3>{t('inicio.hablar_titulo')}</h3>
            <p>{t('inicio.hablar_texto')}</p>
          </div>
        </article>

        <article className="amentaran-opcion">
          <span className="amentaran-opcion__icono" aria-hidden="true">
            🤝
          </span>

          <div>
            <h3>{t('inicio.escuchar_titulo')}</h3>
            <p>{t('inicio.escuchar_texto')}</p>
          </div>
        </article>

        <article className="amentaran-opcion">
          <span className="amentaran-opcion__icono" aria-hidden="true">
            📖
          </span>

          <div>
            <h3>{t('inicio.historias_titulo')}</h3>
            <p>{t('inicio.historias_texto')}</p>
          </div>
        </article>
      </section>

      <section className="amentaran-comunidad">
        <div>
          <span aria-hidden="true">🌱</span>
          <p>
            <strong>{t('inicio.talleres_titulo')}</strong>
            {t('inicio.talleres_texto')}
          </p>
        </div>

        <div>
          <span aria-hidden="true">⛰️</span>
          <p>
            <strong>{t('inicio.comunidad_titulo')}</strong>
            {t('inicio.comunidad_texto')}
          </p>
        </div>

        <div>
          <span aria-hidden="true">🍃</span>
          <p>
            <strong>{t('inicio.recursos_titulo')}</strong>
            {t('inicio.recursos_texto')}
          </p>
        </div>
      </section>
    </div>
  )
}

export default Inicio