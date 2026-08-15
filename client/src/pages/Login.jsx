import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/useAuth.js'

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
    <section style={{ maxWidth: '420px', margin: '60px auto', padding: '0 20px' }}>
      <h2>{t('auth.login_titulo')}</h2>

      <form onSubmit={manejarEnvio}>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="email">{t('auth.email')}</label>
          <br />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="password">{t('auth.password')}</label>
          <br />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: '#c0392b' }}>{error}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? t('auth.cargando') : t('auth.login_boton')}
        </button>
      </form>

      <p style={{ marginTop: '16px' }}>
        <Link to="/registro">{t('auth.login_enlace_registro')}</Link>
      </p>
    </section>
  )
}

export default Login
