import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Home from './components/Home'
import ImageConverterTool from './components/ImageConverterTool'
import ImageResizeCropTool from './components/ImageResizeCropTool'
import errorLogger, { setupGlobalErrorHandling } from './services/errorLogger'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          backgroundColor: '#ffebee',
          borderRadius: '8px',
          margin: '20px',
          color: '#c62828'
        }}>
          <h3>❌ 應用程序錯誤</h3>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} style={{
            padding: '10px 20px',
            backgroundColor: '#c62828',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}>
            重新載入頁面
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [message, setMessage] = useState({ type: '', text: '', show: false })
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dctools-language') || 'zh'
  })
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dctools-theme') || 'light'
  })

  // Initialize error handling on mount
  useEffect(() => {
    setupGlobalErrorHandling()

    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode')
      document.body.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
      document.body.classList.remove('dark-mode')
    }
  }, [theme])

  const showMessage = (type, text, duration = 3000) => {
    setMessage({ type, text, show: true })
    if (duration > 0) {
      setTimeout(() => {
        setMessage({ type: '', text: '', show: false })
      }, duration)
    }
  }

  const handleNavigate = (path) => {
    navigate(path)
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    localStorage.setItem('dctools-language', newLanguage)
  }

  const handleThemeChange = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('dctools-theme', newTheme)
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <Header 
          onNavigate={handleNavigate}
          currentPath={location.pathname}
          language={language}
          onLanguageChange={handleLanguageChange}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
        <div className="app-container">
          <main className="main-content">
            {message.show && (
              <div className={`message message-${message.type}`}>
                <span>{message.text}</span>
                <button 
                  className="message-close" 
                  onClick={() => setMessage({ ...message, show: false })}
                >
                  ✕
                </button>
              </div>
            )}

            <Routes>
              <Route 
                path="/" 
                element={
                  <Home 
                    language={language} 
                    onStart={(path) => navigate(path)}
                  />
                } 
              />
              <Route 
                path="/img_transfer" 
                element={
                  <ImageConverterTool 
                    onShowMessage={showMessage}
                    showMessage={showMessage}
                    message={message}
                  />
                } 
              />
              <Route 
                path="/img_resize" 
                element={
                  <ImageResizeCropTool 
                    onShowMessage={showMessage}
                    showMessage={showMessage}
                    message={message}
                  />
                } 
              />
              <Route 
                path="*" 
                element={
                  <div className="tool-content">
                    <div className="tool-header">
                      <h2>404 - 頁面不存在</h2>
                      <p>請返回首頁選擇工具</p>
                      <button onClick={() => navigate('/')}>返回首頁</button>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App
