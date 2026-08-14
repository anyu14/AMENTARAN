const API_URL = import.meta.env.VITE_API_URL

/**
 * Función central para llamar a la API de Amentaran.
 *
 * En vez de escribir fetch(...) con toda su configuración repetida en
 * cada componente, todos los llamados a la API pasan por aquí: arma
 * la URL completa, pone las cabeceras JSON, agrega el token de sesión
 * si existe, y convierte los errores del backend en excepciones que
 * el resto del código puede atrapar con try/catch.
 *
 * @param {string} path - ruta de la API, ej: "/api/auth/login"
 * @param {object} options - { method, body } (body como objeto, no como texto)
 */
export async function apiFetch(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" }

  const token = localStorage.getItem("amentaran_token")
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const respuesta = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const datos = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    // El backend siempre manda { error: "mensaje" } cuando algo falla.
    throw new Error(datos.error || "Ha ocurrido un error inesperado.")
  }

  return datos
}
