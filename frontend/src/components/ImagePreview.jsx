import React from 'react'
import { apiEndpoints } from '../config/api'
import './ImagePreview.css'

function ImagePreview({ files, title }) {
  try {
    return (
      <div className="image-preview">
        <h3>{title}</h3>
        <div className="preview-grid">
          {files && files.length > 0 ? files.map((file, index) => {
            // Determine the image source
            let imageSrc = file.preview
            if (!imageSrc && file.download_url) {
              imageSrc = file.download_url.startsWith('/') 
                ? apiEndpoints.download(file.download_url)
                : file.download_url
            }
            
            return (
              <div key={index} className="preview-item">
                <div className="preview-image">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={file.name || file.original_filename || `image-${index}`}
                      loading="lazy"
                      onError={(e) => {
                        console.error('Image load error:', imageSrc, e)
                        e.target.style.display = 'none'
                      }}
                      onLoad={() => console.log('Image loaded:', imageSrc)}
                    />
                  ) : (
                    <div style={{ color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.9em' }}>
                      No Preview
                    </div>
                  )}
                </div>
                <div className="preview-info">
                  <p className="preview-name">
                    {file.name || file.original_filename || `File ${index + 1}`}
                  </p>
                  {file.image_info && (
                    <div className="preview-details">
                      <span>{file.image_info.size?.[0]}x{file.image_info.size?.[1]}px</span>
                      <span>{(file.image_info.file_size / 1024).toFixed(2)}KB</span>
                    </div>
                  )}
                </div>
              </div>
            )
          }) : (
            <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', color: '#999' }}>
              沒有圖片
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('ImagePreview render error:', error)
    return (
      <div className="image-preview" style={{ border: '2px solid red', padding: '10px' }}>
        <h3 style={{ color: 'red' }}>❌ {title} - 顯示錯誤</h3>
        <p style={{ color: 'red', fontSize: '0.9em' }}>{error.message}</p>
      </div>
    )
  }
}

export default ImagePreview
