import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SnackbarProvider } from 'notistack'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SnackbarProvider
      maxSnack={1}
      autoHideDuration={6000}  // Hide after 6 seconds
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}  // Position at top center
    >
      <App />
    </SnackbarProvider>
  </StrictMode>
)
