/**
 * Application entry point that bootstraps the React application.
 * This file is responsible for:
 * - Setting up the React root with StrictMode for development checks
 * - Configuring BrowserRouter for client-side routing
 * - Importing global styles
 * - Mounting the main App component
 * 
 * The application uses React 18's createRoot API for improved rendering performance
 * and concurrent features support.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter} from 'react-router-dom'
import './css/global.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)


