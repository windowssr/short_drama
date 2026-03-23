import { inject } from 'vue'
import api from '../api'

// 云端网关 404 时用本地：VITE_AGENT_API_URL 留空，运行 python -m handler
const agentBaseURL = (import.meta.env.VITE_AGENT_API_URL || '').replace(/\/$/, '')
const agentApiKey = import.meta.env.VITE_AGENT_API_KEY || ''
const useCloudProxy = import.meta.env.VITE_AGENT_USE_PROXY === '1'
const useCloud = !!agentBaseURL || useCloudProxy

// 云端多路径 fallback：火山网关可能只转发部分路径
const CLOUD_PATHS = [
  { path: '/chat', adapt: (p) => p },
  { path: '/', adapt: (p) => p },
  { path: '/api', adapt: (p) => p },
  { path: '/v1/invoke', adapt: (p) => ({ body: JSON.stringify(p) }) },
  { path: '/invoke', adapt: (p) => ({ body: JSON.stringify(p) }) }
]

export function useApi() {
  const setLoading = inject('setLoading', () => {})

  async function callApi(payload) {
    setLoading(true)
    try {
      if (useCloud) {
        // 代理模式：本地 handler 转发到云端，避免 CORS 和网关路径问题（需设置 AGENT_PROXY_URL/KEY）
        if (useCloudProxy) {
          const ctrl = new AbortController()
          const tid = setTimeout(() => ctrl.abort(), 600000)
          try {
            const res = await fetch('/api/cloud', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
              signal: ctrl.signal
            })
            clearTimeout(tid)
            if (!res.ok) {
              const err = await res.json().catch(() => ({}))
              throw new Error(err.error || err.message || '代理请求失败 ' + res.status)
            }
            return await res.json()
          } catch (e) {
            clearTimeout(tid)
            if (e.name === 'AbortError') throw new Error('请求超时（10 分钟），分集大纲生成耗时较长，请稍后重试')
            throw e
          }
        }
        let lastErr = null
        const REQ_TIMEOUT = 600000
        for (const { path, adapt } of CLOUD_PATHS) {
          try {
            const body = adapt(payload)
            const ctrl = new AbortController()
            const tid = setTimeout(() => ctrl.abort(), REQ_TIMEOUT)
            const res = await fetch(agentBaseURL + path, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + agentApiKey,
                'user_id': 'web_user',
                'session_id': 'web_session'
              },
              body: JSON.stringify(body),
              signal: ctrl.signal
            })
            clearTimeout(tid)
            if (res.status === 404) {
              lastErr = new Error('404 ' + path)
              continue
            }
            if (!res.ok) {
              const errData = await res.json().catch(() => ({}))
              throw new Error(errData.error || errData.message || '请求失败 ' + res.status)
            }
            const data = await res.json()
            // 适配不同返回格式：result / text / data
            if (data.result !== undefined) return data
            if (data.text !== undefined) return { ...data, result: data.text }
            return data
          } catch (e) {
            if (e.name === 'AbortError') throw new Error('请求超时（10 分钟），分集大纲生成耗时较长，请稍后重试')
            if (e.message?.startsWith('404')) {
              lastErr = e
              continue
            }
            throw e
          }
        }
        throw lastErr || new Error('云端网关 404，所有路径均不可达。请运行 python test_cloud.py 诊断')
      } else {
        const { data } = await api.post('/api', payload)
        return data
      }
    } finally {
      setLoading(false)
    }
  }

  async function downloadScript(payload) {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          action: 'download_script',
          data: payload
        })
      })
      if (!response.ok) throw new Error('Download failed')
      return await response.blob()
    } finally {
      setLoading(false)
    }
  }

  return { callApi, downloadScript }
}
