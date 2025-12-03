/**
 * 前端錯誤日誌服務
 * 捕捉所有錯誤並發送到後端進行持久化
 */

class ErrorLogger {
  constructor() {
    this.errors = []
    this.maxErrors = 100
    this.logEndpoint = '/api/log-error'
  }

  /**
   * 記錄錯誤
   */
  logError(error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message: error?.message || String(error),
      stack: error?.stack || '',
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    this.errors.push(errorEntry)

    // 保持最多 maxErrors 條記錄
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // 立即發送到後端
    this.sendToBackend(errorEntry)

    // 同時在控制台輸出
    console.error('[ErrorLogger]', errorEntry)

    return errorEntry
  }

  /**
   * 發送錯誤到後端
   */
  async sendToBackend(errorEntry) {
    try {
      await fetch(this.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorEntry)
      })
    } catch (err) {
      // 如果發送失敗，至少在本地保存
      console.error('[ErrorLogger] Failed to send error to backend:', err)
    }
  }

  /**
   * 獲取所有已記錄的錯誤
   */
  getErrors() {
    return [...this.errors]
  }

  /**
   * 清空錯誤記錄
   */
  clearErrors() {
    this.errors = []
  }

  /**
   * 獲取最後一個錯誤
   */
  getLastError() {
    return this.errors[this.errors.length - 1] || null
  }
}

// 建立全局實例
const errorLogger = new ErrorLogger()

/**
 * 設置全局錯誤處理
 */
export function setupGlobalErrorHandling() {
  // 捕捉 JavaScript 錯誤
  window.addEventListener('error', (event) => {
    errorLogger.logError(event.error, {
      type: 'UncaughtError',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })

  // 捕捉未處理的 Promise 拒絕
  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.logError(event.reason, {
      type: 'UnhandledPromiseRejection'
    })
  })
}

export default errorLogger
