// API 配置
// 在 HTTPS 環境下使用相對路徑,透過 Nginx 反向代理訪問後端
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const apiEndpoints = {
  formats: `${API_BASE_URL}/api/formats`,
  upload: `${API_BASE_URL}/api/upload`,
  convert: `${API_BASE_URL}/api/convert`,
  download: (url) => `${API_BASE_URL}${url}`
}

export default API_BASE_URL
