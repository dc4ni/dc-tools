import React from 'react'
import './ConversionOptions.css'

function ConversionOptions({ 
  supportedFormats, 
  selectedFormat, 
  onFormatChange, 
  quality, 
  onQualityChange,
  onConvert,
  isLoading,
  hasConverted,
  isUploading
}) {
  const formats = supportedFormats.output || ['PNG', 'JPG', 'GIF', 'BMP', 'WEBP']

  return (
    <div className="conversion-options">
      <div className="option-group">
        <label htmlFor="format-select">目標格式</label>
        <select
          id="format-select"
          value={selectedFormat}
          onChange={(e) => onFormatChange(e.target.value)}
          className="format-select"
        >
          {formats.map(format => (
            <option key={format} value={format.toLowerCase()}>
              {format.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="option-group">
        <label htmlFor="quality-slider">
          轉換質量: {quality}%
          {(selectedFormat !== 'jpg' && selectedFormat !== 'jpeg' && selectedFormat !== 'webp') && (
            <span className="quality-note"> (僅 JPG/WEBP 支援)</span>
          )}
        </label>
        <input
          id="quality-slider"
          type="range"
          min="1"
          max="100"
          value={quality}
          onChange={(e) => onQualityChange(parseInt(e.target.value))}
          className="quality-slider"
          style={{ '--value': `${quality}%` }}
          disabled={selectedFormat !== 'jpg' && selectedFormat !== 'jpeg' && selectedFormat !== 'webp'}
        />
        <div className="quality-labels">
          <span>低中高</span>
          <span>💡 提示：較高的質量會產生更大的文件</span>
        </div>
      </div>

      <button 
        className="convert-btn"
        onClick={onConvert}
        disabled={isLoading || hasConverted || isUploading}
      >
        {isUploading ? '檔案上傳中...' : isLoading ? '轉換中...' : hasConverted ? '✓ 已轉換完成' : '開始轉換'}
      </button>
    </div>
  )
}

export default ConversionOptions
