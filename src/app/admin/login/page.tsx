'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--paper)] px-4">
      <div className="w-full max-w-md bg-[var(--paper-deep)] border-2 border-[var(--ink)] rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="relative w-16 h-16 mx-auto mb-3">
            <Image
              src="/logo-placeholder.svg"
              alt="Shinghorin"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--ink)]">
            Shinghorin Studio
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--plum)] mt-1">
            Private Admin Portal
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-[var(--plum)]/10 border border-[var(--plum)] text-[var(--plum-deep)] text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider mb-1 opacity-70">
              Admin Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="field"
              placeholder="Username"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider mb-1 opacity-70">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
              placeholder="••••••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full justify-center text-sm py-3.5 shadow-md mt-2"
          >
            {loading ? 'Verifying...' : 'Unlock Admin Studio →'}
          </button>
        </form>

        <p className="font-mono text-[0.68rem] text-center opacity-50 mt-6">
          Default credentials can be configured in .env file
        </p>
      </div>
    </div>
  );
}
