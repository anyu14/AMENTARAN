import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/useAuth.js'
import heroAmentaran from '../assets/hero-amentaran.png'

function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setError('')
    setEnviando(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="auth-page auth-page--login">
      <section className="auth-container">
        <div className="auth-image">
          <img
            src={heroAmentaran}
            alt={t('auth.imagen_alt')}
          />

          <div className="auth-image__overlay">
            <p className="auth-image__eyebrow">AMENTARAN</p>

            <h1>
              {t('hero.titulo_pre')} {t('hero.titulo_sentir')}{' '}
              {t('hero.titulo_resaltado')}
            </h1>

            <p>
              {t('hero.descripcion_linea1')}{' '}
              {t('hero.descripcion_linea2')}
            </p>
          </div>
        </div>

        <div className="auth-content">
          <div className="auth-content__heading">
            <span className="auth-content__icon">♡</span>
            <p className="auth-content__eyebrow">AMENTARAN</p>
            <h2>{t('auth.login_titulo')}</h2>
          </div>

          <form className="auth-form" onSubmit={manejarEnvio}>
            <div className="auth-field">
              <label htmlFor="email">{t('auth.email')}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="auth-message auth-message--error">{error}</p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={enviando}
            >
              {enviando ? t('auth.cargando') : t('auth.login_boton')}
              {!enviando && <span>→</span>}
            </button>
          </form>

          <p className="auth-switch">
            <Link to="/registro">
              {t('auth.login_enlace_registro')}
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login