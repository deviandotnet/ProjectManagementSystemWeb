import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProviders } from './app/AppProviders.jsx'
import 'react-datepicker/dist/react-datepicker.css'
import '@fontsource-variable/manrope'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
)
