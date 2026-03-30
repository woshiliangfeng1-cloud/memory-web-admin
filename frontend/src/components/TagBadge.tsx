interface Props {
  tag: string
  onClick?: () => void
  removable?: boolean
  onRemove?: () => void
}

const colorMap: Record<string, string> = {
  default: 'bg-dracula-comment/30 text-dracula-fg',
  wiki: 'bg-dracula-purple/20 text-dracula-purple',
  code: 'bg-dracula-green/20 text-dracula-green',
  debug: 'bg-dracula-red/20 text-dracula-red',
  config: 'bg-dracula-orange/20 text-dracula-orange',
  ai: 'bg-dracula-cyan/20 text-dracula-cyan',
  design: 'bg-dracula-pink/20 text-dracula-pink',
}

function getColor(tag: string) {
  for (const [key, cls] of Object.entries(colorMap)) {
    if (tag.toLowerCase().includes(key)) return cls
  }
  return colorMap.default
}

export default function TagBadge({ tag, onClick, removable, onRemove }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getColor(tag)} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
    >
      {tag}
      {removable && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove?.() }}
          className="ml-0.5 hover:text-dracula-red"
        >
          &times;
        </button>
      )}
    </span>
  )
}
