import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

function Apoyo() {
  const { t } = useTranslation()

  return (
    <section id="apoyo">
      <h2>{t('apoyo.titulo')}</h2>

      <p>{t('apoyo.descripcion')}</p>

      <div className="opciones">
        <div className="tarjeta">
          <h3>{t('apoyo.tarjeta_hablar.titulo')}</h3>
          <p>{t('apoyo.tarjeta_hablar.texto')}</p>
          <Link to="/conectar">
            <button>{t('apoyo.tarjeta_hablar.boton')}</button>
          </Link>
        </div>

        <div className="tarjeta">
          <h3>{t('apoyo.tarjeta_escuchar.titulo')}</h3>
          <p>{t('apoyo.tarjeta_escuchar.texto')}</p>
          <Link to="/conectar">
            <button>{t('apoyo.tarjeta_escuchar.boton')}</button>
          </Link>
        </div>

        <div className="tarjeta">
          <h3>{t('apoyo.tarjeta_historias.titulo')}</h3>
          <p>{t('apoyo.tarjeta_historias.texto')}</p>
          <Link to="/historias">
            <button>{t('apoyo.tarjeta_historias.boton')}</button>
          </Link>
        </div>

        <div className="tarjeta">
          <h3>{t('apoyo.tarjeta_ia.titulo')}</h3>
          <p>{t('apoyo.tarjeta_ia.texto')}</p>
          <button>{t('apoyo.tarjeta_ia.boton')}</button>
        </div>
      </div>
    </section>
  )
}

export default Apoyo
