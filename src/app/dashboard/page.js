'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'profile'
  const router = useRouter();

  // Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profileGender, setProfileGender] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    else if (user) {
      if (user.role === 'admin' || user.email === 'admin@sdlc.com') {
        router.push('/admin');
      } else {
        fetchDashboardData();
        setProfileName(user.name || '');
        setProfileGender(user.gender || '');
      }
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/assessments');
      if (res.ok) {
        const data = await res.json();
        setAssessments(data.assessments || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);
    setProfileError(null);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, gender: profileGender })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save profile');
      setProfileSuccess(true);
      await refreshUser();
    } catch (err) {
      setProfileError(err.message || 'Error updating profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const scoreBadgeClass = (score) => {
    if (!score && score !== 0) return 'tuf-badge tuf-badge-gray';
    if (score >= 70) return 'tuf-badge tuf-badge-green';
    if (score >= 40) return 'tuf-badge tuf-badge-yellow';
    return 'tuf-badge tuf-badge-red';
  };

  if (authLoading || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border mb-3" role="status"><span className="visually-hidden">Loading...</span></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const avgScore = assessments.length > 0
    ? Math.round(assessments.reduce((s, a) => s + (a.overallScore || 0), 0) / assessments.length)
    : 0;

  return (
    <div className="fade-in" style={{ paddingTop: '8px' }}>

      {/* ─── Header ─── */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
        <div>
          <p className="section-title mb-1">Welcome back</p>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: 'var(--green-bright)' }}>
            {user?.name || user?.email?.split('@')[0]}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Track your SDLC maturity progress and audit history.
          </p>
        </div>
        <Link href="/assessment" className="btn-premium" style={{ padding: '10px 22px' }}>
          ＋ New Assessment
        </Link>
      </div>

      {/* ─── Tabs Navigation ─── */}
      <div className="d-flex gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={activeTab === 'dashboard' ? 'btn-premium' : 'btn-premium-outline'}
          style={{ fontSize: '0.9rem', padding: '9px 20px' }}
        >
          📊 Activity &amp; History
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={activeTab === 'profile' ? 'btn-premium' : 'btn-premium-outline'}
          style={{ fontSize: '0.9rem', padding: '9px 20px' }}
        >
          👤 Profile Settings
        </button>
      </div>

      {activeTab === 'dashboard' ? (
        <>
          {/* ─── Stats Row ─── */}
          <div className="row g-3 mb-4">
            {[
              { label: 'Total Audits', value: assessments.length, suffix: '' },
              { label: 'Avg Score',    value: avgScore,           suffix: '%' },
            ].map((stat, i) => (
              <div className="col-md-6 col-12" key={i}>
                <div className="glass-panel" style={{ padding: '20px 24px' }}>
                  <div className="section-title mb-1">{stat.label}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-bright)', letterSpacing: '-0.04em' }}>
                    {stat.value}{stat.suffix}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ─── Assessment History ─── */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Assessment Reports</h2>
              {assessments.length > 0 && (
                <Link href="/assessment" className="btn-premium-outline" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                  + New
                </Link>
              )}
            </div>

            {assessments.length === 0 ? (
              <div className="text-center" style={{ padding: '48px 24px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.5 }}>📋</div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  No assessments yet. Start your first audit now.
                </p>
                <Link href="/assessment" className="btn-premium">
                  Run First Audit →
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Audit Date</th>
                      <th className="text-center">Score</th>
                      <th className="text-end">Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessments.map((a) => (
                      <tr key={a.id}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {new Date(a.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="text-center">
                          <span className={scoreBadgeClass(a.overallScore)}>
                            {a.overallScore != null ? `${a.overallScore}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="text-end">
                          <Link href={`/report/${a.id}`} className="btn-premium-outline" style={{ padding: '5px 12px', fontSize: '0.8rem' }}>
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ─── Profile Settings Form ─── */
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 col-12">
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 className="h5 mb-4" style={{ color: 'var(--text-primary)' }}>User Profile Settings</h3>
              
              {profileSuccess && (
                <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
                  <span>✓</span> Profile updated successfully!
                </div>
              )}

              {profileError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                  <span>⚠️</span> {profileError}
                </div>
              )}

              <form onSubmit={handleProfileSave}>
                <div className="mb-3">
                  <label className="form-label" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={user?.email || ''}
                    disabled
                    style={{ opacity: 0.6 }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Gender</label>
                  <select
                    className="form-select"
                    value={profileGender}
                    onChange={e => setProfileGender(e.target.value)}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn-premium w-100 justify-content-center"
                  disabled={profileSaving}
                >
                  {profileSaving ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
