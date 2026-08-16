import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

function Inicio() {
  const { t } = useTranslation()

  return (
    <section id="inicio" className="hero">
      <div className="hero-contenido">

        <div className="hero-texto">
          <p className="bienvenida">{t('hero.bienvenida')}</p>

          <h2>
            {t('hero.titulo_pre')}
            <br />
            {t('hero.titulo_sentir')} <span>{t('hero.titulo_resaltado')}</span>
          </h2>

          <p className="hero-descripcion">
            {t('hero.descripcion_linea1')}
            <br />
            {t('hero.descripcion_linea2')}
          </p>

          <div className="hero-botones">
            <Link to="/conectar">
              <button>{t('hero.boton_hablar')}</button>
            </Link>
            <Link to="/conectar">
              <button className="boton-secundario">
                {t('hero.boton_escuchar')}
              </button>
            </Link>
          </div>
        </div>

        <div className="hero-paisaje">
          <div className="sol"></div>

          <div className="montana montana-1"></div>
          <div className="montana montana-2"></div>
          <div className="montana montana-3"></div>

          <div className="rama rama-1"></div>
          <div className="rama rama-2"></div>
          <div className="rama rama-3"></div>
        </div>

      </div>
    </section>
  )
}

export default Inicio
