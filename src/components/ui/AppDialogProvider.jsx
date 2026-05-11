import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useI18n } from '../../i18n/I18nProvider'

const AppDialogContext = createContext({
  confirm: async () => false,
  prompt: async () => null,
})

const dialogStyles = `
  @keyframes dlgFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes dlgPopIn {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .dlg-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: rgba(15, 23, 42, 0.48);
    backdrop-filter: blur(10px);
    animation: dlgFadeIn 0.18s ease both;
  }

  .dlg-shell {
    width: min(100%, 500px);
    border-radius: 24px;
    overflow: hidden;
    background: linear-gradient(180deg, #ffffff 0%, #faf8ff 100%);
    border: 1px solid rgba(99, 102, 241, 0.16);
    box-shadow: 0 30px 80px rgba(15, 23, 42, 0.28);
    animation: dlgPopIn 0.24s cubic-bezier(0.22, 1, 0.36, 1) both;
    font-family: 'Inter', sans-serif;
    color: #1e1b4b;
  }

  .dlg-shell.danger {
    border-color: rgba(244, 63, 94, 0.2);
  }

  .dlg-head {
    display: flex;
    gap: 0.95rem;
    align-items: flex-start;
    padding: 1.15rem 1.25rem 1rem;
    background:
      radial-gradient(circle at top right, rgba(244, 63, 94, 0.08), transparent 42%),
      linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(244, 63, 94, 0.04));
    border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  }

  .dlg-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #4338ca;
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.16), rgba(129, 140, 248, 0.12));
    border: 1px solid rgba(79, 70, 229, 0.12);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
  }

  .dlg-shell.danger .dlg-icon {
    color: #be123c;
    background: linear-gradient(135deg, rgba(244, 63, 94, 0.14), rgba(251, 113, 133, 0.1));
    border-color: rgba(244, 63, 94, 0.14);
  }

  .dlg-copy-wrap {
    min-width: 0;
    flex: 1;
  }

  .dlg-kicker {
    display: inline-flex;
    align-items: center;
    padding: 0.22rem 0.6rem;
    border-radius: 999px;
    margin-bottom: 0.65rem;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #4f46e5;
    background: rgba(79, 70, 229, 0.08);
    border: 1px solid rgba(79, 70, 229, 0.12);
  }

  .dlg-shell.danger .dlg-kicker {
    color: #be123c;
    background: rgba(244, 63, 94, 0.08);
    border-color: rgba(244, 63, 94, 0.14);
  }

  .dlg-title {
    margin: 0;
    font-size: 1.08rem;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #1e1b4b;
  }

  .dlg-body {
    padding: 1rem 1.25rem 1.25rem;
  }

  .dlg-message {
    margin: 0;
    font-size: 0.96rem;
    line-height: 1.75;
    color: #334155;
  }

  .dlg-description {
    margin: 0.55rem 0 0;
    font-size: 0.82rem;
    line-height: 1.7;
    color: #64748b;
  }

  .dlg-field {
    margin-top: 1rem;
  }

  .dlg-label {
    display: block;
    margin-bottom: 0.45rem;
    font-size: 0.73rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #64748b;
  }

  .dlg-input {
    width: 100%;
    min-height: 112px;
    padding: 0.9rem 1rem;
    border-radius: 16px;
    border: 1.5px solid #dbe3f0;
    background: rgba(248, 250, 252, 0.92);
    color: #1e1b4b;
    font: inherit;
    font-size: 0.92rem;
    line-height: 1.65;
    resize: vertical;
    box-sizing: border-box;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }

  .dlg-input:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    background: #ffffff;
  }

  .dlg-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.7rem;
    margin-top: 1.15rem;
  }

  .dlg-btn {
    min-width: 118px;
    height: 2.85rem;
    padding: 0 1.15rem;
    border-radius: 999px;
    border: none;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 800;
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease, background 0.18s ease;
  }

  .dlg-btn:hover {
    transform: translateY(-1px);
  }

  .dlg-btn:disabled {
    opacity: 0.6;
    cursor: wait;
    transform: none;
  }

  .dlg-btn.secondary {
    color: #475569;
    background: #ffffff;
    border: 1.5px solid #dbe3f0;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  }

  .dlg-btn.secondary:hover {
    background: #f8fafc;
  }

  .dlg-btn.primary {
    color: #ffffff;
    background: linear-gradient(135deg, #4f46e5, #3730a3);
    box-shadow: 0 12px 24px rgba(79, 70, 229, 0.26);
  }

  .dlg-shell.danger .dlg-btn.primary {
    background: linear-gradient(135deg, #e11d48, #9f1239);
    box-shadow: 0 12px 24px rgba(225, 29, 72, 0.24);
  }

  .dlg-shell[dir='rtl'] .dlg-copy-wrap,
  .dlg-shell[dir='rtl'] .dlg-body,
  .dlg-shell[dir='rtl'] .dlg-input {
    text-align: right;
  }

  .dlg-shell[dir='rtl'] .dlg-actions {
    flex-direction: row-reverse;
  }

  @media (max-width: 640px) {
    .dlg-backdrop {
      padding: 1rem;
    }

    .dlg-shell {
      border-radius: 20px;
    }

    .dlg-head,
    .dlg-body {
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .dlg-actions {
      flex-direction: column-reverse;
      align-items: stretch;
    }

    .dlg-shell[dir='rtl'] .dlg-actions {
      flex-direction: column-reverse;
    }

    .dlg-btn {
      width: 100%;
    }
  }
`

