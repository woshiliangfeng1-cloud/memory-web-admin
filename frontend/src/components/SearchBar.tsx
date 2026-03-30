import { Search } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  onSearch: () => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, onSearch, placeholder = 'Semantic search...' }: Props) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dracula-comment" />
        <input
          className="w-full bg-dracula-current border border-dracula-comment/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-dracula-fg placeholder-dracula-comment focus:outline-none focus:ring-1 focus:ring-dracula-purple"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
      </div>
      <button
        onClick={onSearch}
        className="px-5 py-2.5 bg-dracula-purple text-dracula-bg rounded-lg text-sm font-medium hover:opacity-90"
      >
        Search
      </button>
    </div>
  )
}
