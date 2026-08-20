import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../api/client.js'

const INTERVALO_POLLING_MS = 4000

function Chat({ sesionId }) {
  const { t } = useTranslation()

  const [mensajes, setMensajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')

  const [contenido, setContenido] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')

  // Cada petición de mensajes lleva un número de secuencia. Si dos
  // quedan "en vuelo" a la vez (por ejemplo, por lentitud de red) y la
  // más vieja responde después que la más nueva, se descarta — así una
  // respuesta desactualizada nunca pisa a una más reciente.
  const ultimaPeticionId = useRef(0)

  useEffect(() => {
    let cancelado = false

    async function cargarMensajes() {
      const idPeticion = ++ultimaPeticionId.current
      try {
        const datos = await apiFetch(`/api/sesiones/${sesionId}/mensajes`)
        if (!cancelado && idPeticion === ultimaPeticionId.current) {
          setMensajes(datos)
          setErrorCarga('')
        }
      } catch {
        if (!cancelado && idPeticion === ultimaPeticionId.current) {
          setErrorCarga(t('chat.error_cargar'))
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    cargarMensajes()
    // Todavía no hay tiempo real: cada tanto volvemos a preguntar al
    // backend si hay mensajes nuevos, mientras el chat esté abierto.
    const intervalo = setInterval(cargarMensajes, INTERVALO_POLLING_MS)

    return () => {
      cancelado = true
      clearInterval(intervalo)
    }
  }, [sesionId, t])

  async function manejarEnviar(evento) {
    evento.preventDefault()
    if (!contenido.trim()) return

    setErrorEnvio('')
    setEnviando(true)
    try {
      const nuevoMensaje = await apiFetch('/api/mensajes', {
        method: 'POST',
        body: { sesion_id: sesionId, contenido },
      })
      // El propio envío ya devuelve el mensaje creado (con es_mio:
      // true) — lo agregamos directo a la lista en vez de volver a
      // pedirle todo al backend, más rápido y sin arriesgar una
      // carrera con el polling automático.
      setMensajes((actuales) => [...actuales, nuevoMensaje])
      setContenido('')
    } catch (err) {
      setErrorEnvio(err.message || t('chat.error_enviar'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div>
      <div
        style={{
          maxHeight: '320px',
          overflowY: 'auto',
          border: '1px solid #e0dbe8',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          background: '#fff',
        }}
      >
        {cargando && <p>{t('chat.cargando')}</p>}
        {errorCarga && <p style={{ color: '#c0392b' }}>{errorCarga}</p>}
        {!cargando && !errorCarga && mensajes.length === 0 && <p>{t('chat.vacio')}</p>}

        {mensajes.map((mensaje) => (
          <div
            key={mensaje.id}
            style={{
              display: 'flex',
              justifyContent: mensaje.es_mio ? 'flex-end' : 'flex-start',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                padding: '8px 12px',
                borderRadius: '12px',
                background: mensaje.es_mio ? '#8056a8' : '#f0edf5',
                color: mensaje.es_mio ? '#fff' : '#333',
                whiteSpace: 'pre-wrap',
              }}
            >
              {mensaje.contenido}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={manejarEnviar} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder={t('chat.placeholder')}
          maxLength={5000}
          style={{ flex: 1, padding: '10px' }}
        />
        <button type="submit" disabled={enviando}>
          {enviando ? t('chat.enviando') : t('chat.boton_enviar')}
        </button>
      </form>
      {errorEnvio && <p style={{ color: '#c0392b' }}>{errorEnvio}</p>}
    </div>
  )
}

export default Chat
