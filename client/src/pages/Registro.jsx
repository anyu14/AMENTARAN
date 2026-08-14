import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/useAuth.js'

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
    <section style={{ maxWidth: '420px', margin: '60px auto', padding: '0 20px' }}>
      <h2>{t('auth.registro_titulo')}</h2>

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
            minLength={8}
            required
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <p>{t('auth.rol_pregunta')}</p>
          <label>
            <input
              type="radio"
              name="rol"
              value="busca_apoyo"
              checked={rol === 'busca_apoyo'}
              onChange={(e) => setRol(e.target.value)}
            />{' '}
            {t('auth.rol_busca_apoyo')}
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="rol"
              value="voluntario"
              checked={rol === 'voluntario'}
              onChange={(e) => setRol(e.target.value)}
            />{' '}
            {t('auth.rol_voluntario')}
          </label>
        </div>

        {error && <p style={{ color: '#c0392b' }}>{error}</p>}
        {exito && <p style={{ color: '#2e8b57' }}>{t('auth.registro_exito')}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? t('auth.cargando') : t('auth.registro_boton')}
        </button>
      </form>

      <p style={{ marginTop: '16px' }}>
        <Link to="/login">{t('auth.registro_enlace_login')}</Link>
      </p>
    </section>
  )
}

export default Registro
