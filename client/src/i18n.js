import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import es from './locales/es/translation.json'
import ca from './locales/ca/translation.json'

i18n
  // Detecta el idioma del navegador y recuerda la elección del usuario
  // (la guarda en localStorage) para no perderla al recargar la página.
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      ca: { translation: ca },
    },
    supportedLngs: ['es', 'ca'],
    fallbackLng: 'es', // si el idioma detectado no es es/ca, se usa castellano
    interpolation: {
      escapeValue: false, // React ya protege contra XSS, no hace falta aquí
    },
  })

const actualizarIdiomaDocumento = (idioma) => {
  document.documentElement.lang = idioma === 'ca' ? 'ca' : 'es'
}

actualizarIdiomaDocumento(i18n.resolvedLanguage)
i18n.on('languageChanged', actualizarIdiomaDocumento)

export default i18n
