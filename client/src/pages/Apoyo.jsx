import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function Apoyo() {
  const { t } = useTranslation();

  const opciones = [
    { id: "hablar", icono: "💬", ruta: "/conectar" },
    { id: "escuchar", icono: "♡", ruta: "/conectar" },
    { id: "historias", icono: "📖", ruta: "/historias" },
    { id: "recursos", icono: "✨", ruta: "/recursos" },
  ];

  return (
    <main id="apoyo" className="apoyo-page">
      <section className="apoyo-hero">
        <div className="apoyo-contenedor">
          <p className="apoyo-etiqueta">{t("apoyo.etiqueta")}</p>
          <h1>{t("apoyo.titulo")}</h1>
          <p className="apoyo-descripcion">{t("apoyo.descripcion")}</p>
        </div>
      </section>

      <section
        className="apoyo-opciones"
        aria-labelledby="apoyo-opciones-titulo"
      >
        <div className="apoyo-contenedor">
          <h2 id="apoyo-opciones-titulo" className="sr-only">
            {t("apoyo.opciones_titulo")}
          </h2>

          <div className="apoyo-grid">
            {opciones.map((opcion) => (
              <article
                className={`apoyo-tarjeta apoyo-tarjeta--${opcion.id}`}
                key={opcion.id}
              >
                <span className="apoyo-tarjeta__icono" aria-hidden="true">
                  {opcion.icono}
                </span>

                <h3>{t(`apoyo.tarjeta_${opcion.id}.titulo`)}</h3>
                <p>{t(`apoyo.tarjeta_${opcion.id}.texto`)}</p>

                {opcion.ruta ? (
                  <Link className="apoyo-tarjeta__enlace" to={opcion.ruta}>
                    {t(`apoyo.tarjeta_${opcion.id}.boton`)}
                  </Link>
                ) : (
                  <button
                    className="apoyo-tarjeta__enlace"
                    type="button"
                    disabled
                  >
                    {t(`apoyo.tarjeta_${opcion.id}.boton`)}
                  </button>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="apoyo-talleres"
        aria-labelledby="apoyo-talleres-titulo"
      >
        <div className="apoyo-contenedor apoyo-talleres__contenido">
          <div className="apoyo-talleres__texto">
            <p className="apoyo-etiqueta">{t("apoyo.talleres.etiqueta")}</p>
            <h2 id="apoyo-talleres-titulo">
              {t("apoyo.talleres.titulo")}
            </h2>
            <p>{t("apoyo.talleres.descripcion")}</p>
          </div>

          <div className="apoyo-talleres__aviso">
            <span aria-hidden="true">🌿</span>
            <div>
              <h3>{t("apoyo.talleres.proximamente_titulo")}</h3>
              <p>{t("apoyo.talleres.proximamente_texto")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="apoyo-comunidad">
        <div className="apoyo-contenedor">
          <p>{t("apoyo.comunidad_frase")}</p>
          <h2>{t("apoyo.comunidad_titulo")}</h2>
        </div>
      </section>
    </main>
  );
}

export default Apoyo;