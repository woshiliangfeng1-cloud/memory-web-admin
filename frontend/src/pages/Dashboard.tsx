import { useEffect, useState } from 'react'
import { getStats, getHealth, listMemories, getTags } from '../api/client'
import type { MemoryStats, HealthInfo, Memory, TagInfo } from '../types/memory'
import StatCard from '../components/StatCard'
import MemoryCard from '../components/MemoryCard'
import { BookOpen, FileText, Zap, Database, Activity } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const PIE_COLORS = ['#bd93f9', '#50fa7b', '#ffb86c']

export default function Dashboard() {
  const [stats, setStats] = useState<MemoryStats | null>(null)
  const [health, setHealth] = useState<HealthInfo | null>(null)
  const [recent, setRecent] = useState<Memory[]>([])
  const [tags, setTags] = useState<TagInfo[]>([])

  useEffect(() => {
    getStats().then(setStats)
    getHealth().then(setHealth)
    listMemories({ limit: 5 }).then((r) => setRecent(r.items))
    getTags().then((r) => setTags(r.tags.slice(0, 10)))
  }, [])

  const factCount = stats?.collections?.memory_facts?.points_count ?? 0
  const episodeCount = stats?.collections?.memory_episodes?.points_count ?? 0
  const skillCount = stats?.collections?.memory_skills?.points_count ?? 0

  const pieData = [
    { name: 'Facts', value: factCount },
    { name: 'Episodes', value: episodeCount },
    { name: 'Skills', value: skillCount },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dracula-fg">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              health?.status === 'healthy' ? 'bg-dracula-green' : 'bg-dracula-red'
            }`}
          />
          <span className="text-sm text-dracula-comment">
            Qdrant {health?.status === 'healthy' ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Memories" value={stats?.total_memories ?? 0} icon={<Database className="w-6 h-6" />} />
        <StatCard label="Facts" value={factCount} icon={<BookOpen className="w-6 h-6" />} color="text-dracula-purple" />
        <StatCard label="Episodes" value={episodeCount} icon={<FileText className="w-6 h-6" />} color="text-dracula-green" />
        <StatCard label="Skills" value={skillCount} icon={<Zap className="w-6 h-6" />} color="text-dracula-orange" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie chart */}
        <div className="bg-dracula-current rounded-xl p-5">
          <h3 className="text-sm font-medium text-dracula-comment mb-3">Memory Type Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#282a36', border: '1px solid #44475a', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: '#f8f8f2' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-1">
            {pieData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-dracula-comment">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        {/* Tag bar chart */}
        <div className="bg-dracula-current rounded-xl p-5">
          <h3 className="text-sm font-medium text-dracula-comment mb-3">Top Tags</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tags} layout="vertical" margin={{ left: 60, right: 20 }}>
              <XAxis type="number" tick={{ fill: '#6272a4', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#f8f8f2', fontSize: 11 }} width={55} />
              <Tooltip
                contentStyle={{ backgroundColor: '#282a36', border: '1px solid #44475a', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: '#f8f8f2' }}
              />
              <Bar dataKey="count" fill="#bd93f9" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent memories */}
      <div>
        <h3 className="text-sm font-medium text-dracula-comment mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Recent Memories
        </h3>
        <div className="space-y-2">
          {recent.map((m) => (
            <MemoryCard key={m.id} memory={m} />
          ))}
          {recent.length === 0 && (
            <p className="text-sm text-dracula-comment py-8 text-center">No memories yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
