import { useTranslation } from 'react-i18next'

// Página provisional: todavía no se ha definido el contenido de "Nosotros".
// El título y el texto ya salen de las traducciones; solo falta redactar
// el contenido real cuando se decida qué va aquí.
function Nosotros() {
  const { t } = useTranslation()

  return (
    <section id="nosotros" style={{ padding: '80px 20px', textAlign: 'center' }}>
      <h2>{t('nosotros.titulo')}</h2>
      <p>{t('nosotros.texto')}</p>
    </section>
  )
}

export default Nosotros
