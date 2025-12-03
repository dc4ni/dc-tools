import React, { useState } from 'react'
import './Header.css'

function Header({ onNavigate, language, onLanguageChange, theme, onThemeChange }) {
  const [showToolsDropdown, setShowToolsDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const t = {
    en: {
      home: 'Home',
      tools: 'Tools',
      about: 'About',
      toolCategories: {
        imageTools: 'Image Tools',
        pdfTools: 'PDF Tools',
        videoTools: 'Video Tools',
        audioTools: 'Audio Tools'
      },
      imageToolsList: {
        imageConverter: 'Image Converter',
        imageCompress: 'Compress Image',
        imageResizeCrop: 'Resize/Crop Image'
      },
      pdfToolsList: {
        pdfMerge: 'Merge PDF',
        pdfSplit: 'Split PDF',
        pdfCompress: 'Compress PDF',
        pdfToWord: 'PDF to Word'
      }
    },
    zh: {
      home: '首頁',
      tools: '工具',
      about: '關於',
      toolCategories: {
        imageTools: '圖片工具',
        pdfTools: 'PDF工具',
        videoTools: '影片工具',
        audioTools: '音訊工具'
      },
      imageToolsList: {
        imageConverter: '圖片格式轉換',
        imageCompress: '圖片壓縮',
        imageResizeCrop: '調整/裁切圖片尺寸'
      },
      pdfToolsList: {
        pdfMerge: '合併PDF',
        pdfSplit: '分割PDF',
        pdfCompress: '壓縮PDF',
        pdfToWord: 'PDF轉Word'
      }
    }
  }

  const text = t[language]

  const handleToolClick = (path) => {
    setShowToolsDropdown(false)
    setShowMobileMenu(false)
    if (onNavigate) {
      onNavigate(path)
    }
  }

  const handleNavClick = (path) => {
    setShowMobileMenu(false)
    if (onNavigate) {
      onNavigate(path)
    }
  }

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => onNavigate && onNavigate('/')}>
          <h1>DirectConverter</h1>
        </div>

        {/* Navigation */}
        <nav className="header-nav">
          <button className="nav-link" onClick={() => onNavigate && onNavigate('/')}>
            {text.home}
          </button>
          
          {/* Tools Dropdown */}
          <div 
            className="nav-dropdown"
            onMouseEnter={() => setShowToolsDropdown(true)}
            onMouseLeave={() => setShowToolsDropdown(false)}
          >
            <button className="nav-link">
              {text.tools}
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showToolsDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-section">
                  <h3 className="dropdown-title">{text.toolCategories.imageTools}</h3>
                  <button className="dropdown-item" onClick={() => handleToolClick('/img_transfer')}>
                    <span className="tool-icon">🖼️</span>
                    {text.imageToolsList.imageConverter}
                  </button>
                  <button className="dropdown-item" onClick={() => handleToolClick('/img_resize')}>
                    <span className="tool-icon">📏</span>
                    {text.imageToolsList.imageResizeCrop}
                  </button>
                  <button className="dropdown-item" onClick={() => handleToolClick('/img_compress')}>
                    <span className="tool-icon"></span>
                    圖片壓縮
                  </button>
                </div>

                <div className="dropdown-divider"></div>

                <div className="dropdown-section">
                  <h3 className="dropdown-title">{text.toolCategories.pdfTools}</h3>
                  <button className="dropdown-item disabled">
                    <span className="tool-icon">📑</span>
                    {text.pdfToolsList.pdfMerge}
                    <span className="coming-soon">{language === 'zh' ? '即將推出' : 'Soon'}</span>
                  </button>
                  <button className="dropdown-item disabled">
                    <span className="tool-icon">✂️</span>
                    {text.pdfToolsList.pdfSplit}
                    <span className="coming-soon">{language === 'zh' ? '即將推出' : 'Soon'}</span>
                  </button>
                  <button className="dropdown-item disabled">
                    <span className="tool-icon">📦</span>
                    {text.pdfToolsList.pdfCompress}
                    <span className="coming-soon">{language === 'zh' ? '即將推出' : 'Soon'}</span>
                  </button>
                  <button className="dropdown-item disabled">
                    <span className="tool-icon">📄</span>
                    {text.pdfToolsList.pdfToWord}
                    <span className="coming-soon">{language === 'zh' ? '即將推出' : 'Soon'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="nav-link" onClick={() => onNavigate && onNavigate('about')}>
            {text.about}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="header-actions">
          {/* Language Toggle */}
          <div className="language-switcher">
            <button 
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => onLanguageChange('en')}
            >
              EN
            </button>
            <span className="lang-divider">/</span>
            <button 
              className={`lang-btn ${language === 'zh' ? 'active' : ''}`}
              onClick={() => onLanguageChange('zh')}
            >
              中
            </button>
          </div>

          {/* Theme Toggle */}
          <button 
            className="theme-toggle"
            onClick={onThemeChange}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <>
          <div className="mobile-overlay" onClick={() => setShowMobileMenu(false)}></div>
          <div className="mobile-menu">
            <button className="mobile-nav-link" onClick={() => handleNavClick('home')}>
              {text.home}
            </button>

            {/* Image Tools */}
            <div className="mobile-section">
              <div className="mobile-section-title">{text.toolCategories.imageTools}</div>
              <button className="mobile-nav-link mobile-tool" onClick={() => handleToolClick('image-converter')}>
                <span className="tool-icon">🖼️</span>
                {text.imageToolsList.imageConverter}
              </button>
              <button className="mobile-nav-link mobile-tool" onClick={() => handleToolClick('image-resize-crop')}>
                <span className="tool-icon">📏</span>
                {text.imageToolsList.imageResizeCrop}
              </button>
              <button className="mobile-nav-link mobile-tool disabled">
                <span className="tool-icon">📦</span>
                {text.imageToolsList.imageCompress}
                <span className="coming-soon">{language === 'zh' ? '即將推出' : 'Soon'}</span>
              </button>
            </div>

            {/* PDF Tools */}
            <div className="mobile-section">
              <div className="mobile-section-title">{text.toolCategories.pdfTools}</div>
              <button className="mobile-nav-link mobile-tool disabled">
                <span className="tool-icon">📑</span>
                {text.pdfToolsList.pdfMerge}
                <span className="coming-soon">{language === 'zh' ? '即將推出' : 'Soon'}</span>
              </button>
              <button className="mobile-nav-link mobile-tool disabled">
                <span className="tool-icon">✂️</span>
                {text.pdfToolsList.pdfSplit}
                <span className="coming-soon">{language === 'zh' ? '即將推出' : 'Soon'}</span>
              </button>
              <button className="mobile-nav-link mobile-tool disabled">
                <span className="tool-icon">📦</span>
                {text.pdfToolsList.pdfCompress}
                <span className="coming-soon">{language === 'zh' ? '即將推出' : 'Soon'}</span>
              </button>
              <button className="mobile-nav-link mobile-tool disabled">
                <span className="tool-icon">📄</span>
                {text.pdfToolsList.pdfToWord}
                <span className="coming-soon">{language === 'zh' ? '即將推出' : 'Soon'}</span>
              </button>
            </div>

            <button className="mobile-nav-link" onClick={() => handleNavClick('about')}>
              {text.about}
            </button>
          </div>
        </>
      )}
    </header>
  )
}

export default Header
