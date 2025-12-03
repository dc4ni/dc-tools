import React, { useRef } from 'react'
import './FileUploader.css'

function FileUploader({ onFilesUpload, uploadedFiles, downloadButton, onUploadComplete }) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState('')
  const [progress, setProgress] = React.useState([])
  const lang = (window.localStorage.getItem('language') || 'zh')
  const t = {
    zh: {
      dragHere: '拖拽圖片到這裡',
      orClick: '或點擊下方按鈕選擇文件',
      select: '選擇文件',
      uploaded: '已上傳',
      remove: '移除',
      errType: '只支援圖片格式 (PNG, JPG, GIF, BMP, WEBP)',
      errSize: '檔案過大，最大 10MB',
      uploading: '上傳中...'
    },
    en: {
      dragHere: 'Drag images here',
      orClick: 'or click below to select files',
      select: 'Select Files',
      uploaded: 'Uploaded',
      remove: 'Remove',
      errType: 'Only image formats allowed (PNG, JPG, GIF, BMP, WEBP)',
      errSize: 'File too large, max 10MB',
      uploading: 'Uploading...'
    }
  }
  const text = t[lang]

  // 檢查格式/大小
  const validateFiles = (files) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB
    let valid = []
    for (let file of files) {
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg(text.errType)
        continue
      }
      if (file.size > maxSize) {
        setErrorMsg(text.errSize)
        continue
      }
      valid.push({
        file,
        name: file.name,
        preview: URL.createObjectURL(file)
      })
    }
    if (valid.length === files.length) setErrorMsg('')
    return valid
  }

  // 模擬上傳進度
  React.useEffect(() => {
    if (uploadedFiles.length === 0) {
      setProgress([])
      return
    }
    // 新增檔案時初始化進度
    if (progress.length !== uploadedFiles.length) {
      setProgress(Array(uploadedFiles.length).fill(0))
    }
    // 模擬進度條
    let timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev.map(p => (p < 100 ? p + Math.floor(Math.random() * 20 + 10) : 100))
        // 檢查是否所有檔案都上傳完成
        if (newProgress.every(p => p >= 100) && onUploadComplete) {
          setTimeout(() => onUploadComplete(), 100) // 延遲一點點讓使用者看到100%
        }
        return newProgress
      })
    }, 400)
    return () => clearInterval(timer)
  }, [uploadedFiles.length, onUploadComplete])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = validateFiles(files)
    if (validFiles.length > 0) onFilesUpload(validFiles)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    const validFiles = validateFiles(files)
    if (validFiles.length > 0) onFilesUpload(validFiles)
  }

  // 檔案移除
  const handleRemove = (idx) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== idx)
    onFilesUpload(newFiles)
    setProgress(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="file-uploader">
      <div
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <h3>{text.dragHere}</h3>
        <p>{text.orClick}</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        {errorMsg && <div className="upload-error">{errorMsg}</div>}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="file-list">
          <h4>{text.uploaded} ({uploadedFiles.length})</h4>
          <ul>
            {uploadedFiles.map((file, index) => (
              <li key={index}>
                <span className="file-icon">🖼️</span>
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  {(file.file.size / 1024).toFixed(2)} KB
                </span>
                {/* 進度條與狀態 */}
                <div className="upload-progress-wrapper">
                  <div className="progress-bar">
                    <div className="progress-bar-inner" style={{ width: `${progress[index] || 0}%` }}></div>
                  </div>
                  {progress[index] >= 100 ? (
                    <span className="upload-status-complete">
                      ✓ {lang === 'zh' ? '完成' : 'Complete'}
                    </span>
                  ) : (
                    <span className="upload-status-uploading">
                      {progress[index] || 0}% {text.uploading}
                    </span>
                  )}
                </div>
                
                {/* 下載按鈕區域 */}
                {downloadButton && (
                  <div className="download-btn-inline">
                    {downloadButton}
                  </div>
                )}
                
                <button className="remove-btn" onClick={() => handleRemove(index)}>{text.remove}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default FileUploader
