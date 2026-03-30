import { useEffect, useState } from 'react'
import { getHealth, getConfig, updateConfig } from '../api/client'
import type { HealthInfo, AppConfig } from '../types/memory'
import { CheckCircle, XCircle, Server, Cpu, Sliders } from 'lucide-react'

export default function Settings() {
  const [health, setHealth] = useState<HealthInfo | null>(null)
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [dedupExact, setDedupExact] = useState(0.95)
  const [dedupMerge, setDedupMerge] = useState(0.85)
  const [dedupRelated, setDedupRelated] = useState(0.70)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getHealth().then(setHealth)
    getConfig().then((c) => {
      setConfig(c)
      setDedupExact(c.dedup_exact)
      setDedupMerge(c.dedup_merge)
      setDedupRelated(c.dedup_related)
    })
  }, [])

  const handleSave = async () => {
    await updateConfig({ dedup_exact: dedupExact, dedup_merge: dedupMerge, dedup_related: dedupRelated })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const isHealthy = health?.status === 'healthy'

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-dracula-fg">Settings</h1>

      {/* Qdrant Health */}
      <div className="bg-dracula-current rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-dracula-purple" />
          <h3 className="font-medium text-dracula-fg">Qdrant Status</h3>
          {isHealthy ? (
            <CheckCircle className="w-4 h-4 text-dracula-green ml-auto" />
          ) : (
            <XCircle className="w-4 h-4 text-dracula-red ml-auto" />
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-dracula-comment">Host: </span>
            <span className="text-dracula-fg">{health?.qdrant?.host || '-'}:{health?.qdrant?.port || '-'}</span>
          </div>
          <div>
            <span className="text-dracula-comment">Total Vectors: </span>
            <span className="text-dracula-fg">{health?.qdrant?.total_vectors ?? '-'}</span>
          </div>
          {health?.qdrant?.collections && Object.entries(health.qdrant.collections).map(([name, info]) => (
            <div key={name}>
              <span className="text-dracula-comment">{name}: </span>
              <span className="text-dracula-fg">{(info as any).points_count} pts</span>
              <span className="text-dracula-comment ml-2">({(info as any).status})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Embedding Info */}
      <div className="bg-dracula-current rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-dracula-cyan" />
          <h3 className="font-medium text-dracula-fg">Embedding Model</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-dracula-comment">Model: </span>
            <span className="text-dracula-fg font-mono">{config?.embedding_model || '-'}</span>
          </div>
          <div>
            <span className="text-dracula-comment">Dimension: </span>
            <span className="text-dracula-fg">{config?.embedding_dim ?? '-'}</span>
          </div>
          <div>
            <span className="text-dracula-comment">User ID: </span>
            <span className="text-dracula-fg">{config?.default_user_id || '-'}</span>
          </div>
          <div>
            <span className="text-dracula-comment">Default Top K: </span>
            <span className="text-dracula-fg">{config?.default_top_k ?? '-'}</span>
          </div>
        </div>
      </div>

      {/* Dedup Thresholds */}
      <div className="bg-dracula-current rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-dracula-orange" />
          <h3 className="font-medium text-dracula-fg">Deduplication Thresholds</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Exact (skip)', value: dedupExact, set: setDedupExact, color: 'text-dracula-red' },
            { label: 'Merge', value: dedupMerge, set: setDedupMerge, color: 'text-dracula-orange' },
            { label: 'Related', value: dedupRelated, set: setDedupRelated, color: 'text-dracula-yellow' },
          ].map(({ label, value, set, color }) => (
            <div key={label} className="flex items-center gap-4">
              <span className={`text-sm w-28 ${color}`}>{label}</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={value}
                onChange={(e) => set(Number(e.target.value))}
                className="flex-1 accent-dracula-purple"
              />
              <span className="text-sm font-mono text-dracula-fg w-12 text-right">{value.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-dracula-purple text-dracula-bg rounded-lg text-sm font-medium hover:opacity-90"
        >
          {saved ? '✓ Saved' : 'Save Thresholds'}
        </button>
      </div>
    </div>
  )
}
