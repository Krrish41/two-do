import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { App } from './App'
import './styles/globals.css'

import { useAuthStore } from './stores/authStore'
import { useNoteStore } from './stores/noteStore'

if (import.meta.env.DEV) {
  ;(window as any).useAuthStore = useAuthStore
  ;(window as any).useNoteStore = useNoteStore
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
