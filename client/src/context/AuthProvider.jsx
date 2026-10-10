import { useEffect, useState } from 'react'
import { apiFetch } from '../api/client.js'
import { AuthContext } from './AuthContext.js'

const CLAVE_TOKEN = 'amentaran_token'
const CLAVE_USUARIO = 'amentaran_usuario'

export function AuthProvider({ children }) {
  // Al cargar la app, se intenta recuperar la sesión guardada en el
  // navegador — así no hace falta volver a loguearse al recargar.
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem(CLAVE_USUARIO)
    return guardado ? JSON.parse(guardado) : null
  })
  const [sesionCaducada, setSesionCaducada] = useState(false)

  useEffect(() => {
    function manejarSesionCaducada() {
      setUsuario(null)
      setSesionCaducada(true)
    }

    window.addEventListener('amentaran:sesion-caducada', manejarSesionCaducada)
    return () => window.removeEventListener('amentaran:sesion-caducada', manejarSesionCaducada)
  }, [])

  function guardarSesion(token, usuario) {
    localStorage.setItem(CLAVE_TOKEN, token)
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario))
    setUsuario(usuario)
    setSesionCaducada(false)
  }

  async function login(email, password) {
    const datos = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    guardarSesion(datos.access_token, datos.usuario)
    return datos.usuario
  }

  async function registro({ email, password, rol, idioma_preferido }) {
    // El registro no inicia sesión automáticamente: el usuario hace
    // login después, con sus propias credenciales, como cualquier app.
    return apiFetch('/api/auth/registro', {
      method: 'POST',
      body: { email, password, rol, idioma_preferido },
    })
  }

  function logout() {
    localStorage.removeItem(CLAVE_TOKEN)
    localStorage.removeItem(CLAVE_USUARIO)
    setUsuario(null)
    setSesionCaducada(false)
  }

  function limpiarAvisoSesion() {
    setSesionCaducada(false)
  }

  const value = { usuario, login, registro, logout, sesionCaducada, limpiarAvisoSesion }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
