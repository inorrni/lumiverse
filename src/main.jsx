import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { GoalProvider } from './store/GoalStore'
import { AuthProvider } from './store/AuthStore'
import './styles/tokens.css'
import './styles/base.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <GoalProvider>
          <App />
        </GoalProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
