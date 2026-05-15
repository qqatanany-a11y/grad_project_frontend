import LanguageToggle from '../../i18n/LanguageToggle'
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
  return (
    <>
      <style>{authPageStyles}</style>
      <div className="ma-page">
        <LanguageToggle className="ma-lang" />

        <div className="ma-image-panel">
          <img src="/event-hero.png" alt="Elegant event setup" />
          <div className="ma-image-overlay" />
          <div className="ma-image-text">
            <h1>{heroTitle}</h1>
            <p>{heroSubtitle}</p>
          </div>
        </div>

        <div className="ma-form-panel">
          <div className="ma-form-inner">
            {onBack ? (
              <button type="button" className="ma-back-btn" onClick={onBack}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M9 2L4 7l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Home
              </button>
            ) : null}

            <div className="ma-form-header">
              <h2>{formTitle}</h2>
              <p>{formSubtitle}</p>
            </div>

            {children}

            {footerLabel && onFooterAction ? (
              <div className="ma-toggle-wrap">
                <button type="button" className="ma-toggle-btn" onClick={onFooterAction}>
                  {footerLabel}
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
