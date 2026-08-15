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
    fallbackLng: 'es', // si el idioma detectado no es es/ca, se usa castellano
    interpolation: {
      escapeValue: false, // React ya protege contra XSS, no hace falta aquí
    },
  })

export default i18n
