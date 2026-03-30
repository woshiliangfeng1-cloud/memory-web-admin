import { useState } from 'react'
import { Brain, Lock } from 'lucide-react'

interface Props {
  onLogin: () => void
}

export default function Login({ onLogin }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        onLogin()
      } else {
        setError('Password incorrect')
      }
    } catch {
      setError('Connection failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dracula-bg flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm animate-fade-in">
        <div className="bg-dracula-darker border border-dracula-current rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-dracula-current flex items-center justify-center mb-4">
              <Brain className="w-9 h-9 text-dracula-purple" />
            </div>
            <h1 className="text-xl font-bold text-dracula-fg">Memory Admin</h1>
            <p className="text-sm text-dracula-comment mt-1">Enter password to continue</p>
          </div>

          <div className="relative mb-4">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dracula-comment" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full bg-dracula-bg border border-dracula-comment/20 rounded-lg pl-10 pr-4 py-3 text-sm text-dracula-fg placeholder-dracula-comment focus:outline-none focus:ring-2 focus:ring-dracula-purple/50 focus:border-dracula-purple"
            />
          </div>

          {error && (
            <p className="text-sm text-dracula-red mb-3 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-dracula-purple text-dracula-bg rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  )
}
