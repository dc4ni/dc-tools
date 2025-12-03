import React, { useState, useEffect, useRef } from 'react'
import FileUploader from './FileUploader'
import ConversionOptions from './ConversionOptions'
import ImagePreview from './ImagePreview'
import DownloadButton from './DownloadButton'
import errorLogger from '../services/errorLogger'
import { apiEndpoints } from '../config/api'
import './ImageConverterTool.css'

function ImageConverterTool({ onShowMessage }) {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [selectedFormat, setSelectedFormat] = useState('png')
  const [quality, setQuality] = useState(85)
  const [supportedFormats, setSupportedFormats] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [convertedFiles, setConvertedFiles] = useState([])
  const [hasConverted, setHasConverted] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const downloadSectionRef = useRef(null)

  useEffect(() => {
    fetchSupportedFormats()
  }, [])

  // 當轉換完成後自動滾動到下載區域
  useEffect(() => {
    if (convertedFiles.length > 0 && downloadSectionRef.current) {
      setTimeout(() => {
        downloadSectionRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }, 300)
    }
  }, [convertedFiles])

  const fetchSupportedFormats = async () => {
    try {
      const response = await fetch(apiEndpoints.formats)
      const data = await response.json()
      setSupportedFormats(data.data)
    } catch (error) {
      errorLogger.logError(error, { context: 'fetchSupportedFormats' })
    }
  }

  const handleConvert = async () => {
    if (uploadedFiles.length === 0) return
    setIsLoading(true)
    setHasConverted(false)
    try {
      const uploadForm = new FormData()
      uploadForm.append('file', uploadedFiles[0].file || uploadedFiles[0])
      const uploadRes = await fetch(apiEndpoints.upload, {
        method: 'POST',
        body: uploadForm
      })
      if (!uploadRes.ok) throw new Error('File upload failed')
      const uploadData = await uploadRes.json()
      const file_id = uploadData.data.file_id

      const convertForm = new FormData()
      convertForm.append('file_id', file_id)
      convertForm.append('output_format', selectedFormat)
      convertForm.append('quality', quality)
      const convertRes = await fetch(apiEndpoints.convert, {
        method: 'POST',
        body: convertForm
      })
      if (!convertRes.ok) throw new Error('Conversion failed')
      const convertData = await convertRes.json()

      setConvertedFiles([
        {
          name: convertData.data.output_filename,
          download_url: convertData.data.download_url,
          image_info: convertData.data.image_info
        }
      ])
      setHasConverted(true)
      if (onShowMessage) onShowMessage('success', 'Conversion successful!')
    } catch (error) {
      errorLogger.logError(error, { context: 'handleConvert' })
      if (onShowMessage) onShowMessage('error', 'Conversion failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="image-converter-tool">
      <div className="tool-container">
        <div className="tool-header">
          <h1>圖片格式轉換</h1>
          <p>快速轉換圖片格式，支援 PNG、JPG、GIF、BMP、WEBP 等多種格式</p>
        </div>

        <div className={`tool-content ${uploadedFiles.length > 0 ? 'has-files' : ''}`}>
          {/* 左側面板 - 上傳區域 */}
          <div className="tool-left-panel">
            <div className="tool-main-card">
              <div className="tool-section">
                <FileUploader
                  onFilesUpload={(files) => {
                    setUploadedFiles(files)
                    setHasConverted(false)
                    setConvertedFiles([])
                    setIsUploading(true)
                  }}
                  onUploadComplete={() => {
                    setIsUploading(false)
                  }}
                  uploadedFiles={uploadedFiles}
                  downloadButton={convertedFiles.length > 0 ? <DownloadButton convertedFiles={convertedFiles} /> : null}
                />
              </div>
            </div>
          </div>

          {/* 右側面板 - 轉換選項、預覽和下載 */}
          <div className="tool-right-panel">
            {uploadedFiles.length > 0 && (
              <>
                <div className="tool-main-card">
                  <div className="tool-section">
                    <h3 className="section-title">轉換選項</h3>
                    <ConversionOptions
                      selectedFormat={selectedFormat}
                      onFormatChange={setSelectedFormat}
                      quality={quality}
                      onQualityChange={setQuality}
                      supportedFormats={supportedFormats}
                      onConvert={handleConvert}
                      isLoading={isLoading}
                      hasConverted={hasConverted}
                      isUploading={isUploading}
                    />
                  </div>
                </div>

                <div className="tool-main-card">
                  <div className="tool-section">
                    <h3 className="section-title">圖片預覽</h3>
                    <ImagePreview files={uploadedFiles} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* 版本號碼 */}
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        background: 'rgba(76, 175, 80, 0.95)', 
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

export default ImageConverterTool
