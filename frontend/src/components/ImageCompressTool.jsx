import { useState } from 'react'
import axios from 'axios'
import './ImageCompressTool.css'

function ImageCompressTool({ language = 'zh-TW' }) {
  const [file, setFile] = useState(null)
  const [originalPreview, setOriginalPreview] = useState(null)
  const [compressedPreview, setCompressedPreview] = useState(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [error, setError] = useState(null)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      handleFile(selectedFile)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFile(droppedFile)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleFile = (selectedFile) => {
    // 重置狀態
    setError(null)
    setDownloadUrl(null)
    setCompressedPreview(null)
    setCompressedSize(0)
    setProgress(0)

    // 驗證檔案類型
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
    if (!validTypes.includes(selectedFile.type)) {
      setError('不支援的檔案格式！請上傳 JPEG, PNG, WebP, GIF 或 BMP 格式的圖片。')
      return
    }

    setFile(selectedFile)
    setOriginalSize(selectedFile.size)

    // 預覽原始圖片
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalPreview(e.target.result)
    }
    reader.readAsDataURL(selectedFile)

    // 自動開始壓縮
    setTimeout(() => compressImage(selectedFile), 500)
  }

  const compressImage = async (fileToCompress) => {
    setIsCompressing(true)
    setProgress(0)
    setError(null)

    const formData = new FormData()
    formData.append('file', fileToCompress)

    try {
      // 模擬進度條
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await axios.post('/api/compress', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      clearInterval(progressInterval)
      setProgress(100)

      // 建立下載 URL
      const blob = new Blob([response.data], { type: response.data.type })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setCompressedSize(blob.size)

      // 預覽壓縮後的圖片
      const reader = new FileReader()
      reader.onload = (e) => {
        setCompressedPreview(e.target.result)
      }
      reader.readAsDataURL(blob)

      setIsCompressing(false)
    } catch (err) {
      console.error('壓縮錯誤:', err)
      setError(err.response?.data?.detail || '圖片壓縮失敗，請稍後再試。')
      setIsCompressing(false)
      setProgress(0)
    }
  }

  const handleDownload = () => {
    if (downloadUrl && file) {
      const a = document.createElement('a')
      a.href = downloadUrl
      const extension = file.name.split('.').pop()
      a.download = `compressed_${file.name.replace(`.${extension}`, '')}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleReset = () => {
    setFile(null)
    setOriginalPreview(null)
    setCompressedPreview(null)
    setOriginalSize(0)
    setCompressedSize(0)
    setProgress(0)
    setDownloadUrl(null)
    setError(null)
    setIsCompressing(false)
  }

  const compressionRatio = originalSize > 0 && compressedSize > 0
    ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
    : 0

  return (
    <div className="compress-tool-container">
      <div className="compress-tool-content">
        <h1 className="compress-title">
          圖片壓縮工具
        </h1>
        <p className="compress-subtitle">
          自動壓縮圖片，減小檔案大小,保持良好畫質
        </p>

        {!file ? (
          <div
            className="compress-upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('compress-file-input').click()}
          >
            <p className="upload-text">點擊或拖放圖片到這裡</p>
            <p className="upload-hint">支援 JPEG, PNG, WebP, GIF, BMP</p>
            <input
              id="compress-file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="compress-processing-area">
            {/* 進度條 */}
            {isCompressing && (
              <div className="compress-progress-container">
                <div className="compress-progress-bar">
                  <div
                    className="compress-progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="compress-progress-text">壓縮中... {progress}%</p>
              </div>
            )}

            {/* 錯誤訊息 */}
            {error && (
              <div className="compress-error">
                {error}
              </div>
            )}

            {/* 預覽區 */}
            <div className="compress-preview-container">
              {/* 原始圖片 */}
              <div className="compress-preview-box">
                <h3 className="preview-title">原始圖片</h3>
                {originalPreview && (
                  <div className="preview-image-wrapper">
                    <img src={originalPreview} alt="原始圖片" className="preview-image" />
                  </div>
                )}
                <div className="preview-info">
                  <p className="info-label">檔案名稱</p>
                  <p className="info-value">{file.name}</p>
                  <p className="info-label">檔案大小</p>
                  <p className="info-value size-original">{formatFileSize(originalSize)}</p>
                </div>
              </div>

              {/* 箭頭 */}
              {compressedPreview && (
                <div className="compress-arrow">
                  <span className="arrow-icon">➔</span>
                  <p className="arrow-text">壓縮率<br/><strong>{compressionRatio}%</strong></p>
                </div>
              )}

              {/* 壓縮後圖片 */}
              {compressedPreview && (
                <div className="compress-preview-box">
                  <h3 className="preview-title">壓縮後</h3>
                  <div className="preview-image-wrapper">
                    <img src={compressedPreview} alt="壓縮後圖片" className="preview-image" />
                  </div>
                  <div className="preview-info">
                    <p className="info-label">檔案大小</p>
                    <p className="info-value size-compressed">{formatFileSize(compressedSize)}</p>
                    <p className="info-label">節省空間</p>
                    <p className="info-value size-saved">
                      {formatFileSize(originalSize - compressedSize)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 操作按鈕 */}
            <div className="compress-actions">
              {downloadUrl && (
                <button className="btn-download" onClick={handleDownload}>
                  下載壓縮圖片
                </button>
              )}
              <button className="btn-reset" onClick={handleReset}>
                壓縮新圖片
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 版本標籤 */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(33, 150, 243, 0.95)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
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

export default ImageCompressTool
