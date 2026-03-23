import axios from 'axios'

// 云端智能体：VITE_AGENT_API_URL 为空则走本地 proxy
const agentBaseURL = import.meta.env.VITE_AGENT_API_URL || ''
const agentApiKey = import.meta.env.VITE_AGENT_API_KEY || ''

// 分集大纲/剧本生成耗时较长，10 分钟超时
const api = axios.create({
  baseURL: agentBaseURL,
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：云端用 API Key + user_id/session_id（部分网关需要）
api.interceptors.request.use((config) => {
  if (agentApiKey) {
    config.headers.Authorization = `Bearer ${agentApiKey}`
    config.headers['user_id'] = config.headers['user_id'] || 'web_user'
    config.headers['session_id'] = config.headers['session_id'] || 'web_session'
  } else {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// 响应拦截器：处理 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
