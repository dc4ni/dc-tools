import { useState } from 'react'
import axios from 'axios'
import './PDFTool.css'

function PDFTool({ language = 'zh-TW' }) {
  const [files, setFiles] = useState([])
  const [operation, setOperation] = useState('merge')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [error, setError] = useState(null)
  const [compress, setCompress] = useState(false)
  const [splitRanges, setSplitRanges] = useState('')

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length !== selectedFiles.length) {
      setError('請只上傳 PDF 檔案')
      return
    }
    
    setFiles([...files, ...pdfFiles])
    setError(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length !== droppedFiles.length) {
      setError('請只上傳 PDF 檔案')
      return
    }
    
    setFiles([...files, ...pdfFiles])
    setError(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const moveFile = (index, direction) => {
    const newFiles = [...files]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    if (targetIndex < 0 || targetIndex >= files.length) return
    
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]]
    setFiles(newFiles)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const handleProcess = async () => {
    if (files.length === 0) {
      setError('請先上傳 PDF 檔案')
      return
    }

    if (operation === 'merge' && files.length < 2) {
      setError('合併操作需要至少 2 個 PDF 檔案')
      return
    }

    if (operation === 'split' && files.length !== 1) {
      setError('分割操作只能選擇 1 個 PDF 檔案')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append('files', file)
      })
      formData.append('operation', operation)
      formData.append('compress', compress)
      
      if (operation === 'split' && splitRanges) {
        formData.append('ranges', splitRanges)
      }

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await axios.post('/api/pdf/process', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      clearInterval(progressInterval)
      setProgress(100)

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      setIsProcessing(false)
    } catch (err) {
      console.error('處理錯誤:', err)
      setError(err.response?.data?.detail || 'PDF 處理失敗，請稍後再試。')
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a')
      a.href = downloadUrl
      const timestamp = new Date().getTime()
      let filename = `${operation}_${timestamp}.pdf`
      
      if (operation === 'merge') filename = `merged_${timestamp}.pdf`
      if (operation === 'split') filename = `split_${timestamp}.pdf`
      
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleReset = () => {
    setFiles([])
    setOperation('merge')
    setProgress(0)
    setDownloadUrl(null)
    setError(null)
    setCompress(false)
    setSplitRanges('')
    setIsProcessing(false)
  }

  return (
    <div className="pdf-tool-container">
      <div className="pdf-tool-content">
        <h1 className="pdf-title">PDF 工具</h1>
        <p className="pdf-subtitle">
          合併、分割、重新排序 PDF 檔案
        </p>

        {!downloadUrl && (
          <div
            className="pdf-upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('pdf-file-input').click()}
          >
            <p className="upload-text">點擊或拖放 PDF 檔案到這裡</p>
            <p className="upload-hint">支援上傳多個 PDF 檔案</p>
            <input
              id="pdf-file-input"
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        )}

        {files.length > 0 && !downloadUrl && (
          <div className="pdf-file-list">
            <h3>已上傳檔案 ({files.length})</h3>
            {files.map((file, index) => (
              <div key={index} className="pdf-file-item">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
                <div className="file-actions">
                  <button onClick={() => moveFile(index, 'up')} disabled={index === 0}>
                    ↑
                  </button>
                  <button onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1}>
                    ↓
                  </button>
                  <button onClick={() => removeFile(index)} className="btn-remove">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && !isProcessing && !downloadUrl && (
          <div className="pdf-operations">
            <h3>選擇操作</h3>
            <div className="operation-buttons">
              <button
                className={`operation-btn ${operation === 'merge' ? 'active' : ''}`}
                onClick={() => setOperation('merge')}
                disabled={files.length < 2}
              >
                合併 PDF
                {files.length < 2 && <span className="hint">(需要至少 2 個檔案)</span>}
              </button>
              <button
                className={`operation-btn ${operation === 'split' ? 'active' : ''}`}
                onClick={() => setOperation('split')}
                disabled={files.length !== 1}
              >
                分割 PDF
                {files.length !== 1 && <span className="hint">(需要選擇 1 個檔案)</span>}
              </button>
            </div>

            {operation === 'split' && (
              <div className="split-options">
                <label>分割範圍 (例如: 1-3,5-7 或留空全部分割)</label>
                <input
                  type="text"
                  value={splitRanges}
                  onChange={(e) => setSplitRanges(e.target.value)}
                  placeholder="1-3,5-7"
                />
              </div>
            )}

            <div className="compress-option">
              <label>
                <input
                  type="checkbox"
                  checked={compress}
                  onChange={(e) => setCompress(e.target.checked)}
                />
                壓縮輸出檔案
              </label>
            </div>

            <button className="btn-process" onClick={handleProcess}>
              開始處理
            </button>
          </div>
        )}

        {isProcessing && (
          <div className="pdf-progress-container">
            <div className="pdf-progress-bar">
              <div
                className="pdf-progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="pdf-progress-text">處理中... {progress}%</p>
          </div>
        )}

        {error && (
          <div className="pdf-error">
            {error}
          </div>
        )}

        {downloadUrl && (
          <div className="pdf-result">
            <h3>處理完成!</h3>
            <div className="pdf-actions">
              <button className="btn-download" onClick={handleDownload}>
                下載 PDF
              </button>
              <button className="btn-reset" onClick={handleReset}>
                處理新檔案
              </button>
            </div>
          </div>
        )}

        <div className="version-badge">v1.0.0</div>
      </div>
    </div>
  )
}

export default PDFTool
