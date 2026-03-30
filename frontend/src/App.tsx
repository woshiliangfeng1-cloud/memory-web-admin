import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import MemoryList from './pages/MemoryList'
import Search from './pages/Search'
import Tags from './pages/Tags'
import Settings from './pages/Settings'
import ImportExport from './pages/ImportExport'
import Login from './pages/Login'

export default function App() {
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/auth-check', { credentials: 'include' })
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false))
  }, [])

  // Loading
  if (authed === null) {
    return (
      <div className="min-h-screen bg-dracula-bg flex items-center justify-center">
        <div className="text-dracula-comment text-sm">Loading...</div>
      </div>
    )
  }

  // Login
  if (!authed) {
    return <Login onLogin={() => setAuthed(true)} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onLogout={() => setAuthed(false)} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/memories" element={<MemoryList />} />
          <Route path="/search" element={<Search />} />
          <Route path="/tags" element={<Tags />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/import-export" element={<ImportExport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
