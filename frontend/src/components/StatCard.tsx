import { ReactNode } from 'react'

interface Props {
  label: string
  value: string | number
  icon: ReactNode
  color?: string
}

export default function StatCard({ label, value, icon, color = 'text-dracula-purple' }: Props) {
  return (
    <div className="bg-dracula-current rounded-xl p-5 flex items-center gap-4 animate-fade-in">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-dracula-bg ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-dracula-fg">{value}</div>
        <div className="text-sm text-dracula-comment">{label}</div>
      </div>
    </div>
  )
}
