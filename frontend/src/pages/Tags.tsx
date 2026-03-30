import { useEffect, useState } from 'react'
import { getTags, listMemories } from '../api/client'
import type { TagInfo, Memory } from '../types/memory'
import TagBadge from '../components/TagBadge'
import MemoryCard from '../components/MemoryCard'

export default function Tags() {
  const [tags, setTags] = useState<TagInfo[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [memories, setMemories] = useState<Memory[]>([])

  useEffect(() => {
    getTags().then((r) => setTags(r.tags))
  }, [])

  useEffect(() => {
    if (selected) {
      listMemories({ tag: selected, limit: 100 }).then((r) => setMemories(r.items))
    } else {
      setMemories([])
    }
  }, [selected])

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold text-dracula-fg">Tags</h1>

      <div className="bg-dracula-current rounded-xl p-5">
        <h3 className="text-sm font-medium text-dracula-comment mb-3">
          All Tags ({tags.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t.name}
              onClick={() => setSelected(selected === t.name ? null : t.name)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selected === t.name
                  ? 'bg-dracula-purple text-dracula-bg font-medium'
                  : 'bg-dracula-bg text-dracula-comment hover:text-dracula-fg'
              }`}
            >
              <span>{t.name}</span>
              <span className="text-xs opacity-60">({t.count})</span>
            </button>
          ))}
          {tags.length === 0 && (
            <p className="text-sm text-dracula-comment">No tags found</p>
          )}
        </div>
      </div>

      {selected && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-dracula-comment">
            Memories tagged "{selected}" ({memories.length})
          </h3>
          {memories.map((m) => (
            <MemoryCard key={m.id} memory={m} />
          ))}
        </div>
      )}
    </div>
  )
}
