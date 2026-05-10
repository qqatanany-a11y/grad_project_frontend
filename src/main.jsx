import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './app/App'
import { I18nProvider } from './i18n/I18nProvider'
import { AppDialogProvider } from './components/ui/AppDialogProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <AppDialogProvider>
        <App />
      </AppDialogProvider>
    </I18nProvider>
  </StrictMode>,
)
