import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { io } from 'socket.io-client'
import { apiFetch } from '../api/client.js'
import { useAuth } from '../context/useAuth.js'

const API_URL = import.meta.env.VITE_API_URL

function Chat({ sesionId }) {
  const { t } = useTranslation()
  const { usuario } = useAuth()

  const [mensajes, setMensajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  // Recién dejamos enviar cuando el servidor confirmó que nos unió a
  // la sala — si no, nuestro propio mensaje podría no volver por el
  // WebSocket (se manda igual, pero no lo veríamos aparecer solo).
  const [unidoALaSala, setUnidoALaSala] = useState(false)

  const [contenido, setContenido] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')

  function agregarMensajes(nuevos) {
    setMensajes((actuales) => {
      const combinados = [...actuales]
      for (const m of nuevos) {
        if (!combinados.some((existente) => existente.id === m.id)) {
          combinados.push(m)
        }
      }
      combinados.sort((a, b) => new Date(a.fecha_envio) - new Date(b.fecha_envio))
      return combinados
    })
  }

  useEffect(() => {
    let cancelado = false

    async function cargarHistorial() {
      try {
        const datos = await apiFetch(`/api/sesiones/${sesionId}/mensajes`)
        if (!cancelado) {
          // Se fusiona con lo que ya haya en pantalla (en vez de
          // reemplazar todo) por si un mensaje llegó por WebSocket
          // mientras esta petición todavía estaba en camino — así
          // nunca se pierde uno que ya viste aparecer.
          agregarMensajes(datos)
          setErrorCarga('')
        }
      } catch {
        if (!cancelado) {
          setErrorCarga(t('chat.error_cargar'))
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    cargarHistorial()

    const token = localStorage.getItem('amentaran_token')
    const socket = io(API_URL, { auth: { token } })

    // Se une a la sala de esta conversación cada vez que la conexión
    // se confirma — incluidas las reconexiones automáticas que hace
    // socket.io-client solo, ya que el servidor no recuerda a qué sala
    // pertenecía un socket que se desconectó. El callback es la
    // confirmación del servidor de que ya estamos adentro.
    socket.on('connect', () => {
      setUnidoALaSala(false)
      socket.emit('unirse_sesion', { sesion_id: sesionId }, (respuesta) => {
        if (!cancelado) {
          setUnidoALaSala(Boolean(respuesta?.ok))
        }
      })
    })

    socket.on('disconnect', () => {
      if (!cancelado) setUnidoALaSala(false)
    })

    socket.on('mensaje_nuevo', (mensaje) => {
      if (cancelado) return
      const { autor_id, ...mensajePublico } = mensaje
      agregarMensajes([{ ...mensajePublico, es_mio: autor_id === usuario.id }])
    })

    return () => {
      cancelado = true
      socket.disconnect()
    }
  }, [sesionId, t, usuario.id])

  async function manejarEnviar(evento) {
    evento.preventDefault()
    if (!contenido.trim()) return

    setErrorEnvio('')
    setEnviando(true)
    try {
      await apiFetch('/api/mensajes', {
        method: 'POST',
        body: { sesion_id: sesionId, contenido },
      })
      // No hace falta agregar el mensaje a mano acá: como también
      // estamos unidos a esta sala, el propio WebSocket nos lo va a
      // devolver por "mensaje_nuevo", igual que a la otra persona.
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
        <button type="submit" disabled={enviando || !unidoALaSala}>
          {enviando
            ? t('chat.enviando')
            : unidoALaSala
              ? t('chat.boton_enviar')
              : t('chat.conectando')}
        </button>
      </form>
      {errorEnvio && <p style={{ color: '#c0392b' }}>{errorEnvio}</p>}
    </div>
  )
}

export default Chat
