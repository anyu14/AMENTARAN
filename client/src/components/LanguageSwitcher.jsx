import { useTranslation } from 'react-i18next'

function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="language-switcher" translate="no" aria-label="Idioma">
      <button
        type="button"
        translate="no"
        onClick={() => i18n.changeLanguage('es')}
        disabled={i18n.resolvedLanguage === 'es'}
      >
        ES
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        translate="no"
        onClick={() => i18n.changeLanguage('ca')}
        disabled={i18n.resolvedLanguage === 'ca'}
      >
        Català
      </button>
    </div>
  )
}

export default LanguageSwitcher
