import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import './PDFTool.css'

// 設定 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

function PDFTool({ language = 'zh-TW' }) {
  const [pdfFiles, setPdfFiles] = useState([]) // { id, file, name, pages: [{ id, pageNum, thumbnail, expanded }] }
  const [allPages, setAllPages] = useState([]) // 扁平化的所有頁面，用於拖曳
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState(null)
  const [error, setError] = useState(null)
  const [compress, setCompress] = useState(false)

  const text = {
    title: language === 'en' ? 'PDF Tools' : 'PDF 工具',
    subtitle: language === 'en' ? 'Merge, split, and reorganize PDF files' : '合併、分割、重新排序 PDF 檔案',
    uploadPrompt: language === 'en' ? 'Click or drag PDF files here' : '點擊或拖曳 PDF 檔案到這裡',
    uploadMultiple: language === 'en' ? 'Support multiple PDF files' : '支援多個 PDF 檔案',
    uploaded: language === 'en' ? 'Uploaded files' : '已上傳檔案',
    expand: language === 'en' ? 'Expand' : '展開',
    collapse: language === 'en' ? 'Collapse' : '收合',
    delete: language === 'en' ? 'Delete' : '刪除',
    deletePage: language === 'en' ? 'Delete Page' : '刪除頁面',
    compress: language === 'en' ? 'Compress file' : '壓縮檔案',
    process: language === 'en' ? 'Process PDF' : '處理 PDF',
    processing: language === 'en' ? 'Processing...' : '處理中...',
    download: language === 'en' ? 'Download' : '下載',
    page: language === 'en' ? 'Page' : '第',
    pageUnit: language === 'en' ? '' : '頁',
  }

  // 生成頁面縮圖
  const generateThumbnail = async (file, pageNum) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const page = await pdf.getPage(pageNum)
      
      const viewport = page.getViewport({ scale: 0.5 })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({ canvasContext: context, viewport }).promise
      return canvas.toDataURL()
    } catch (err) {
      console.error('生成縮圖失敗:', err)
      return null
    }
  }

  // 處理檔案上傳
  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files)
    await processFiles(selectedFiles)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    await processFiles(droppedFiles)
  }

  const processFiles = async (selectedFiles) => {
    const pdfFilesOnly = selectedFiles.filter(file => file.type === 'application/pdf')
    
    if (pdfFilesOnly.length !== selectedFiles.length) {
      setError('請只上傳 PDF 檔案')
      return
    }

    setError(null)

    // 處理每個 PDF 檔案
    for (const file of pdfFilesOnly) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        const pageCount = pdf.numPages

        // 只生成第一頁的縮圖
        const firstPageThumbnail = await generateThumbnail(file, 1)

        const fileId = `file-${Date.now()}-${Math.random()}`
        const pages = [{
          id: `${fileId}-page-1`,
          pageNum: 1,
          thumbnail: firstPageThumbnail,
          fileId: fileId,
          fileName: file.name
        }]

        const newFile = {
          id: fileId,
          file: file,
          name: file.name,
          pageCount: pageCount,
          pages: pages,
          expanded: false
        }

        setPdfFiles(prev => [...prev, newFile])
        setAllPages(prev => [...prev, ...pages])
      } catch (err) {
        console.error('讀取 PDF 失敗:', err)
        setError(`讀取 ${file.name} 失敗`)
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // 展開/收合檔案的所有頁面
  const toggleExpand = async (fileId) => {
    const fileIndex = pdfFiles.findIndex(f => f.id === fileId)
    if (fileIndex === -1) return

    const file = pdfFiles[fileIndex]
    
    if (file.expanded) {
      // 收合：只保留第一頁
      const updatedFile = {
        ...file,
        expanded: false,
        pages: file.pages.filter(p => p.pageNum === 1)
      }
      
      const newPdfFiles = [...pdfFiles]
      newPdfFiles[fileIndex] = updatedFile
      setPdfFiles(newPdfFiles)
      
      // 更新 allPages
      setAllPages(prev => prev.filter(p => p.fileId !== fileId || p.pageNum === 1))
    } else {
      // 展開：生成所有頁面縮圖
      const newPages = []
      for (let i = 1; i <= file.pageCount; i++) {
        if (i === 1) {
          newPages.push(file.pages[0])
        } else {
          const thumbnail = await generateThumbnail(file.file, i)
          newPages.push({
            id: `${fileId}-page-${i}`,
            pageNum: i,
            thumbnail: thumbnail,
            fileId: fileId,
            fileName: file.name
          })
        }
      }

      const updatedFile = {
        ...file,
        expanded: true,
        pages: newPages
      }

      const newPdfFiles = [...pdfFiles]
      newPdfFiles[fileIndex] = updatedFile
      setPdfFiles(newPdfFiles)

      // 更新 allPages
      setAllPages(prev => {
        const filtered = prev.filter(p => p.fileId !== fileId)
        // 找到當前檔案第一頁在 allPages 中的位置
        const insertIndex = prev.findIndex(p => p.fileId === fileId)
        if (insertIndex === -1) {
          return [...filtered, ...newPages]
        }
        return [
          ...filtered.slice(0, insertIndex),
          ...newPages,
          ...filtered.slice(insertIndex + 1)
        ]
      })
    }
  }

  // 刪除整個檔案
  const removeFile = (fileId) => {
    setPdfFiles(prev => prev.filter(f => f.id !== fileId))
    setAllPages(prev => prev.filter(p => p.fileId !== fileId))
  }

  // 刪除單頁
  const removePage = (pageId) => {
    setAllPages(prev => prev.filter(p => p.id !== pageId))
    
    // 更新對應檔案的頁面列表
    setPdfFiles(prev => prev.map(file => {
      const updatedPages = file.pages.filter(p => p.id !== pageId)
      return {
        ...file,
        pages: updatedPages
      }
    }).filter(file => file.pages.length > 0)) // 移除沒有頁面的檔案
  }

  // 拖曳結束處理
  const onDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(allPages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setAllPages(items)

    // 同步更新 pdfFiles
    const updatedPdfFiles = pdfFiles.map(file => {
      const filePages = items.filter(p => p.fileId === file.id)
      return {
        ...file,
        pages: filePages
      }
    })
    setPdfFiles(updatedPdfFiles)
  }

  // 處理 PDF
  const handleProcess = async () => {
    if (allPages.length === 0) {
      setError('請至少上傳一個 PDF 檔案')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      
      // 按照 allPages 的順序添加檔案和頁面資訊
      const pageInfo = allPages.map(page => ({
        fileName: page.fileName,
        pageNum: page.pageNum
      }))

      // 添加所有唯一的檔案
      const uniqueFiles = new Set()
      pdfFiles.forEach(pdfFile => {
        if (!uniqueFiles.has(pdfFile.name)) {
          formData.append('files', pdfFile.file)
          uniqueFiles.add(pdfFile.name)
        }
      })

      formData.append('pageInfo', JSON.stringify(pageInfo))
      formData.append('compress', compress)

      const response = await axios.post('/api/pdf/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setProgress(percentCompleted)
        },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      setDownloadUrl(url)
      setProgress(100)
    } catch (err) {
      console.error('處理失敗:', err)
      setError(err.response?.data?.detail || '處理失敗，請重試')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="pdf-tool-container">
      <div className="pdf-tool-content">
        <h1 className="pdf-title">{text.title}</h1>
        <p className="pdf-subtitle">{text.subtitle}</p>

        {/* 上傳區域 */}
        <div 
          className="pdf-upload-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('pdf-file-input').click()}
        >
          <div className="upload-icon">📑</div>
          <p className="upload-text">{text.uploadPrompt}</p>
          <p className="upload-hint">{text.uploadMultiple}</p>
          <input
            id="pdf-file-input"
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="pdf-error">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* 頁面預覽與拖曳區域 */}
        {allPages.length > 0 && (
          <div className="pdf-pages-section">
            <h3>{text.uploaded} ({allPages.length} {text.pageUnit})</h3>
            
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="pages" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    className={`pdf-pages-grid ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {allPages.map((page, index) => (
                      <Draggable key={page.id} draggableId={page.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`pdf-page-item ${snapshot.isDragging ? 'dragging' : ''}`}
                          >
                            <div className="page-thumbnail">
                              {page.thumbnail ? (
                                <img src={page.thumbnail} alt={`Page ${page.pageNum}`} />
                              ) : (
                                <div className="thumbnail-placeholder">📄</div>
                              )}
                            </div>
                            <div className="page-info">
                              <span className="page-number">
                                {text.page} {page.pageNum} {text.pageUnit}
                              </span>
                              <span className="page-filename">{page.fileName}</span>
                            </div>
                            <button
                              className="page-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                removePage(page.id)
                              }}
                              title={text.deletePage}
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* 檔案展開/收合控制 */}
            <div className="pdf-files-control">
              {pdfFiles.map(file => (
                <div key={file.id} className="file-control-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-pages">({file.pageCount} {text.pageUnit})</span>
                  <button
                    className="file-toggle-btn"
                    onClick={() => toggleExpand(file.id)}
                  >
                    {file.expanded ? text.collapse : text.expand}
                  </button>
                  <button
                    className="file-delete-btn"
                    onClick={() => removeFile(file.id)}
                  >
                    {text.delete}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 選項與處理 */}
        {allPages.length > 0 && (
          <div className="pdf-options">
            <label className="compress-option">
              <input
                type="checkbox"
                checked={compress}
                onChange={(e) => setCompress(e.target.checked)}
              />
              <span>{text.compress}</span>
            </label>

            <button
              className="process-btn"
              onClick={handleProcess}
              disabled={isProcessing}
            >
              {isProcessing ? text.processing : text.process}
            </button>
          </div>
        )}

        {/* 進度條 */}
        {isProcessing && (
          <div className="pdf-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}

        {/* 下載按鈕 */}
        {downloadUrl && (
          <div className="pdf-download">
            <a
              href={downloadUrl}
              download="processed.pdf"
              className="download-btn"
            >
              📥 {text.download}
            </a>
          </div>
        )}

        {/* 版本號 */}
        <div className="version-badge">v2.0.5</div>
      </div>
    </div>
  )
}

export default PDFTool
