import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/useAuth.js'
import heroAmentaran from '../assets/hero-amentaran.jpg'

function Registro() {
  const { t, i18n } = useTranslation()
  const { registro } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('busca_apoyo')
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setError('')
    setEnviando(true)

    try {
      await registro({
        email,
        password,
        rol,
        idioma_preferido: i18n.resolvedLanguage,
      })
      setExito(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

    return (
    <main className="auth-page">
      <section className="auth-container">
        <div className="auth-image">
          <img
            src={heroAmentaran}
            alt="Paisaje natural del Val d'Aran"
          />

          <div className="auth-image__overlay">
            <p className="auth-image__eyebrow">AMENTARAN</p>
            <h1>Un lugar seguro para comenzar</h1>
            <p>
              Forma parte de una comunidad donde hablar, escuchar y sentirse
              acompañado importa.
            </p>
          </div>
        </div>

        <div className="auth-content">
          <div className="auth-content__heading">
            <span className="auth-content__icon">🌿</span>
            <p className="auth-content__eyebrow">Únete a la comunidad</p>
            <h2>{t('auth.registro_titulo')}</h2>
            <p>Crea tu espacio personal en Amentaran.</p>
          </div>

          <form className="auth-form" onSubmit={manejarEnvio}>
            <div className="auth-field">
              <label htmlFor="email">{t('auth.email')}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@correo.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">{t('auth.password')}</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <fieldset className="auth-role">
              <legend>{t('auth.rol_pregunta')}</legend>

              <div className="auth-role__options">
                <label
                  className={`auth-role__option ${
                    rol === 'busca_apoyo' ? 'auth-role__option--active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="rol"
                    value="busca_apoyo"
                    checked={rol === 'busca_apoyo'}
                    onChange={(e) => setRol(e.target.value)}
                  />

                  <span className="auth-role__emoji">💬</span>

                  <span>
                    <strong>{t('auth.rol_busca_apoyo')}</strong>
                    <small>Quiero compartir cómo me siento.</small>
                  </span>
                </label>

                <label
                  className={`auth-role__option ${
                    rol === 'voluntario' ? 'auth-role__option--active' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="rol"
                    value="voluntario"
                    checked={rol === 'voluntario'}
                    onChange={(e) => setRol(e.target.value)}
                  />

                  <span className="auth-role__emoji">🤝</span>

                  <span>
                    <strong>{t('auth.rol_voluntario')}</strong>
                    <small>Quiero acompañar y escuchar.</small>
                  </span>
                </label>
              </div>
            </fieldset>

            {error && (
              <p className="auth-message auth-message--error">{error}</p>
            )}

            {exito && (
              <p className="auth-message auth-message--success">
                {t('auth.registro_exito')}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={enviando}
            >
              {enviando ? t('auth.cargando') : t('auth.registro_boton')}
              {!enviando && <span>→</span>}
            </button>
          </form>

          <p className="auth-switch">
            {t('auth.registro_enlace_login')}{' '}
            <Link to="/login">Iniciar sesión</Link>
          </p>

          <p className="auth-privacy">
            🔒 Tu información está protegida y será tratada con respeto.
          </p>
        </div>
      </section>
     </main>
)
}

export default Registro