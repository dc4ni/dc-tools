import React, { useMemo, useState } from 'react'
import './SideMenu.css'

function SideMenu({ isOpen, onClose, activeTab, onTabChange, searchTerm = '', onSearchChange }) {
  const [expandedCategories, setExpandedCategories] = useState({
    image: true,
    document: false,
    audio: false,
    code: false
  })

  const toolCategories = {
    image: {
      name: '📸 圖片工具',
      icon: '📸',
      tools: [
        {
          id: 'image-converter',
          name: '圖片轉換',
          description: '轉換圖片格式 (PNG, JPG, GIF, BMP, WEBP)',
          disabled: false
        },
        {
          id: 'image-resize',
          name: '圖片縮放',
          description: '調整圖片尺寸',
          disabled: true
        },
        {
          id: 'image-compress',
          name: '圖片壓縮',
          description: '壓縮圖片檔案大小',
          disabled: true
        },
        {
          id: 'image-watermark',
          name: '圖片浮水印',
          description: '為圖片添加浮水印',
          disabled: true
        }
      ]
    },
    document: {
      name: '📄 文檔工具',
      icon: '📄',
      tools: [
        {
          id: 'pdf-converter',
          name: 'PDF 轉換',
          description: '轉換 PDF 格式',
          disabled: true
        },
        {
          id: 'word-converter',
          name: 'Word 轉換',
          description: '轉換 Word 格式',
          disabled: true
        },
        {
          id: 'excel-converter',
          name: 'Excel 轉換',
          description: '轉換 Excel 格式',
          disabled: true
        }
      ]
    },
    audio: {
      name: '🎵 音頻工具',
      icon: '🎵',
      tools: [
        {
          id: 'audio-converter',
          name: '音頻轉換',
          description: '轉換音頻格式',
          disabled: true
        },
        {
          id: 'audio-merge',
          name: '音頻合併',
          description: '合併多個音頻檔案',
          disabled: true
        },
        {
          id: 'audio-trim',
          name: '音頻裁剪',
          description: '裁剪音頻片段',
          disabled: true
        }
      ]
    },
    code: {
      name: '💻 代碼工具',
      icon: '💻',
      tools: [
        {
          id: 'json-formatter',
          name: 'JSON 格式化',
          description: '格式化 JSON 代碼',
          disabled: true
        },
        {
          id: 'code-minify',
          name: '代碼壓縮',
          description: '壓縮代碼',
          disabled: true
        },
        {
          id: 'regex-tester',
          name: '正則測試',
          description: '測試正則表達式',
          disabled: true
        }
      ]
    }
  }

  const filteredCategories = useMemo(() => {
    const query = (searchTerm || '').trim().toLowerCase()
    if (!query) return toolCategories

    const filtered = {}
    Object.entries(toolCategories).forEach(([key, category]) => {
      const matchedTools = category.tools.filter((tool) => {
        return (
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query)
        )
      })
      if (matchedTools.length > 0) {
        filtered[key] = { ...category, tools: matchedTools }
      }
    })
    return Object.keys(filtered).length > 0 ? filtered : {}
  }, [searchTerm])

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const handleToolClick = (toolId, isDisabled) => {
    if (!isDisabled) {
      onTabChange(toolId)
      if (window.innerWidth <= 768) {
        onClose()
      }
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="sidemenu-overlay" onClick={onClose}></div>
      )}
      
      <aside className={`sidemenu ${isOpen ? 'open' : ''}`}>
        <div className="sidemenu-header">
          <h2>🔧 工具</h2>
          <button 
            className="sidemenu-close"
            onClick={onClose}
            title="關閉菜單"
          >
            ✕
          </button>
        </div>

        <nav className="sidemenu-nav">
          <div className="sidemenu-search">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="搜尋工具..."
            />
          </div>

          {Object.entries(filteredCategories).length === 0 && (
            <div className="sidemenu-empty">找不到相關工具</div>
          )}

          {Object.entries(filteredCategories).map(([categoryKey, category]) => {
            const isExpanded = (searchTerm || '').trim() ? true : expandedCategories[categoryKey]
            return (
            <div key={categoryKey} className="sidemenu-category">
              <button
                className={`sidemenu-category-header ${isExpanded ? 'expanded' : ''}`}
                onClick={() => toggleCategory(categoryKey)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span className="category-toggle">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </button>
              
              {isExpanded && (
                <div className="sidemenu-category-items">
                  {category.tools.map(tool => (
                    <button
                      key={tool.id}
                      className={`sidemenu-item ${activeTab === tool.id ? 'active' : ''} ${tool.disabled ? 'disabled' : ''}`}
                      onClick={() => handleToolClick(tool.id, tool.disabled)}
                      disabled={tool.disabled}
                      title={tool.disabled ? '敬請期待' : tool.description}
                    >
                      <div className="sidemenu-text">
                        <div className="sidemenu-name">{tool.name}</div>
                        {tool.disabled && (
                          <div className="sidemenu-status">敬請期待</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )})}
        </nav>

        <div className="sidemenu-footer">
          <p className="version-info">DC Tools v1.0.0</p>
          <p className="copyright">© 2026 DC Tools. All rights reserved.</p>
        </div>
      </aside>
    </>
  )
}

export default SideMenu
