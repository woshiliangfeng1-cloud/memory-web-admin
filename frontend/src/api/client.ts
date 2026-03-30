import type { Memory, MemoryStats, TagInfo, HealthInfo, AppConfig } from '../types/memory'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

// Stats & Health
export const getStats = () => request<MemoryStats>('/stats')
export const getHealth = () => request<HealthInfo>('/health')
export const getConfig = () => request<AppConfig>('/config')
export const updateConfig = (data: Partial<AppConfig>) =>
  request<any>('/config', { method: 'PUT', body: JSON.stringify(data) })

// Memories CRUD
export const listMemories = (params?: { type?: string; tag?: string; limit?: number; offset?: number }) => {
  const qs = new URLSearchParams()
  if (params?.type) qs.set('type', params.type)
  if (params?.tag) qs.set('tag', params.tag)
  if (params?.limit) qs.set('limit', String(params.limit))
  if (params?.offset) qs.set('offset', String(params.offset))
  return request<{ items: Memory[]; total: number }>(`/memories?${qs}`)
}

export const getMemory = (id: string) => request<Memory>(`/memories/${id}`)

export const createMemory = (data: { text: string; type: string; tags: string[] }) =>
  request<any>('/memories', { method: 'POST', body: JSON.stringify(data) })

export const updateMemory = (id: string, data: { text?: string; tags?: string[] }) =>
  request<any>(`/memories/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteMemory = (id: string, type?: string) =>
  request<any>(`/memories/${id}${type ? `?type=${type}` : ''}`, { method: 'DELETE' })

// Search
export const searchMemories = (data: { query: string; type?: string; top_k?: number }) =>
  request<{ results: Memory[]; query: string }>('/search', { method: 'POST', body: JSON.stringify(data) })

// Tags
export const getTags = () => request<{ tags: TagInfo[] }>('/tags')

// Import/Export
export const exportMemories = async () => {
  const res = await fetch(`${BASE}/export`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `memory_export_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export const importMemories = async (file: File) => {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/import`, { method: 'POST', body: form })
  return res.json()
}
