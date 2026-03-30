import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import MemoryList from './pages/MemoryList'
import Search from './pages/Search'
import Tags from './pages/Tags'
import Settings from './pages/Settings'
import ImportExport from './pages/ImportExport'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
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
