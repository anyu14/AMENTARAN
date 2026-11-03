import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { io } from 'socket.io-client'
import { apiFetch } from '../api/client.js'
import { useAuth } from '../context/useAuth.js'

const API_URL = import.meta.env.VITE_API_URL

function Chat({ sesionId, onSesionFinalizada }) {
  const { t } = useTranslation()
  const { usuario } = useAuth()

  const [mensajes, setMensajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [unidoALaSala, setUnidoALaSala] = useState(false)
  const [contenido, setContenido] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const listaMensajesRef = useRef(null)
  const audioRef = useRef(null)
  const [sonidoActivo, setSonidoActivo] = useState(
    () => localStorage.getItem('amentaran_chat_sound') !== 'false'
  )
  const sonidoActivoRef = useRef(sonidoActivo)

  function agregarMensajes(nuevos) {
    setMensajes((actuales) => {
      const combinados = [...actuales]

      for (const mensaje of nuevos) {
        if (!combinados.some((existente) => existente.id === mensaje.id)) {
          combinados.push(mensaje)
        }
      }

      combinados.sort(
        (a, b) => new Date(a.fecha_envio) - new Date(b.fecha_envio)
      )

      return combinados
    })
  }

  async function reproducirSonidoMensaje(forzar = false) {
    if (!forzar && !sonidoActivoRef.current) return

    const audio = audioRef.current
    if (!audio) return

    try {
      audio.currentTime = 0
      await audio.play()
    } catch {
      // Algunos navegadores bloquean el audio hasta la primera
      // interacción. El botón de sonido permite activarlo manualmente.
    }
  }

  async function alternarSonido() {
    const nuevoEstado = !sonidoActivo
    setSonidoActivo(nuevoEstado)
    sonidoActivoRef.current = nuevoEstado
    localStorage.setItem('amentaran_chat_sound', String(nuevoEstado))

    if (nuevoEstado) {
      await reproducirSonidoMensaje(true)
    }
  }

  useEffect(() => {
    sonidoActivoRef.current = sonidoActivo
  }, [sonidoActivo])

  useEffect(() => {
    const lista = listaMensajesRef.current
    if (lista) {
      lista.scrollTop = lista.scrollHeight
    }
  }, [mensajes, cargando])

  useEffect(() => {
    let cancelado = false

    async function cargarHistorial() {
      try {
        const datos = await apiFetch(`/api/sesiones/${sesionId}/mensajes`)
        if (!cancelado) {
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

      const esMio = mensaje.autor_id === usuario.id
      const mensajePublico = { ...mensaje }
      delete mensajePublico.autor_id

      agregarMensajes([{ ...mensajePublico, es_mio: esMio }])

      if (!esMio) {
        reproducirSonidoMensaje()
      }
    })

    socket.on('sesion_finalizada', (datos) => {
      if (!cancelado && Number(datos?.sesion_id) === Number(sesionId)) {
        onSesionFinalizada?.()
      }
    })

    return () => {
      cancelado = true
      socket.disconnect()
    }
  }, [sesionId, t, usuario.id, onSesionFinalizada])

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
      setContenido('')
    } catch (err) {
      setErrorEnvio(err.message || t('chat.error_enviar'))
    } finally {
      setEnviando(false)
    }
  }

  function formatearHora(fecha) {
    return new Date(fecha).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="am-messenger">
      <audio
        ref={audioRef}
        src="/message-notification.wav"
        preload="auto"
      />

      <button
        className="am-messenger__sound"
        type="button"
        onClick={alternarSonido}
        aria-label={
          sonidoActivo
            ? t('chat.sonido_desactivar')
            : t('chat.sonido_activar')
        }
        title={
          sonidoActivo
            ? t('chat.sonido_desactivar')
            : t('chat.sonido_activar')
        }
      >
        <span aria-hidden="true">{sonidoActivo ? '🔊' : '🔇'}</span>
      </button>

      <div className="am-messenger__messages" ref={listaMensajesRef}>
        {cargando && (
          <div className="am-messenger__state">{t('chat.cargando')}</div>
        )}

        {errorCarga && (
          <div className="am-messenger__state am-messenger__state--error">
            {errorCarga}
          </div>
        )}

        {!cargando && !errorCarga && mensajes.length === 0 && (
          <div className="am-messenger__empty">
            <span aria-hidden="true">♡</span>
            <p>{t('chat.vacio')}</p>
          </div>
        )}

        {mensajes.map((mensaje) => (
          <div
            className={`am-message-row ${
              mensaje.es_mio ? 'am-message-row--mine' : 'am-message-row--other'
            }`}
            key={mensaje.id}
          >
            {!mensaje.es_mio && (
              <span className="am-message-avatar" aria-hidden="true">
                A
              </span>
            )}

            <div
              className={`am-message-bubble ${
                mensaje.es_mio
                  ? 'am-message-bubble--mine'
                  : 'am-message-bubble--other'
              }`}
            >
              <p>{mensaje.contenido}</p>
              <time dateTime={mensaje.fecha_envio}>
                {formatearHora(mensaje.fecha_envio)}
              </time>
            </div>
          </div>
        ))}
      </div>

      {!unidoALaSala && (
        <div className="am-messenger__connecting">
          <span aria-hidden="true" />
          {t('chat.conectando')}
        </div>
      )}

      <form className="am-messenger__composer" onSubmit={manejarEnviar}>
        <span className="am-messenger__composer-icon" aria-hidden="true">
          ♡
        </span>

        <input
          type="text"
          value={contenido}
          onChange={(evento) => setContenido(evento.target.value)}
          placeholder={t('chat.placeholder')}
          maxLength={5000}
          disabled={!unidoALaSala}
        />

        <button
          type="submit"
          disabled={enviando || !unidoALaSala || !contenido.trim()}
          aria-label={t('chat.boton_enviar')}
        >
          {enviando ? '…' : '➤'}
        </button>
      </form>

      {errorEnvio && (
        <p className="am-messenger__error">{errorEnvio}</p>
      )}
    </div>
  )
}

export default Chat
