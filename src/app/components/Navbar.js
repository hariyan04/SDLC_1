'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user && (user.email === 'admin@sdlc.com' || user.role === 'admin');

  const navLinks = user ? [
    ...(isAdmin ? [{ href: '/admin', label: 'Admin Console', admin: true }] : [{ href: '/dashboard', label: 'Dashboard' }]),
    ...(isAdmin ? [] : [{ href: '/assessment', label: 'New Assessment' }]),
  ] : [];

  return (
    <nav className="navbar-premium">
      <div className="container d-flex align-items-center h-100" style={{ gap: '0' }}>
        {/* Brand */}
        <Link href="/" className="navbar-brand me-4" onClick={() => setMenuOpen(false)}>
          <span className="nav-logo-icon">Σ</span>
          <span style={{ color: 'var(--text-primary)' }}>SDLC Knowledge Assessment System</span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar-nav d-none d-lg-flex flex-row me-auto h-100">
          {navLinks.map(link => (
            <li className="nav-item" key={link.href}>
              <Link
                href={link.href}
                className={`nav-link${pathname === link.href ? ' active' : ''}${link.admin ? ' admin-link' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Controls */}
        <div className="d-flex align-items-center gap-2 ms-auto">


          {user ? (
            <div className="d-none d-md-flex align-items-center gap-3">
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {user.name || user.email}
              </span>
              <button onClick={logout} className="btn-premium-outline" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                Sign out
              </button>
            </div>
          ) : (
            <div className="d-none d-md-flex gap-2">
              <Link href="/login" className="btn-premium-outline" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                Log in
              </Link>
              <Link href="/signup" className="btn-premium" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            className="d-lg-none theme-toggle-btn ms-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{ fontSize: '1.1rem' }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            left: 0,
            right: 0,
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '12px 16px',
            zIndex: 999,
          }}
        >
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="d-block py-2"
              style={{
                color: link.admin ? 'var(--green-bright)' : 'var(--text-secondary)',
                fontWeight: 500,
                fontSize: '0.95rem',
                borderBottom: '1px solid var(--border-subtle)',
              }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button
              onClick={() => { logout(); setMenuOpen(false); }}
              style={{ color: 'var(--danger)', fontWeight: 500, fontSize: '0.95rem', background: 'none', border: 'none', padding: '8px 0', cursor: 'pointer' }}
            >
              Sign out
            </button>
          ) : (
            <div className="d-flex gap-2 mt-2">
              <Link href="/login" className="btn-premium-outline w-50 justify-content-center" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link href="/signup" className="btn-premium w-50 justify-content-center" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
