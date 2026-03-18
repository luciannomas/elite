'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Radio, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signIn('credentials', { email, password, redirect: false });
    if (result?.error) {
      setError('Email o contraseña incorrectos');
      setLoading(false);
      return;
    }
    // Fetch session to get role
    const res = await fetch('/api/auth/session');
    const session = await res.json();
    if (session?.user?.role === 'jefe_cuadrilla') {
      router.push('/jefe');
    } else {
      router.push('/auditor');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0f1117' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ backgroundColor: '#1d6fb8' }}>
            <Radio className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Elite</h1>
          <p className="text-sm mt-1" style={{ color: '#8b949e' }}>Sistema de Seguimiento Operativo</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ backgroundColor: '#161b22', border: '1px solid #21262d' }}>
          <h2 className="text-lg font-semibold text-white mb-6">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#8b949e' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none focus:ring-2 transition-all"
                style={{ backgroundColor: '#21262d', border: '1px solid #30363d', color: 'white' }}
                onFocus={e => { e.target.style.borderColor = '#1d6fb8'; e.target.style.boxShadow = '0 0 0 3px rgba(29,111,184,0.2)'; }}
                onBlur={e => { e.target.style.borderColor = '#30363d'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#8b949e' }}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
                style={{ backgroundColor: '#21262d', border: '1px solid #30363d', color: 'white' }}
                onFocus={e => { e.target.style.borderColor = '#1d6fb8'; e.target.style.boxShadow = '0 0 0 3px rgba(29,111,184,0.2)'; }}
                onBlur={e => { e.target.style.borderColor = '#30363d'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {error && (
              <div className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: 'rgba(218,54,51,0.15)', color: '#f85149', border: '1px solid rgba(218,54,51,0.3)' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#1d6fb8' }}
              onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.backgroundColor = '#1a5f9e'; }}
              onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = '#1d6fb8'; }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
