import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { GoalProvider } from './store/GoalStore'
import { AuthProvider } from './store/AuthStore'
import { applyTheme, getStoredTheme } from './lib/theme'
import './styles/tokens.css'
import './styles/base.css'

// 저장된 디자인 테마(먹/갱지)를 첫 렌더 전에 적용한다.
applyTheme(getStoredTheme())

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
