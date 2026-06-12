'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin' || user.email === 'admin@sdlc.com') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" role="status"><span className="visually-hidden">Loading…</span></div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '75vh', padding: '24px 0' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Header */}
        <div className="text-center mb-6" style={{ marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px', background: 'var(--green-primary)',
            borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.4rem', fontWeight: 800, color: '#fff',
          }}>
            Σ
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '6px' }}>
            Sign in
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            to <strong style={{ color: 'var(--text-primary)' }}>SDLC Knowledge Assessment System</strong>
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert" style={{ fontSize: '0.88rem' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                type="email" id="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password" id="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn-premium w-100 justify-content-center"
              style={{ padding: '11px', fontSize: '0.95rem' }}
              disabled={submitting}
            >
              {submitting ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status" />Signing in…</>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center mt-4 mb-0" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--green-bright)', fontWeight: 600 }}>
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: '16px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Demo Admin Account
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <code style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px', color: 'var(--green-bright)', border: '1px solid var(--border-subtle)' }}>
              admin@sdlc.com
            </code>
            <code style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px', color: 'var(--green-bright)', border: '1px solid var(--border-subtle)' }}>
              admin123
            </code>
          </div>
        </div>

      </div>
    </div>
  );
}
