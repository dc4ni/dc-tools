import React from 'react'
import { apiEndpoints } from '../config/api'
import './DownloadButton.css'

function DownloadButton({ convertedFiles }) {
  const handleDownload = async (file) => {
    try {
      let downloadUrl = file.download_url.startsWith('/') 
        ? apiEndpoints.download(file.download_url)
        : file.download_url
      console.log('Downloading from:', downloadUrl)
      const response = await fetch(downloadUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name || file.output_filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert(`下載失敗: ${error.message}`)
    }
  }

  if (!convertedFiles || convertedFiles.length === 0) {
    return null
  }

  const file = convertedFiles[0]
  
  return (
    <button 
      className="download-btn-simple" 
      onClick={() => handleDownload(file)}
    >
      下載
    </button>
  )
}

export default DownloadButton
