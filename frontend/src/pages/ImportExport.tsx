import { useState } from 'react'
import { exportMemories, importMemories, getStats } from '../api/client'
import { Download, Upload, FileJson } from 'lucide-react'

export default function ImportExport() {
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportMemories()
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setResult(null)
    try {
      const res = await importMemories(file)
      setResult(res)
    } catch (err: any) {
      setResult({ error: err.message })
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-dracula-fg">Import / Export</h1>

      {/* Export */}
      <div className="bg-dracula-current rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-dracula-green" />
          <h3 className="font-medium text-dracula-fg">Export Memories</h3>
        </div>
        <p className="text-sm text-dracula-comment">
          Download all memories as a JSON file. Includes content, type, tags, and metadata.
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-dracula-green/20 text-dracula-green rounded-lg text-sm font-medium hover:bg-dracula-green/30 disabled:opacity-50"
        >
          <FileJson className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export JSON'}
        </button>
      </div>

      {/* Import */}
      <div className="bg-dracula-current rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-dracula-cyan" />
          <h3 className="font-medium text-dracula-fg">Import Memories</h3>
        </div>
        <p className="text-sm text-dracula-comment">
          Upload a JSON file to import memories. Deduplication is applied automatically.
        </p>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-dracula-cyan/20 text-dracula-cyan rounded-lg text-sm font-medium hover:bg-dracula-cyan/30 cursor-pointer">
          <FileJson className="w-4 h-4" />
          {importing ? 'Importing...' : 'Select JSON File'}
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>

        {result && (
          <div className="bg-dracula-bg rounded-lg p-4 text-sm animate-fade-in">
            {result.error ? (
              <p className="text-dracula-red">{result.error}</p>
            ) : (
              <div className="space-y-1">
                <p className="text-dracula-green font-medium">{result.message}</p>
                <p className="text-dracula-comment">
                  Created: {result.created} · Duplicate: {result.duplicate} · Merged: {result.merged} · Errors: {result.errors}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
