import React, { useState, useRef, useEffect } from 'react'
import './ImageResizeCropTool.css'

function ImageResizeCropTool({ onShowMessage }) {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [mode, setMode] = useState('resize') // 'resize' or 'crop'
  const [outputFormat, setOutputFormat] = useState('png')
  const [quality, setQuality] = useState(85)
  
  // Resize state
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [keepAspectRatio, setKeepAspectRatio] = useState(true)
  const [originalAspectRatio, setOriginalAspectRatio] = useState(null)
  
  // Crop state
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 200, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 })
  
  const fileInputRef = useRef(null)
  const imageRef = useRef(null)
  const cropContainerRef = useRef(null)

  const supportedFormats = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp']

  // 處理檔案上傳
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!supportedFormats.includes(file.type)) {
      onShowMessage('error', '只支援 PNG、JPG、GIF、BMP、WEBP 格式')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      onShowMessage('error', '檔案過大，最大 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const aspectRatio = img.width / img.height
        setOriginalAspectRatio(aspectRatio)
        setWidth(img.width)
        setHeight(img.height)
      }
      img.src = event.target.result
      
      setUploadedFile({
        file,
        name: file.name,
        preview: event.target.result,
        size: file.size
      })
    }
    reader.readAsDataURL(file)
  }

  // 處理寬度變更
  const handleWidthChange = (value) => {
    setWidth(value)
    if (keepAspectRatio && originalAspectRatio && value) {
      setHeight(Math.round(value / originalAspectRatio))
    }
  }

  // 處理高度變更
  const handleHeightChange = (value) => {
    setHeight(value)
    if (keepAspectRatio && originalAspectRatio && value) {
      setWidth(Math.round(value * originalAspectRatio))
    }
  }

  // 裁切區域拖曳 - 開始
  const handleCropMouseDown = (e) => {
    if (mode !== 'crop' || !imageRef.current) return
    e.preventDefault()
    e.stopPropagation()
    
    const imageRect = imageRef.current.getBoundingClientRect()
    const scaleX = imageNaturalSize.width / imageRect.width
    const scaleY = imageNaturalSize.height / imageRect.height
    
    const relativeX = (e.clientX - imageRect.left) * scaleX
    const relativeY = (e.clientY - imageRect.top) * scaleY
    
    setIsDragging(true)
    setDragStart({
      x: relativeX - cropArea.x,
      y: relativeY - cropArea.y
    })
  }

  // 裁切區域調整大小 - 開始
  const handleResizeMouseDown = (e, handle) => {
    if (mode !== 'crop' || !imageRef.current) return
    e.preventDefault()
    e.stopPropagation()
    
    setIsResizing(true)
    setResizeHandle(handle)
    
    const imageRect = imageRef.current.getBoundingClientRect()
    const scaleX = imageNaturalSize.width / imageRect.width
    const scaleY = imageNaturalSize.height / imageRect.height
    
    setDragStart({ 
      x: (e.clientX - imageRect.left) * scaleX,
      y: (e.clientY - imageRect.top) * scaleY,
      cropX: cropArea.x,
      cropY: cropArea.y,
      cropWidth: cropArea.width,
      cropHeight: cropArea.height
    })
  }

  // 滑鼠移動
  const handleMouseMove = (e) => {
    if (!imageRef.current) return

    const imageRect = imageRef.current.getBoundingClientRect()
    const scaleX = imageNaturalSize.width / imageRect.width
    const scaleY = imageNaturalSize.height / imageRect.height
    
    const currentX = (e.clientX - imageRect.left) * scaleX
    const currentY = (e.clientY - imageRect.top) * scaleY

    if (isDragging) {
      // 拖曳移動裁切區域
      let newX = currentX - dragStart.x
      let newY = currentY - dragStart.y

      // 限制在圖片範圍內
      newX = Math.max(0, Math.min(newX, imageNaturalSize.width - cropArea.width))
      newY = Math.max(0, Math.min(newY, imageNaturalSize.height - cropArea.height))

      setCropArea(prev => ({ ...prev, x: newX, y: newY }))
      
    } else if (isResizing && resizeHandle) {
      // 調整裁切區域大小
      const deltaX = currentX - dragStart.x
      const deltaY = currentY - dragStart.y

      let newCrop = { ...cropArea }
      const minSize = 30 // 最小尺寸

      switch (resizeHandle) {
        case 'nw': // 左上
          const newNWWidth = dragStart.cropWidth - deltaX
          const newNWHeight = dragStart.cropHeight - deltaY
          
          if (newNWWidth >= minSize && dragStart.cropX + deltaX >= 0) {
            newCrop.x = dragStart.cropX + deltaX
            newCrop.width = newNWWidth
          }
          if (newNWHeight >= minSize && dragStart.cropY + deltaY >= 0) {
            newCrop.y = dragStart.cropY + deltaY
            newCrop.height = newNWHeight
          }
          break
          
        case 'ne': // 右上
          const newNEWidth = dragStart.cropWidth + deltaX
          const newNEHeight = dragStart.cropHeight - deltaY
          
          if (newNEWidth >= minSize && dragStart.cropX + newNEWidth <= imageNaturalSize.width) {
            newCrop.width = newNEWidth
          }
          if (newNEHeight >= minSize && dragStart.cropY + deltaY >= 0) {
            newCrop.y = dragStart.cropY + deltaY
            newCrop.height = newNEHeight
          }
          break
          
        case 'sw': // 左下
          const newSWWidth = dragStart.cropWidth - deltaX
          const newSWHeight = dragStart.cropHeight + deltaY
          
          if (newSWWidth >= minSize && dragStart.cropX + deltaX >= 0) {
            newCrop.x = dragStart.cropX + deltaX
            newCrop.width = newSWWidth
          }
          if (newSWHeight >= minSize && dragStart.cropY + newSWHeight <= imageNaturalSize.height) {
            newCrop.height = newSWHeight
          }
          break
          
        case 'se': // 右下
          const newSEWidth = dragStart.cropWidth + deltaX
          const newSEHeight = dragStart.cropHeight + deltaY
          
          if (newSEWidth >= minSize && dragStart.cropX + newSEWidth <= imageNaturalSize.width) {
            newCrop.width = newSEWidth
          }
          if (newSEHeight >= minSize && dragStart.cropY + newSEHeight <= imageNaturalSize.height) {
            newCrop.height = newSEHeight
          }
          break
      }

      // 確保不超出圖片邊界
      newCrop.x = Math.max(0, Math.min(newCrop.x, imageNaturalSize.width - newCrop.width))
      newCrop.y = Math.max(0, Math.min(newCrop.y, imageNaturalSize.height - newCrop.height))
      newCrop.width = Math.max(minSize, Math.min(newCrop.width, imageNaturalSize.width - newCrop.x))
      newCrop.height = Math.max(minSize, Math.min(newCrop.height, imageNaturalSize.height - newCrop.y))

      setCropArea(newCrop)
    }
  }

  // 滑鼠放開
  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle(null)
  }

  // 添加和移除全域事件監聽
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, cropArea, dragStart, resizeHandle, imageNaturalSize])

  // 圖片載入後更新自然尺寸和初始裁切區域
  useEffect(() => {
    if (imageRef.current && uploadedFile) {
      const img = imageRef.current
      
      const updateImageSize = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight })
          
          // 設定初始裁切區域為圖片中心的 70%
          const cropWidth = Math.floor(img.naturalWidth * 0.7)
          const cropHeight = Math.floor(img.naturalHeight * 0.7)
          setCropArea({ 
            x: Math.floor((img.naturalWidth - cropWidth) / 2), 
            y: Math.floor((img.naturalHeight - cropHeight) / 2), 
            width: cropWidth, 
            height: cropHeight 
          })
        }
      }
      
      if (img.complete) {
        updateImageSize()
      } else {
        img.addEventListener('load', updateImageSize)
        return () => img.removeEventListener('load', updateImageSize)
      }
    }
  }, [uploadedFile])


  // 處理下載
  const handleDownload = () => {
    if (!uploadedFile) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      if (mode === 'resize') {
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
      } else {
        // Crop mode
        canvas.width = cropArea.width
        canvas.height = cropArea.height
        ctx.drawImage(
          img,
          cropArea.x, cropArea.y, cropArea.width, cropArea.height,
          0, 0, cropArea.width, cropArea.height
        )
      }

      const mimeType = `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}`
      
      // 品質參數只對 JPEG 和 WebP 有效
      const qualityValue = (outputFormat === 'jpg' || outputFormat === 'jpeg' || outputFormat === 'webp') 
        ? quality / 100 
        : undefined
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${uploadedFile.name.split('.')[0]}_${mode === 'resize' ? 'resized' : 'cropped'}.${outputFormat}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        onShowMessage('success', '下載成功!')
      }, mimeType, qualityValue)
    }
    img.src = uploadedFile.preview
  }

  return (
    <div className="image-resize-crop-tool">
      <div className="tool-container">
        <div className="tool-header">
          <h1>調整 / 裁切圖片尺寸</h1>
          <p>調整圖片大小或裁切指定區域，支援 PNG、JPG、GIF、BMP、WEBP 格式</p>
        </div>

        <div className="mode-selector">
          <button 
            className={`mode-btn ${mode === 'resize' ? 'active' : ''}`}
            onClick={() => setMode('resize')}
          >
            📏 調整尺寸
          </button>
          <button 
            className={`mode-btn ${mode === 'crop' ? 'active' : ''}`}
            onClick={() => setMode('crop')}
          >
            ✂️ 裁切圖片
          </button>
        </div>

        {!uploadedFile ? (
          <div className="upload-section">
            <div 
              className="upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h3>點擊上傳圖片</h3>
              <p>支援 PNG、JPG、GIF、BMP、WEBP 格式，最大 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        ) : (
          <div className={`tool-content ${uploadedFile ? 'has-file' : ''}`}>
            <div className="tool-left-panel">
              <div className="tool-main-card">
                <div className="preview-section">
                  <h3>圖片預覽</h3>
                  <div className="image-preview-container" ref={cropContainerRef}>
                    <img 
                      ref={imageRef}
                      src={uploadedFile.preview} 
                      alt="preview"
                      className="preview-image"
                    />
                    {mode === 'crop' && imageRef.current && imageNaturalSize.width > 0 && (
                      <div 
                        className="crop-overlay"
                        style={{
                          left: `${(cropArea.x / imageNaturalSize.width) * 100}%`,
                          top: `${(cropArea.y / imageNaturalSize.height) * 100}%`,
                          width: `${(cropArea.width / imageNaturalSize.width) * 100}%`,
                          height: `${(cropArea.height / imageNaturalSize.height) * 100}%`
                        }}
                        onMouseDown={handleCropMouseDown}
                      >
                        {/* 裁切區域的四個角落控制點 */}
                        <div 
                          className="crop-handle crop-handle-nw" 
                          onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                        />
                        <div 
                          className="crop-handle crop-handle-ne" 
                          onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                        />
                        <div 
                          className="crop-handle crop-handle-sw" 
                          onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                        />
                        <div 
                          className="crop-handle crop-handle-se" 
                          onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                        />
                        {/* 裁切框的網格線 */}
                        <div className="crop-grid">
                          <div className="crop-grid-line crop-grid-v1" />
                          <div className="crop-grid-line crop-grid-v2" />
                          <div className="crop-grid-line crop-grid-h1" />
                          <div className="crop-grid-line crop-grid-h2" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="file-info">
                    <p><strong>檔案名稱:</strong> {uploadedFile.name}</p>
                    <p><strong>原始尺寸:</strong> {width} × {height} px</p>
                    <p><strong>檔案大小:</strong> {(uploadedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                  <button 
                    className="change-file-btn"
                    onClick={() => {
                      setUploadedFile(null)
                      setWidth('')
                      setHeight('')
                    }}
                  >
                    更換圖片
                  </button>
                </div>
              </div>
            </div>

            <div className="tool-right-panel">
              <div className="tool-main-card">
                <div className="settings-section">
                  <h3>{mode === 'resize' ? '調整尺寸設定' : '裁切設定'}</h3>
                  
                  {mode === 'resize' ? (
                    <>
                      <div className="input-group">
                        <label>寬度 (px)</label>
                        <input
                          type="number"
                          value={width}
                          onChange={(e) => handleWidthChange(parseInt(e.target.value) || '')}
                          min="1"
                        />
                      </div>
                      
                      <div className="input-group">
                        <label>高度 (px)</label>
                        <input
                          type="number"
                          value={height}
                          onChange={(e) => handleHeightChange(parseInt(e.target.value) || '')}
                          min="1"
                        />
                      </div>
                      
                      <div className="checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={keepAspectRatio}
                            onChange={(e) => setKeepAspectRatio(e.target.checked)}
                          />
                          保持長寬比
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="crop-info">
                      <p>💡 拖曳裁切框移動位置，拖曳四個角調整大小</p>
                      <div className="crop-details">
                        <p><strong>X:</strong> {Math.round(cropArea.x)}px</p>
                        <p><strong>Y:</strong> {Math.round(cropArea.y)}px</p>
                        <p><strong>寬度:</strong> {Math.round(cropArea.width)}px</p>
                        <p><strong>高度:</strong> {Math.round(cropArea.height)}px</p>
                      </div>
                    </div>
                  )}

                  <div className="divider"></div>

                  <div className="input-group">
                    <label>輸出格式</label>
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                    >
                      <option value="png">PNG</option>
                      <option value="jpg">JPG</option>
                      <option value="gif">GIF</option>
                      <option value="bmp">BMP</option>
                      <option value="webp">WEBP</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>
                      輸出質量: {quality}%
                      {(outputFormat !== 'jpg' && outputFormat !== 'webp') && (
                        <span className="quality-note"> (僅 JPG/WEBP 支援)</span>
                      )}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="quality-slider"
                      style={{ '--value': `${quality}%` }}
                      disabled={outputFormat !== 'jpg' && outputFormat !== 'webp'}
                    />
                  </div>

                  <button 
                    className="download-btn"
                    onClick={handleDownload}
                  >
                    下載 {mode === 'resize' ? '調整後' : '裁切後'} 圖片
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 版本號碼 */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(255, 152, 0, 0.95)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        backdropFilter: 'blur(10px)'
      }}>
        v1.0.0
      </div>
    </div>
  )
}

export default ImageResizeCropTool
