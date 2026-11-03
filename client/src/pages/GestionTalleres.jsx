import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiFetch } from '../api/client.js'
import { useAuth } from '../context/useAuth.js'

const formularioInicial = {
  titulo: '',
  descripcion: '',
  fecha_inicio: '',
  duracion_minutos: '',
  modalidad: 'presencial',
  lugar: '',
  enlace: '',
  plazas: '',
  idioma: 'es',
  estado: 'borrador',
}

function GestionTalleres() {
  const { t } = useTranslation()
  const { usuario } = useAuth()

  const [talleres, setTalleres] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [editandoId, setEditandoId] = useState(null)
  const [eliminandoId, setEliminandoId] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  async function cargarTalleres() {
    try {
      const datos = await apiFetch('/api/talleres/gestion')
      setTalleres(datos)
      setError('')
    } catch (err) {
      setError(err.message || t('gestion_talleres.error_cargar'))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (usuario?.gestiona_talleres) cargarTalleres()
    else setCargando(false)
  }, [usuario])

  if (!usuario?.gestiona_talleres) {
    return (
      <main className="am-workshop-admin am-page-width">
        <div className="am-status-card am-status-card--error">
          <span>!</span>
          <div>
            <strong>{t('gestion_talleres.sin_permiso_titulo')}</strong>
            <p>{t('gestion_talleres.sin_permiso')}</p>
          </div>
        </div>
      </main>
    )
  }

  function manejarCambio(evento) {
    const { name, value } = evento.target
    setFormulario((actual) => ({ ...actual, [name]: value }))
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial)
    setEditandoId(null)
    setError('')
    setMensaje('')
  }

  function comenzarEdicion(taller) {
    setEditandoId(taller.id)
    setFormulario({
      titulo: taller.titulo,
      descripcion: taller.descripcion,
      fecha_inicio: taller.fecha_inicio.slice(0, 16),
      duracion_minutos: taller.duracion_minutos || '',
      modalidad: taller.modalidad,
      lugar: taller.lugar || '',
      enlace: taller.enlace || '',
      plazas: taller.plazas || '',
      idioma: taller.idioma,
      estado: taller.estado,
    })
    setError('')
    setMensaje('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function guardarTaller(evento) {
    evento.preventDefault()
    setGuardando(true)
    setError('')
    setMensaje('')

    const datos = {
      ...formulario,
      duracion_minutos: formulario.duracion_minutos || null,
      plazas: formulario.plazas || null,
    }

    try {
      if (editandoId) {
        await apiFetch(`/api/talleres/${editandoId}`, {
          method: 'PATCH',
          body: datos,
        })
        setMensaje(t('gestion_talleres.actualizado'))
      } else {
        await apiFetch('/api/talleres', {
          method: 'POST',
          body: datos,
        })
        setMensaje(t('gestion_talleres.creado'))
      }

      setFormulario(formularioInicial)
      setEditandoId(null)
      await cargarTalleres()
    } catch (err) {
      setError(err.message || t('gestion_talleres.error_guardar'))
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarEstado(tallerId, estado) {
    setError('')

    try {
      await apiFetch(`/api/talleres/${tallerId}`, {
        method: 'PATCH',
        body: { estado },
      })
      await cargarTalleres()
    } catch (err) {
      setError(err.message || t('gestion_talleres.error_guardar'))
    }
  }

  async function eliminarTaller(tallerId) {
    setError('')

    try {
      await apiFetch(`/api/talleres/${tallerId}`, {
        method: 'DELETE',
      })
      setEliminandoId(null)

      if (editandoId === tallerId) limpiarFormulario()
      await cargarTalleres()
    } catch (err) {
      setError(err.message || t('gestion_talleres.error_eliminar'))
    }
  }

  return (
    <main className="am-workshop-admin am-page-width">
      <header className="am-workshop-admin__header">
        <div>
          <span className="am-page-eyebrow">{t('gestion_talleres.etiqueta')}</span>
          <h1>{t('gestion_talleres.titulo')}</h1>
          <p>{t('gestion_talleres.descripcion')}</p>
        </div>

        <Link className="am-btn am-btn--secondary" to="/talleres">
          {t('gestion_talleres.ver_pagina')}
        </Link>
      </header>

      <section className="am-workshop-admin__layout">
        <form className="am-workshop-form" onSubmit={guardarTaller}>
          <div className="am-workshop-form__heading">
            <h2>
              {editandoId
                ? t('gestion_talleres.editar_titulo')
                : t('gestion_talleres.crear_titulo')}
            </h2>

            {editandoId && (
              <button type="button" onClick={limpiarFormulario}>
                {t('gestion_talleres.cancelar_edicion')}
              </button>
            )}
          </div>

          <label>
            {t('gestion_talleres.campos.titulo')}
            <input
              name="titulo"
              value={formulario.titulo}
              onChange={manejarCambio}
              maxLength="160"
              required
            />
          </label>

          <label>
            {t('gestion_talleres.campos.descripcion')}
            <textarea
              name="descripcion"
              value={formulario.descripcion}
              onChange={manejarCambio}
              rows="5"
              maxLength="5000"
              required
            />
          </label>

          <div className="am-workshop-form__grid">
            <label>
              {t('gestion_talleres.campos.fecha')}
              <input
                type="datetime-local"
                name="fecha_inicio"
                value={formulario.fecha_inicio}
                onChange={manejarCambio}
                required
              />
            </label>

            <label>
              {t('gestion_talleres.campos.duracion')}
              <input
                type="number"
                name="duracion_minutos"
                value={formulario.duracion_minutos}
                onChange={manejarCambio}
                min="15"
                step="15"
              />
            </label>

            <label>
              {t('gestion_talleres.campos.modalidad')}
              <select
                name="modalidad"
                value={formulario.modalidad}
                onChange={manejarCambio}
              >
                <option value="presencial">{t('gestion_talleres.modalidades.presencial')}</option>
                <option value="online">{t('gestion_talleres.modalidades.online')}</option>
                <option value="hibrido">{t('gestion_talleres.modalidades.hibrido')}</option>
              </select>
            </label>

            <label>
              {t('gestion_talleres.campos.plazas')}
              <input
                type="number"
                name="plazas"
                value={formulario.plazas}
                onChange={manejarCambio}
                min="1"
              />
            </label>

            <label>
              {t('gestion_talleres.campos.idioma')}
              <select name="idioma" value={formulario.idioma} onChange={manejarCambio}>
                <option value="es">Español</option>
                <option value="ca">Català</option>
              </select>
            </label>

            <label>
              {t('gestion_talleres.campos.estado')}
              <select name="estado" value={formulario.estado} onChange={manejarCambio}>
                {['borrador', 'publicado', 'pospuesto', 'cancelado', 'finalizado'].map((estado) => (
                  <option value={estado} key={estado}>
                    {t(`gestion_talleres.estados.${estado}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            {t('gestion_talleres.campos.lugar')}
            <input
              name="lugar"
              value={formulario.lugar}
              onChange={manejarCambio}
              maxLength="240"
            />
          </label>

          <label>
            {t('gestion_talleres.campos.enlace')}
            <input
              type="url"
              name="enlace"
              value={formulario.enlace}
              onChange={manejarCambio}
              maxLength="500"
              placeholder="https://"
            />
          </label>

          {error && <p className="am-inline-error">{error}</p>}
          {mensaje && <p className="am-session-notice">{mensaje}</p>}

          <button className="am-btn am-btn--primary" type="submit" disabled={guardando}>
            {guardando
              ? t('gestion_talleres.guardando')
              : editandoId
                ? t('gestion_talleres.guardar_cambios')
                : t('gestion_talleres.crear')}
          </button>
        </form>

        <section className="am-workshop-admin__list">
          <h2>{t('gestion_talleres.lista_titulo')}</h2>

          {cargando && (
            <div className="am-status-card">{t('gestion_talleres.cargando')}</div>
          )}

          {!cargando && talleres.length === 0 && (
            <div className="am-status-card">{t('gestion_talleres.vacio')}</div>
          )}

          {talleres.map((taller) => (
            <article className="am-workshop-admin-card" key={taller.id}>
              <div className="am-workshop-admin-card__heading">
                <div>
                  <span className={`am-workshop-status am-workshop-status--${taller.estado}`}>
                    {t(`gestion_talleres.estados.${taller.estado}`)}
                  </span>
                  <h3>{taller.titulo}</h3>
                </div>
                <small>{taller.idioma.toUpperCase()}</small>
              </div>

              <p>{new Date(taller.fecha_inicio).toLocaleString()}</p>

              <div className="am-workshop-admin-card__actions">
                <button type="button" onClick={() => comenzarEdicion(taller)}>
                  {t('gestion_talleres.editar')}
                </button>

                {taller.estado !== 'publicado' && (
                  <button type="button" onClick={() => cambiarEstado(taller.id, 'publicado')}>
                    {t('gestion_talleres.publicar')}
                  </button>
                )}

                {taller.estado === 'publicado' && (
                  <button type="button" onClick={() => cambiarEstado(taller.id, 'pospuesto')}>
                    {t('gestion_talleres.posponer')}
                  </button>
                )}

                {taller.estado !== 'cancelado' && (
                  <button type="button" onClick={() => cambiarEstado(taller.id, 'cancelado')}>
                    {t('gestion_talleres.cancelar')}
                  </button>
                )}

                <button
                  className="am-story-delete"
                  type="button"
                  onClick={() => setEliminandoId(taller.id)}
                >
                  {t('gestion_talleres.eliminar')}
                </button>
              </div>

              {eliminandoId === taller.id && (
                <div className="am-delete-confirmation">
                  <p>{t('gestion_talleres.confirmar_eliminar')}</p>
                  <div>
                    <button type="button" onClick={() => setEliminandoId(null)}>
                      {t('gestion_talleres.volver')}
                    </button>
                    <button
                      className="am-story-delete--confirm"
                      type="button"
                      onClick={() => eliminarTaller(taller.id)}
                    >
                      {t('gestion_talleres.si_eliminar')}
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}

export default GestionTalleres
