import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../api/client.js'
import { useAuth } from '../context/useAuth.js'
import Chat from '../components/Chat.jsx'

function Conectar() {
  const { t } = useTranslation()
  const { usuario } = useAuth()

  const [sesion, setSesion] = useState(null)
  const [disponible, setDisponible] = useState(usuario?.disponible ?? false)
  // Solo hay algo que cargar si hay sesión iniciada; si no, no hace
  // falta pedir nada al backend ni mostrar un estado de carga.
  const [cargando, setCargando] = useState(!!usuario)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!usuario) {
      return
    }

    async function cargarSesionActiva() {
      try {
        const datos = await apiFetch('/api/matching/activa')
        setSesion(datos)
      } catch {
        // Si falla, simplemente no mostramos ninguna sesión activa.
      } finally {
        setCargando(false)
      }
    }

    cargarSesionActiva()
  }, [usuario])

  async function manejarDisponibilidad() {
    setError('')
    setProcesando(true)
    try {
      const datos = await apiFetch('/api/matching/disponibilidad', {
        method: 'PATCH',
        body: { disponible: !disponible },
      })
      setDisponible(datos.disponible)
    } catch (err) {
      setError(err.message || t('conectar.error_generico'))
    } finally {
      setProcesando(false)
    }
  }

  async function manejarConectar() {
    setError('')
    setProcesando(true)
    try {
      const nuevaSesion = await apiFetch('/api/matching/conectar', { method: 'POST' })
      setSesion(nuevaSesion)
    } catch (err) {
      // 409 = "no hay voluntarios disponibles": usamos nuestro propio
      // texto traducido en vez del mensaje del backend, que siempre
      // viene en español.
      if (err.status === 409) {
        setError(t('conectar.busca_sin_voluntarios'))
      } else {
        setError(err.message || t('conectar.error_generico'))
      }
    } finally {
      setProcesando(false)
    }
  }

  async function manejarFinalizar() {
    setError('')
    setProcesando(true)
    try {
      await apiFetch(`/api/matching/${sesion.id}/finalizar`, { method: 'POST' })
      setSesion(null)
      // El backend nunca reactiva la disponibilidad automáticamente al
      // finalizar, así que reflejamos eso mismo acá para no mostrar un
      // estado "disponible" que ya no es cierto.
      if (usuario.rol === 'voluntario') {
        setDisponible(false)
      }
    } catch (err) {
      setError(err.message || t('conectar.error_generico'))
    } finally {
      setProcesando(false)
    }
  }

  if (!usuario) {
    return (
      <section style={{ maxWidth: '480px', margin: '60px auto', padding: '0 20px' }}>
        <h2>{t('conectar.titulo')}</h2>
        <p>
          {t('conectar.inicia_sesion_pre')} <Link to="/login">{t('conectar.inicia_sesion_enlace')}</Link>{' '}
          {t('conectar.inicia_sesion_o')} <Link to="/registro">{t('conectar.registrate_enlace')}</Link>.
        </p>
      </section>
    )
  }

  if (cargando) {
    return (
      <section style={{ maxWidth: '480px', margin: '60px auto', padding: '0 20px' }}>
        <h2>{t('conectar.titulo')}</h2>
        <p>{t('auth.cargando')}</p>
      </section>
    )
  }

  return (
    <section style={{ maxWidth: '480px', margin: '60px auto', padding: '0 20px' }}>
      <h2>{t('conectar.titulo')}</h2>

      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      {sesion ? (
        <div className="tarjeta">
          <h3>{t('conectar.sesion_activa_titulo')}</h3>
          <p>
            {t('conectar.sesion_activa_desde')}{' '}
            {new Date(sesion.fecha_inicio).toLocaleString()}
          </p>

          <Chat sesionId={sesion.id} />

          <button onClick={manejarFinalizar} disabled={procesando} style={{ marginTop: '12px' }}>
            {procesando ? t('conectar.finalizando') : t('conectar.boton_finalizar')}
          </button>
        </div>
      ) : usuario.rol === 'voluntario' ? (
        <div className="tarjeta">
          <p>
            {disponible
              ? t('conectar.voluntario_disponible_true')
              : t('conectar.voluntario_disponible_false')}
          </p>
          <button onClick={manejarDisponibilidad} disabled={procesando}>
            {disponible
              ? t('conectar.voluntario_boton_marcar_no_disponible')
              : t('conectar.voluntario_boton_marcar_disponible')}
          </button>
        </div>
      ) : (
        <div className="tarjeta">
          <p>{t('conectar.busca_sin_sesion_texto')}</p>
          <button onClick={manejarConectar} disabled={procesando}>
            {procesando ? t('conectar.busca_conectando') : t('conectar.busca_boton_conectar')}
          </button>
        </div>
      )}
    </section>
  )
}

export default Conectar
