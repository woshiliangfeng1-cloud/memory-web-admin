import { useEffect, useState, useCallback } from 'react'
import { listMemories, createMemory, updateMemory, deleteMemory } from '../api/client'
import type { Memory } from '../types/memory'
import MemoryCard from '../components/MemoryCard'
import MemoryEditor from '../components/MemoryEditor'
import ConfirmDialog from '../components/ConfirmDialog'
import { Plus, RefreshCw } from 'lucide-react'

const TABS = ['all', 'fact', 'episode', 'skill'] as const

export default function MemoryList() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [tab, setTab] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Memory | null>(null)
  const [deleting, setDeleting] = useState<Memory | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const type = tab === 'all' ? undefined : tab
      const res = await listMemories({ type, limit: 200 })
      setMemories(res.items)
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { load() }, [load])

  const handleSave = async (data: { text: string; type: string; tags: string[] }) => {
    if (editing) {
      await updateMemory(editing.id, { text: data.text, tags: data.tags })
    } else {
      await createMemory(data)
    }
    setEditorOpen(false)
    setEditing(null)
    load()
  }

  const handleDelete = async () => {
    if (deleting) {
      await deleteMemory(deleting.id, deleting.memory_type)
      setDeleting(null)
      load()
    }
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dracula-fg">Memories</h1>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="p-2 rounded-lg hover:bg-dracula-current text-dracula-comment hover:text-dracula-fg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setEditing(null); setEditorOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-dracula-purple text-dracula-bg rounded-lg text-sm font-medium hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> New Memory
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dracula-darker rounded-lg p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-dracula-current text-dracula-purple'
                : 'text-dracula-comment hover:text-dracula-fg'
            }`}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-dracula-comment">{memories.length} memories</p>

      {/* List */}
      <div className="space-y-2">
        {memories.map((m) => (
          <MemoryCard
            key={m.id}
            memory={m}
            onEdit={(m) => { setEditing(m); setEditorOpen(true) }}
            onDelete={setDeleting}
          />
        ))}
        {!loading && memories.length === 0 && (
          <p className="text-sm text-dracula-comment py-12 text-center">No memories found</p>
        )}
      </div>

      <MemoryEditor
        open={editorOpen}
        memory={editing}
        onClose={() => { setEditorOpen(false); setEditing(null) }}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleting}
        title="Delete Memory"
        message={`Are you sure you want to delete this ${deleting?.memory_type || 'memory'}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
