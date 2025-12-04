import React, { useState } from 'react'
import './Home.css'

function Home({ language, onStart }) {
  const [showToolSelector, setShowToolSelector] = useState(false)

  const t = {
    en: {
      hero: 'File Conversion Made Simple',
      subtitle: 'Fast, secure, browser-based file conversion tools',
      start: 'Get Started',
      tools: 'Available Tools',
      selectTool: 'Select a Tool to Get Started',
      imageConverter: 'Image Converter',
      imageDesc: 'Convert between PNG, JPG, GIF, WEBP, and BMP formats',
      imageResizeCrop: 'Image Resize/Crop',
      imageResizeCropDesc: 'Resize or crop images with precision control',
      cancel: 'Cancel'
    },
    zh: {
      hero: 'DirectConverter - 簡單檔案轉換工具',
      subtitle: '快速、安全的瀏覽器端檔案轉換',
      start: '開始使用',
      tools: '可用工具',
      selectTool: '選擇要使用的工具',
      imageConverter: '圖片轉換',
      imageDesc: '支援 PNG、JPG、GIF、WEBP、BMP 格式轉換',
      imageResizeCrop: '調整/裁切圖片',
      imageResizeCropDesc: '精確調整圖片尺寸或裁切指定區域',
      cancel: '取消'
    }
  }

  const text = t[language] || t.zh

  const handleToolClick = (path) => {
    if (onStart) {
      onStart(path)
    }
    setShowToolSelector(false)
  }

  const handleStartClick = () => {
    setShowToolSelector(true)
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>{text.hero}</h1>
          <p>{text.subtitle}</p>
          <button className="hero-button" onClick={handleStartClick}>
            {text.start}
          </button>
        </div>
      </section>

      <section className="tools-section">
        <h2>{text.tools}</h2>
        <div className="tools-grid">
          <div className="tool-card" onClick={() => handleToolClick('/img_transfer')}>
            <div className="tool-icon">🖼️</div>
            <h3>{text.imageConverter}</h3>
            <p>{text.imageDesc}</p>
          </div>
          <div className="tool-card" onClick={() => handleToolClick('/img_resize')}>
            <div className="tool-icon">📏</div>
            <h3>{text.imageResizeCrop}</h3>
            <p>{text.imageResizeCropDesc}</p>
          </div>
          <div className="tool-card" onClick={() => handleToolClick('/img_compress')}>
            <div className="tool-icon">🗜️</div>
            <h3>圖片壓縮</h3>
            <p>減小圖片檔案大小，節省儲存空間</p>
          </div>
        </div>
      </section>

      {/* 工具選擇對話框 */}
      {showToolSelector && (
        <div className="tool-selector-overlay" onClick={() => setShowToolSelector(false)}>
          <div className="tool-selector-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{text.selectTool}</h2>
            <div className="tool-selector-grid">
              <div className="tool-selector-card" onClick={() => handleToolClick('/img_transfer')}>
                <div className="tool-selector-icon">🖼️</div>
                <h3>{text.imageConverter}</h3>
                <p>{text.imageDesc}</p>
              </div>
              <div className="tool-selector-card" onClick={() => handleToolClick('/img_resize')}>
                <div className="tool-selector-icon">📏</div>
                <h3>{text.imageResizeCrop}</h3>
                <p>{text.imageResizeCropDesc}</p>
              </div>
              <div className="tool-selector-card" onClick={() => handleToolClick('/img_compress')}>
                <div className="tool-selector-icon">🗜️</div>
                <h3>圖片壓縮</h3>
                <p>減小圖片檔案大小，節省儲存空間</p>
              </div>
            </div>
            <button className="cancel-button" onClick={() => setShowToolSelector(false)}>
              {text.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
