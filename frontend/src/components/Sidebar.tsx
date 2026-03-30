import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Database, Search, Tag, Settings, ArrowDownUp, Brain } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/memories', icon: Database, label: 'Memories' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/tags', icon: Tag, label: 'Tags' },
  { to: '/import-export', icon: ArrowDownUp, label: 'Import/Export' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-dracula-current bg-dracula-darker flex flex-col">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-dracula-current">
        <Brain className="w-6 h-6 text-dracula-purple" />
        <span className="text-lg font-bold text-dracula-purple">Memory Admin</span>
      </div>
      <nav className="flex-1 py-3">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-dracula-current text-dracula-purple font-medium'
                  : 'text-dracula-comment hover:text-dracula-fg hover:bg-dracula-bg'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-3 text-xs text-dracula-comment border-t border-dracula-current">
        Memory MCP Admin v1.0
      </div>
    </aside>
  )
}
