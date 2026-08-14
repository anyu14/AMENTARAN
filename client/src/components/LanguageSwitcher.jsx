import { useTranslation } from 'react-i18next'

function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="language-switcher">
      <button
        onClick={() => i18n.changeLanguage('es')}
        disabled={i18n.resolvedLanguage === 'es'}
      >
        ES
      </button>
      <button
        onClick={() => i18n.changeLanguage('ca')}
        disabled={i18n.resolvedLanguage === 'ca'}
      >
        CA
      </button>
    </div>
  )
}

export default LanguageSwitcher
