import { useI18n } from './I18nProvider'

function LanguageToggle({ className = '' }) {
  const { f, toggleLanguage } = useI18n()

  return (
    <button
      type="button"
      className={`language-toggle ${className}`.trim()}
      onClick={toggleLanguage}
      aria-label={f('language.toggleLabel')}
      title={f('language.toggleLabel')}
    >
      <span>{f('language.switch')}</span>
    </button>
  )
}

export default LanguageToggle
