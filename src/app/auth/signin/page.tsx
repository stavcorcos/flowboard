'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', { email, password, redirect: false })

    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="modal-panel w-full" style={{ maxWidth: '22rem' }}>
      <div className="mb-6">
        <span className="font-display text-lg font-bold text-accent tracking-tight">⬡ FlowBoard</span>
        <h1 className="mt-3 text-xl font-display font-bold text-primary">Sign in</h1>
        <p className="text-secondary text-sm mt-1">Welcome back to your team's board</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-dark"
            placeholder="you@example.com"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="form-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-dark"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <p className="text-xs font-medium" style={{ color: '#f0889f' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-accent w-full py-2.5 text-sm font-semibold mt-1"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-secondary text-xs mt-5">
        No account?{' '}
        <Link href="/auth/signup" className="text-accent hover:underline font-medium">
          Create one
        </Link>
      </p>
    </div>
  )
}
