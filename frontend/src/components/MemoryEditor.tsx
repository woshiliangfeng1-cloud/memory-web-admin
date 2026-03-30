import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Memory } from '../types/memory'

interface Props {
  open: boolean
  memory?: Memory | null
  onClose: () => void
  onSave: (data: { text: string; type: string; tags: string[] }) => void
}

export default function MemoryEditor({ open, memory, onClose, onSave }: Props) {
  const [text, setText] = useState('')
  const [type, setType] = useState<string>('fact')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    if (memory) {
      setText(memory.content || '')
      setType(memory.memory_type || 'fact')
      setTags(memory.tags || [])
    } else {
      setText('')
      setType('fact')
      setTags([])
    }
    setTagInput('')
  }, [memory, open])

  if (!open) return null

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
      setTagInput('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-dracula-bg border border-dracula-current rounded-xl w-full max-w-lg p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dracula-purple">
            {memory ? 'Edit Memory' : 'New Memory'}
          </h2>
          <button onClick={onClose} className="text-dracula-comment hover:text-dracula-fg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <textarea
          className="w-full h-32 bg-dracula-current border border-dracula-comment/20 rounded-lg p-3 text-sm text-dracula-fg placeholder-dracula-comment resize-none focus:outline-none focus:ring-1 focus:ring-dracula-purple"
          placeholder="Memory content..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex items-center gap-3 mt-3">
          <label className="text-sm text-dracula-comment">Type:</label>
          {['fact', 'episode', 'skill'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                type === t
                  ? 'bg-dracula-purple text-dracula-bg'
                  : 'bg-dracula-current text-dracula-comment hover:text-dracula-fg'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <div className="flex gap-2">
            <input
              className="flex-1 bg-dracula-current border border-dracula-comment/20 rounded-lg px-3 py-1.5 text-sm text-dracula-fg placeholder-dracula-comment focus:outline-none focus:ring-1 focus:ring-dracula-purple"
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <button
              onClick={addTag}
              className="px-3 py-1.5 bg-dracula-current text-dracula-comment text-sm rounded-lg hover:text-dracula-fg"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-dracula-purple/20 text-dracula-purple"
              >
                {tag}
                <button onClick={() => setTags(tags.filter((t) => t !== tag))} className="hover:text-dracula-red">
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-dracula-comment hover:text-dracula-fg rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (text.trim()) onSave({ text: text.trim(), type, tags }) }}
            disabled={!text.trim()}
            className="px-4 py-2 text-sm bg-dracula-purple text-dracula-bg rounded-lg font-medium hover:opacity-90 disabled:opacity-40"
          >
            {memory ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
