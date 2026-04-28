import { useI18n } from './I18nProvider'

function LanguageToggle({ className = '' }) {
  const { f, language, toggleLanguage } = useI18n()

  return (
    <button
      type="button"
      className={`language-toggle ${className}`.trim()}
      onClick={toggleLanguage}
      aria-label={f('language.toggleLabel')}
      title={f('language.toggleLabel')}
    >
      <span>{language === 'ar' ? 'EN' : 'AR'}</span>
      <small>{f('language.switch')}</small>
    </button>
  )
}

export default LanguageToggle
