'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from './AuthContext';

const AREAS = [
  { name: 'Requirements', icon: '📋', color: '#2ea043',
    desc: 'Idea exploration, elicitation, backlog refinement, impact analysis, and bidirectional traceability.' },
  { name: 'Architecture', icon: '🏗️', color: '#1f6feb',
    desc: 'Architecture synthesizers, diagram generation, PR drift detection, compliance analysis, and FinOps.' },
  { name: 'Development', icon: '💻', color: '#8957e5',
    desc: 'AI coding assistants, agentic pull requests, custom scripts via MCP, and dependency mapping.' },
  { name: 'Testing', icon: '🧪', color: '#d29922',
    desc: 'E2E workflow automation, synthetic data creation, defect classification, and test script generation.' },
  { name: 'Deployment', icon: '🚀', color: '#da3633',
    desc: 'Automated release notes, capacity predictions, self-healing systems, and CI/CD quality gates.' },
];

const LEVELS = [
  { label: 'L0', title: 'Traditional',             color: '#484f58', desc: 'Purely manual processes. No AI tools integrated.' },
  { label: 'L1', title: 'Assisted / Tool',         color: '#1f6feb', desc: 'Basic inline autocomplete, chat assistants, and ad-hoc scripts.' },
  { label: 'L2', title: 'Delegated / Assistant',   color: '#8957e5', desc: 'AI acts as a copilot — opening PRs and drafting test scripts under supervision.' },
  { label: 'L3', title: 'Supervised Agent',        color: '#d29922', desc: 'AI agents orchestrate multi-step refactoring or test runs with human approval gates.' },
  { label: 'L4', title: 'Autonomous Workforce',    color: '#2ea043', desc: 'Automated safety nets, autonomous task execution over days, and structured evals.' },
  { label: 'L5', title: 'Agentic Enterprise',      color: '#3fb950', desc: 'Self-healing production, automatic drift remediation, fully autonomous workflows.' },
];

const STATS = [
  { value: '25',   label: 'Assessment Questions' },
  { value: '5',   label: 'SDLC Domains' },
  { value: 'L0–L5', label: 'Maturity Levels' },
  { value: 'AI',  label: 'Powered Analysis' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ paddingTop: '8px' }}>

      {/* ─── Hero ─── */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '64px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '32px',
      }}>
        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '300px',
          background: 'radial-gradient(ellipse at center, rgba(46,160,67,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="tuf-badge tuf-badge-green mb-4" style={{ margin: '0 auto 20px' }}>
          ✦ AI Maturity Intelligence
        </div>

        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1.15,
          marginBottom: '20px',
          color: 'var(--text-primary)',
        }}>
          Know Your SDLC<br />
          <span style={{ color: 'var(--green-bright)' }}>AI Maturity Level</span>
        </h1>

        <p style={{
          maxWidth: '600px', margin: '0 auto 36px',
          color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7,
        }}>
          This system audits your engineering workflows across 25 targeted questions, scores AI capability
          across 5 SDLC domains, and delivers precise recommendations powered by Llama.
        </p>

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          {user ? (
            <Link href={user.role === 'admin' || user.email === 'admin@sdlc.com' ? '/admin' : '/dashboard'} className="btn-premium" style={{ padding: '12px 28px', fontSize: '1rem' }}>
              Go to {user.role === 'admin' || user.email === 'admin@sdlc.com' ? 'Admin Console' : 'Dashboard'} →
            </Link>
          ) : (
            <>
              <Link href="/signup" className="btn-premium" style={{ padding: '12px 28px', fontSize: '1rem' }}>
                Start Assessment →
              </Link>
              <Link href="/login" className="btn-premium-outline" style={{ padding: '12px 28px', fontSize: '1rem' }}>
                Log In
              </Link>
            </>
          )}
        </div>

        {/* Stats Bar */}
        <div className="d-flex justify-content-center gap-4 flex-wrap mt-5 pt-5"
          style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--green-bright)', letterSpacing: '-0.03em' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 5 Domains ─── */}
      <div style={{ marginBottom: '40px' }}>
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="divider flex-grow-1" />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
            5 Core Assessment Domains
          </span>
          <div className="divider flex-grow-1" />
        </div>

        <div className="row g-3">
          {AREAS.map((area, idx) => (
            <div className="col-lg col-md-4 col-sm-6 col-12" key={idx}>
              <div className="tuf-card h-100" style={{ padding: '20px', cursor: 'default' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                  background: `${area.color}18`, border: `1px solid ${area.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', marginBottom: '14px',
                }}>
                  {area.icon}
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {area.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {area.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Maturity Levels ─── */}
      <div style={{ marginBottom: '40px' }}>
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="divider flex-grow-1" />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
            AI Maturity Scale
          </span>
          <div className="divider flex-grow-1" />
        </div>

        <div className="row g-3">
          {LEVELS.map((lvl, idx) => (
            <div className="col-lg-4 col-md-6 col-12" key={idx}>
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderLeft: `3px solid ${lvl.color}`,
                borderRadius: `0 var(--radius-md) var(--radius-md) 0`,
                padding: '16px 20px',
                transition: 'background var(--transition)',
                height: '100%',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                    color: lvl.color, background: `${lvl.color}18`,
                    border: `1px solid ${lvl.color}30`, borderRadius: '4px',
                    padding: '2px 8px', letterSpacing: '0.04em',
                  }}>
                    {lvl.label}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {lvl.title}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {lvl.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── CTA Footer ─── */}
      {!user && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(46,160,67,0.08) 0%, rgba(46,160,67,0.03) 100%)',
          border: '1px solid rgba(46,160,67,0.2)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>
            Ready to measure your SDLC AI maturity?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Create a free account and complete your first audit in under 10 minutes.
          </p>
          <Link href="/signup" className="btn-premium" style={{ padding: '12px 32px', fontSize: '1rem' }}>
            Get Started Free →
          </Link>
        </div>
      )}
    </div>
  );
}
