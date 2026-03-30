import { useState } from 'react'
import { searchMemories } from '../api/client'
import type { Memory } from '../types/memory'
import SearchBar from '../components/SearchBar'
import MemoryCard from '../components/MemoryCard'

export default function Search() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<string>('')
  const [topK, setTopK] = useState(10)
  const [results, setResults] = useState<Memory[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const doSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await searchMemories({
        query: query.trim(),
        type: type || undefined,
        top_k: topK,
      })
      setResults(res.results)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold text-dracula-fg">Semantic Search</h1>

      <SearchBar value={query} onChange={setQuery} onSearch={doSearch} placeholder="Search memories by meaning..." />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs text-dracula-comment">Type:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-dracula-current border border-dracula-comment/20 rounded-lg px-3 py-1.5 text-sm text-dracula-fg focus:outline-none focus:ring-1 focus:ring-dracula-purple"
          >
            <option value="">All</option>
            <option value="fact">Facts</option>
            <option value="episode">Episodes</option>
            <option value="skill">Skills</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-dracula-comment">Top K:</label>
          <input
            type="range"
            min={1}
            max={20}
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="w-24 accent-dracula-purple"
          />
          <span className="text-xs text-dracula-fg w-5">{topK}</span>
        </div>
      </div>

      {loading && <p className="text-sm text-dracula-comment py-4">Searching...</p>}

      {searched && !loading && (
        <div className="space-y-2">
          <p className="text-xs text-dracula-comment">{results.length} results</p>
          {results.map((m) => (
            <MemoryCard key={m.id} memory={m} showScore />
          ))}
          {results.length === 0 && (
            <p className="text-sm text-dracula-comment py-8 text-center">No matching memories found</p>
          )}
        </div>
      )}
    </div>
  )
}
