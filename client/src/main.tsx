import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Auth0Provider } from '@auth0/auth0-react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-3b0bw5hp3oltxoac.us.auth0.com"
      clientId="hQFFAUyKQ2GUUfy7YpV7tWYssMiM1cJN"
      authorizationParams={{
        redirect_uri: window.location.origin + "/quizzes"
      }}
    >
      <App />
    </Auth0Provider>

  </StrictMode>,
)