function resolveText(f, value, values) {
  if (!value) {
    return ''
  }

  return f(value, values)
}

function getCancelResult(dialog) {
  return dialog?.type === 'prompt' ? null : false
}

export function AppDialogProvider({ children }) {
  const { direction, f } = useI18n()
  const resolverRef = useRef(null)
  const latestDialogRef = useRef(null)
  const confirmButtonRef = useRef(null)
  const inputRef = useRef(null)
  const [dialog, setDialog] = useState(null)
  const [inputValue, setInputValue] = useState('')

  const closeCurrentDialog = (result) => {
    const resolver = resolverRef.current

    resolverRef.current = null
    latestDialogRef.current = null
    setDialog(null)
    setInputValue('')

    resolver?.(result)
  }

  const openDialog = (type, options = {}) =>
    new Promise((resolve) => {
      if (resolverRef.current && latestDialogRef.current) {
        resolverRef.current(getCancelResult(latestDialogRef.current))
      }

      const nextDialog = {
        type,
        tone: options.tone === 'danger' ? 'danger' : 'primary',
        ...options,
      }

      resolverRef.current = resolve
      latestDialogRef.current = nextDialog
      setInputValue(options.initialValue ?? '')
      setDialog(nextDialog)
    })

  const contextValue = {
    confirm: (options = {}) => openDialog('confirm', options),
    prompt: (options = {}) => openDialog('prompt', options),
  }

  useEffect(() => {
    return () => {
      if (resolverRef.current && latestDialogRef.current) {
        resolverRef.current(getCancelResult(latestDialogRef.current))
      }
    }
  }, [])

  useEffect(() => {
    if (!dialog) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTarget = window.setTimeout(() => {
      if (dialog.type === 'prompt') {
        inputRef.current?.focus()
        return
      }

      confirmButtonRef.current?.focus()
    }, 20)

    return () => {
      document.body.style.overflow = previousOverflow
      window.clearTimeout(focusTarget)
    }
  }, [dialog])

  useEffect(() => {
    if (!dialog) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeCurrentDialog(getCancelResult(dialog))
        return
      }

      if (event.key === 'Enter' && dialog.type === 'confirm') {
        event.preventDefault()
        closeCurrentDialog(true)
        return
      }

      if (
        event.key === 'Enter' &&
        dialog.type === 'prompt' &&
        (event.ctrlKey || event.metaKey)
      ) {
        event.preventDefault()
        closeCurrentDialog(inputValue.trim())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dialog, inputValue])

  const translatedTitle = resolveText(
    f,
    dialog?.title ?? (dialog?.type === 'prompt' ? 'Action required' : 'Confirm action'),
    dialog?.titleValues,
  )
  const translatedKicker = resolveText(
    f,
    dialog?.kicker ?? 'System notice',
    dialog?.kickerValues,
  )
  const translatedMessage = resolveText(
    f,
    dialog?.message,
    dialog?.messageValues,
  )
  const translatedDescription = resolveText(
    f,
    dialog?.description,
    dialog?.descriptionValues,
  )
  const translatedInputLabel = resolveText(
    f,
    dialog?.inputLabel,
    dialog?.inputLabelValues,
  )
  const translatedPlaceholder = resolveText(
    f,
    dialog?.placeholder,
    dialog?.placeholderValues,
  )
  const translatedConfirmLabel = resolveText(
    f,
    dialog?.confirmLabel ?? 'Confirm',
    dialog?.confirmLabelValues,
  )
  const translatedCancelLabel = resolveText(
    f,
    dialog?.cancelLabel ?? 'Cancel',
    dialog?.cancelLabelValues,
  )

  return (
    <AppDialogContext.Provider value={contextValue}>
      {children}

      {dialog ? (
        <>
          <style>{dialogStyles}</style>
          <div
            className="dlg-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeCurrentDialog(getCancelResult(dialog))
              }
            }}
          >
            <section
              className={`dlg-shell${dialog.tone === 'danger' ? ' danger' : ''}`}
              dir={direction}
              role="dialog"
              aria-modal="true"
              aria-labelledby="app-dialog-title"
              aria-describedby="app-dialog-message"
            >
              <div className="dlg-head">
                <div className="dlg-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
                    {dialog.type === 'prompt' ? (
                      <>
                        <path d="M3.75 14.25h10.5" strokeLinecap="round" />
                        <path d="M9 3.5c-2.14 0-3.75 1.34-3.75 3.17 0 1.3.76 2.14 1.85 2.83.58.36.9.77.9 1.5v.25" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="9" cy="13" r=".8" fill="currentColor" stroke="none" />
                      </>
                    ) : (
                      <>
                        <path d="M9 2.75L15 5.2v3.3c0 3.4-2.08 5.94-6 6.75-3.92-.81-6-3.35-6-6.75V5.2L9 2.75z" strokeLinejoin="round" />
                        <path d="M6.7 9.05l1.55 1.55 3.1-3.2" strokeLinecap="round" strokeLinejoin="round" />
                      </>
                    )}
                  </svg>
                </div>

                <div className="dlg-copy-wrap">
                  <div className="dlg-kicker">{translatedKicker}</div>
                  <h2 id="app-dialog-title" className="dlg-title">
                    {translatedTitle}
                  </h2>
                </div>
              </div>

              <div className="dlg-body">
                {translatedMessage ? (
                  <p id="app-dialog-message" className="dlg-message">
                    {translatedMessage}
                  </p>
                ) : null}

                {translatedDescription ? (
                  <p className="dlg-description">{translatedDescription}</p>
                ) : null}

                {dialog.type === 'prompt' ? (
                  <div className="dlg-field">
                    {translatedInputLabel ? (
                      <label className="dlg-label" htmlFor="app-dialog-input">
                        {translatedInputLabel}
                      </label>
                    ) : null}

                    <textarea
                      id="app-dialog-input"
                      ref={inputRef}
                      className="dlg-input"
                      value={inputValue}
                      placeholder={translatedPlaceholder}
                      onChange={(event) => setInputValue(event.target.value)}
                    />
                  </div>
                ) : null}

                <div className="dlg-actions">
                  <button
                    type="button"
                    className="dlg-btn secondary"
                    onClick={() => closeCurrentDialog(getCancelResult(dialog))}
                  >
                    {translatedCancelLabel}
                  </button>
                  <button
                    ref={confirmButtonRef}
                    type="button"
                    className="dlg-btn primary"
                    onClick={() =>
                      closeCurrentDialog(
                        dialog.type === 'prompt' ? inputValue.trim() : true,
                      )
                    }
                  >
                    {translatedConfirmLabel}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </AppDialogContext.Provider>
  )
}

export function useAppDialog() {
  return useContext(AppDialogContext)
}
