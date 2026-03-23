import { inject } from 'vue'
import api from '../api'

// 云端网关 404 时用本地：VITE_AGENT_API_URL 留空，运行 python -m handler
const agentBaseURL = (import.meta.env.VITE_AGENT_API_URL || '').replace(/\/$/, '')
const agentApiKey = import.meta.env.VITE_AGENT_API_KEY || ''
const useCloudProxy = import.meta.env.VITE_AGENT_USE_PROXY === '1'
const useCloud = !!agentBaseURL || useCloudProxy

function ngrokHeaders() {
  return (typeof window !== 'undefined' && window.location?.hostname?.includes('ngrok'))
    ? { 'ngrok-skip-browser-warning': 'true' } : {}
}

function parseSseResponse(raw) {
  const textParts = []
  const lines = raw.split(/\r?\n/)
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('data:')) {
      let buf = line.slice(5).trim()
      i++
      while (i < lines.length && !lines[i].startsWith('data:') && lines[i].trim() !== '') {
        buf += '\n' + lines[i]
        i++
      }
      if (buf && buf !== '[DONE]') {
        try {
          const obj = JSON.parse(buf)
          const d = obj.data || obj
          if (d?.content?.parts) {
            for (const p of d.content.parts) {
              if (p.text) textParts.push(p.text)
            }
          }
        } catch (_) {}
      }
    } else {
      i++
    }
  }
  let fullText = textParts.join('')

  // 尝试解析 root_agent 的 generate_story_outlines_response 格式
  const out = tryParseStoryOutlinesResponse(fullText)
  if (out) {
    return out
  }
  return { success: true, result: fullText }
}

/** 提取并格式化 generate_story_outlines_response 的 output */
function tryParseStoryOutlinesResponse(text) {
  let parsed = null
  try {
    parsed = JSON.parse(text)
  } catch (_) {
    const idx = text.indexOf('"generate_story_outlines_response"')
    if (idx >= 0) {
      const start = text.lastIndexOf('{', idx)
      if (start >= 0) {
        const extracted = extractBalancedJson(text, start)
        if (extracted) parsed = JSON.parse(extracted)
      }
    }
  }
  if (!parsed || parsed.action !== 'generate_story_outlines_response') return null
  const output = parsed.output
  if (!output || typeof output !== 'object') return null

  const lines = []
  for (const key of ['story_outline_1', 'story_outline_2']) {
    const o = output[key]
    if (!o || typeof o !== 'object') continue
    const title = o.title ? `【${o.title}】` : ''
    const core = o.core_setting || ''
    const synopsis = o.episode_synopsis || ''
    const block = [title, core, synopsis].filter(Boolean).join('\n\n')
    if (block) lines.push(block)
  }
  if (lines.length === 0) return null
  return { success: true, result: lines.join('\n\n' + '─'.repeat(40) + '\n\n') }
}

function extractBalancedJson(str, start) {
  if (str[start] !== '{') return null
  let depth = 0
  let inString = false
  let esc = false
  let quote = ''
  for (let i = start; i < str.length; i++) {
    const c = str[i]
    if (esc) { esc = false; continue }
    if (c === '\\' && inString) { esc = true; continue }
    if (inString) {
      if (c === quote) inString = false
      continue
    }
    if (c === '"' || c === "'") { inString = true; quote = c; continue }
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return str.slice(start, i + 1)
    }
  }
  return null
}

// 火山网关实测仅 /invoke 可达，其余 404；优先使用 /invoke
const CLOUD_PATHS = [
  { path: '/invoke', adapt: (p) => ({ body: JSON.stringify(p) }) },
  { path: '/chat', adapt: (p) => p },
  { path: '/', adapt: (p) => p },
  { path: '/api', adapt: (p) => p },
  { path: '/v1/invoke', adapt: (p) => ({ body: JSON.stringify(p) }) }
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
              headers: { 'Content-Type': 'application/json', ...ngrokHeaders() },
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
            const contentType = res.headers.get('content-type') || ''
            const raw = await res.text()
            let data
            if (raw.trimStart().startsWith('data:')) {
              data = parseSseResponse(raw)
            } else {
              try {
                data = JSON.parse(raw)
              } catch {
                throw new Error('响应格式异常: ' + raw.slice(0, 100))
              }
            }
            if (data.result !== undefined) return data
            if (data.text !== undefined) return { ...data, result: data.text }
            const d = data.data || data
            if (d?.content?.parts) {
              const text = (d.content.parts || []).map(p => p.text || '').filter(Boolean).join('')
              return { success: true, result: text }
            }
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
          ...ngrokHeaders(),
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
