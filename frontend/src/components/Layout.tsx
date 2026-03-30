import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

interface Props {
  onLogout?: () => void
}

export default function Layout({ onLogout }: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-dracula-bg">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
