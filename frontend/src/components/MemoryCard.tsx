import type { Memory } from '../types/memory'
import TagBadge from './TagBadge'
import { Trash2, Edit3, Clock, Eye } from 'lucide-react'

interface Props {
  memory: Memory
  onEdit?: (m: Memory) => void
  onDelete?: (m: Memory) => void
  showScore?: boolean
}

const typeIcon: Record<string, string> = {
  fact: '📚',
  episode: '📝',
  skill: '⚡',
}

export default function MemoryCard({ memory, onEdit, onDelete, showScore }: Props) {
  const created = memory.created_at
    ? new Date(memory.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="bg-dracula-current rounded-lg p-4 hover:ring-1 hover:ring-dracula-purple/40 transition-all animate-fade-in group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{typeIcon[memory.memory_type] || '💾'}</span>
            <span className="text-xs font-medium uppercase text-dracula-comment bg-dracula-bg px-2 py-0.5 rounded">
              {memory.memory_type}
            </span>
            {showScore && memory.score !== undefined && (
              <span className="text-xs font-mono text-dracula-green bg-dracula-green/10 px-2 py-0.5 rounded">
                {(memory.score * 100).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-sm text-dracula-fg leading-relaxed whitespace-pre-wrap break-words">
            {memory.content}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {memory.tags?.map((tag) => <TagBadge key={tag} tag={tag} />)}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-dracula-comment">
            {created && (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{created}</span>
            )}
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{memory.access_count ?? 0}</span>
            {memory.category && <span>cat: {memory.category}</span>}
            {memory.domain && <span>domain: {memory.domain}</span>}
            {memory.outcome && <span>outcome: {memory.outcome}</span>}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(memory)}
              className="p-1.5 rounded hover:bg-dracula-bg text-dracula-comment hover:text-dracula-cyan"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(memory)}
              className="p-1.5 rounded hover:bg-dracula-bg text-dracula-comment hover:text-dracula-red"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
