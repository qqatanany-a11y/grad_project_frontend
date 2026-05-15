import LanguageToggle from '../../i18n/LanguageToggle'
import { useI18n } from '../../i18n/I18nProvider'
import authPageStyles from './authPageStyles'

function AuthLayout({
  heroTitle,
  heroSubtitle,
  formTitle,
  formSubtitle,
  onBack,
  footerLabel,
  onFooterAction,
  children,
}) {
  const { f } = useI18n()

  return (
    <>
      <style>{authPageStyles}</style>
      <div className="ma-page">
        <LanguageToggle className="ma-lang" />

        <div className="ma-image-panel">
          <img src="/event-hero.jpg" alt={f('Elegant event setup')} />
          <div className="ma-image-overlay" />
          <div className="ma-image-text">
            <h1>{f(heroTitle)}</h1>
            <p>{f(heroSubtitle)}</p>
          </div>
        </div>

        <div className="ma-form-panel">
          <div className="ma-form-inner">
            {onBack ? (
              <button type="button" className="ma-back-btn" onClick={onBack}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M9 2L4 7l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {f('Back to Home')}
              </button>
            ) : null}

            <div className="ma-form-header">
              <h2>{f(formTitle)}</h2>
              <p>{f(formSubtitle)}</p>
            </div>

            {children}

            {footerLabel && onFooterAction ? (
              <div className="ma-toggle-wrap">
                <button type="button" className="ma-toggle-btn" onClick={onFooterAction}>
                  {f(footerLabel)}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthLayout
