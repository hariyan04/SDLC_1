'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [questions, setQuestions] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [settings, setSettings] = useState({
    activeAIProvider: 'expert',
    apiKeys: { openai: '', gemini: '', claude: '' },
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3'
  });
  
  // New Question Form state
  const [newQuestion, setNewQuestion] = useState({
    id: '',
    area: 'Requirements',
    subArea: '',
    practice: '',
    type: 'extent',
    questionText: ''
  });

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const FEEDBACK_PER_PAGE = 10;
  const AUDIT_PER_PAGE = 10;
  const [saveSuccess, setSaveSuccess] = useState(''); // inline success msg for question form
  const router = useRouter();

  const areas = ['Requirements', 'Architecture', 'Development', 'Testing', 'Deployment'];
  const AREA_ICONS = { Requirements: '📋', Architecture: '🏗️', Development: '💻', Testing: '🧪', Deployment: '🚀' };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.email !== 'admin@sdlc.com' && user.role !== 'admin') {
        alert('Access denied: Admin accounts only.');
        router.push('/dashboard');
      } else {
        fetchAdminData();
      }
    }
  }, [user, authLoading, router]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Fetch questions
      const qRes = await fetch('/api/questions');
      const qData = await qRes.json();
      setQuestions(qData.questions || []);

      // Fetch feedback
      const fRes = await fetch('/api/feedback');
      const fData = await fRes.json();
      setFeedbacks(fData.feedback || []);

      // Fetch assessments
      const aRes = await fetch('/api/assessments');
      const aData = await aRes.json();
      setAssessments(aData.assessments || []);

      // Fetch settings
      const sRes = await fetch('/api/settings');
      const sData = await sRes.json();
      setSettings(sData.settings || settings);

      // Fetch users list
      const uRes = await fetch('/api/users');
      if (uRes.ok) {
        const uData = await uRes.json();
        setUsersList(uData.users || []);
      }

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('AI Maturity settings updated successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err) {
      alert(err.message || 'Error updating settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleQuestionSave = async (e) => {
    e.preventDefault();
    setSavingQuestion(true);
    setSaveSuccess('');
    const isEditing = !!newQuestion.id;
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion)
      });

      if (res.ok) {
        // Reset form
        setNewQuestion({ id: '', area: 'Requirements', subArea: '', practice: '', type: 'extent', questionText: '' });
        // Reload questions list
        const qRes = await fetch('/api/questions');
        const qData = await qRes.json();
        setQuestions(qData.questions || []);
        // Show inline success
        setSaveSuccess(isEditing ? 'Question updated successfully!' : 'New question added!');
        setTimeout(() => setSaveSuccess(''), 4000);
      } else {
        throw new Error('Failed to save question');
      }
    } catch (err) {
      alert(err.message || 'Error saving question');
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleQuestionDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this questionnaire item?')) return;
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setQuestions(prev => prev.filter(q => q.id !== parseInt(id)));
        alert('Question deleted.');
      } else {
        throw new Error('Failed to delete question');
      }
    } catch (err) {
      alert(err.message || 'Error deleting question');
    }
  };

  const handleQuestionEdit = (q) => {
    setNewQuestion({
      id: q.id,
      area: q.area,
      subArea: q.subArea,
      practice: q.practice || '',
      type: q.type || 'extent',
      questionText: q.questionText
    });
    // Scroll to form
    document.getElementById('questionForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (authLoading || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Admin Dashboard...</span>
        </div>
      </div>
    );
  }


  // Calculate statistics metrics
  const avgFeedbackRating = feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : 'N/A';
  const averageMaturityScore = assessments.length > 0 ? (assessments.reduce((sum, a) => sum + a.overallScore, 0) / assessments.length).toFixed(0) : 'N/A';
  const averageAuditsPerUser = usersList.length > 0 ? (assessments.length / usersList.length).toFixed(1) : '0';

  const scoreBadgeClass = (score) => {
    if (!score && score !== 0) return 'tuf-badge tuf-badge-gray';
    if (score >= 70) return 'tuf-badge tuf-badge-green';
    if (score >= 40) return 'tuf-badge tuf-badge-yellow';
    return 'tuf-badge tuf-badge-red';
  };

  return (
    <div className="py-4">
      {/* Title Header */}
      <div className="glass-panel p-4 mb-4">
        <h1 className="h2 mb-1" style={{ color: 'var(--text-primary)' }}>Admin Command Console</h1>
        <p className="text-muted mb-0">Manage SDLC questionnaire databases, configure AI integrations, and inspect user reviews.</p>
      </div>

      {/* Tabs list */}
      <div className="d-flex gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => setActiveTab('stats')}
          className={activeTab === 'stats' ? 'btn-premium' : 'btn-premium-outline'}
          style={{ fontSize: '0.9rem', padding: '9px 20px' }}
        >
          📈 Stats &amp; Feedbacks
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={activeTab === 'questions' ? 'btn-premium' : 'btn-premium-outline'}
          style={{ fontSize: '0.9rem', padding: '9px 20px' }}
        >
          📝 Question Database
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={activeTab === 'ai' ? 'btn-premium' : 'btn-premium-outline'}
          style={{ fontSize: '0.9rem', padding: '9px 20px' }}
        >
          🤖 AI Configuration
        </button>
      </div>

      {/* TAB CONTENT: STATS & FEEDBACK */}
      {activeTab === 'stats' && (
        <div>
          {/* Summary stats */}
          <div className="row g-4 mb-4">
            <div className="col-md-3 col-sm-6 col-12">
              <div className="glass-panel metric-card p-4 text-center">
                <span className="text-muted small fw-bold text-uppercase">Total Users</span>
                <div className="metric-value">{usersList.length}</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 col-12">
              <div className="glass-panel metric-card p-4 text-center">
                <span className="text-muted small fw-bold text-uppercase">Average Audits</span>
                <div className="metric-value">{averageAuditsPerUser}</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 col-12">
              <div className="glass-panel metric-card p-4 text-center">
                <span className="text-muted small fw-bold text-uppercase">Average Score</span>
                <div className="metric-value">{averageMaturityScore}%</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 col-12">
              <div className="glass-panel metric-card p-4 text-center">
                <span className="text-muted small fw-bold text-uppercase">Average Rating</span>
                <div className="metric-value">{avgFeedbackRating} / 5⭐ <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-secondary)' }}>({feedbacks.length} logs)</span></div>
              </div>
            </div>
          </div>

          {/* Feedback Feed — paginated, 10 per page */}
          {(() => {
            const totalFbPages = Math.ceil(feedbacks.length / FEEDBACK_PER_PAGE);
            const pagedFeedbacks = feedbacks.slice(
              (feedbackPage - 1) * FEEDBACK_PER_PAGE,
              feedbackPage * FEEDBACK_PER_PAGE
            );
            return (
              <div className="glass-panel p-4">
                {/* Header row */}
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                  <h3 className="h5 mb-0">Audit Feedback &amp; Reviews Log</h3>
                  {feedbacks.length > 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {feedbacks.length} total &nbsp;·&nbsp; Page {feedbackPage} of {totalFbPages}
                    </span>
                  )}
                </div>

                {feedbacks.length === 0 ? (
                  <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💬</div>
                    No feedbacks logged yet.
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0" style={{ color: 'var(--text-primary)' }}>
                        <thead>
                          <tr style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                            <th scope="col" style={{ width: '120px', paddingBottom: '12px' }}>#</th>
                            <th scope="col" style={{ width: '150px', paddingBottom: '12px' }}>Rating</th>
                            <th scope="col" style={{ paddingBottom: '12px' }}>Comments</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedFeedbacks.map((f, idx) => (
                            <tr key={f.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                              {/* Row number */}
                              <td className="py-3" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                #{(feedbackPage - 1) * FEEDBACK_PER_PAGE + idx + 1}
                              </td>
                              {/* Stars */}
                              <td className="py-3">
                                <div className="d-flex align-items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} style={{
                                      fontSize: '1.05rem',
                                      color: i < f.rating ? '#f5a623' : 'var(--border-subtle)',
                                      lineHeight: 1
                                    }}>★</span>
                                  ))}
                                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                                    {f.rating}/5
                                  </span>
                                </div>
                              </td>
                              {/* Comment */}
                              <td className="py-3" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55 }}>
                                {f.comments
                                  ? f.comments
                                  : <em style={{ opacity: 0.45, fontSize: '0.85rem' }}>No comment left</em>
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination controls */}
                    {totalFbPages > 1 && (
                      <div className="d-flex align-items-center justify-content-center gap-1 mt-4 pt-3" style={{ borderTop: '1px solid var(--border-glass)' }}>
                        {/* Prev */}
                        <button
                          onClick={() => setFeedbackPage(p => Math.max(1, p - 1))}
                          disabled={feedbackPage === 1}
                          style={{
                            padding: '6px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600,
                            border: '1px solid var(--border-subtle)',
                            background: feedbackPage === 1 ? 'transparent' : 'var(--bg-elevated)',
                            color: feedbackPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                            cursor: feedbackPage === 1 ? 'not-allowed' : 'pointer',
                            opacity: feedbackPage === 1 ? 0.4 : 1,
                            transition: 'all 0.15s'
                          }}
                        >
                          ← Prev
                        </button>

                        {/* Page number pills */}
                        {Array.from({ length: totalFbPages }, (_, i) => i + 1).map(page => {
                          // Show first, last, current ± 1, and ellipsis
                          const show = page === 1 || page === totalFbPages || Math.abs(page - feedbackPage) <= 1;
                          const showEllipsisBefore = page === feedbackPage - 2 && feedbackPage - 2 > 1;
                          const showEllipsisAfter  = page === feedbackPage + 2 && feedbackPage + 2 < totalFbPages;
                          if (showEllipsisBefore || showEllipsisAfter) {
                            return <span key={page} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0 2px' }}>…</span>;
                          }
                          if (!show) return null;
                          const isActive = page === feedbackPage;
                          return (
                            <button
                              key={page}
                              onClick={() => setFeedbackPage(page)}
                              style={{
                                width: '34px', height: '34px', borderRadius: 'var(--radius-md)',
                                border: isActive ? '1.5px solid var(--green-primary)' : '1px solid var(--border-subtle)',
                                background: isActive ? 'var(--green-glow)' : 'var(--bg-elevated)',
                                color: isActive ? 'var(--green-bright)' : 'var(--text-secondary)',
                                fontWeight: isActive ? 700 : 500, fontSize: '0.85rem',
                                cursor: 'pointer', transition: 'all 0.15s'
                              }}
                            >
                              {page}
                            </button>
                          );
                        })}

                        {/* Next */}
                        <button
                          onClick={() => setFeedbackPage(p => Math.min(totalFbPages, p + 1))}
                          disabled={feedbackPage === totalFbPages}
                          style={{
                            padding: '6px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600,
                            border: '1px solid var(--border-subtle)',
                            background: feedbackPage === totalFbPages ? 'transparent' : 'var(--bg-elevated)',
                            color: feedbackPage === totalFbPages ? 'var(--text-muted)' : 'var(--text-primary)',
                            cursor: feedbackPage === totalFbPages ? 'not-allowed' : 'pointer',
                            opacity: feedbackPage === totalFbPages ? 0.4 : 1,
                            transition: 'all 0.15s'
                          }}
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}

          {/* Maturity Audits & Reports Log — paginated, 10 per page */}
          {(() => {
            const totalAuditPages = Math.ceil(assessments.length / AUDIT_PER_PAGE);
            const pagedAudits = assessments.slice(
              (auditPage - 1) * AUDIT_PER_PAGE,
              auditPage * AUDIT_PER_PAGE
            );
            return (
              <div className="glass-panel p-4 mt-4">
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                  <h3 className="h5 mb-0">Maturity Audits &amp; Reports Log</h3>
                  {assessments.length > 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {assessments.length} total &nbsp;·&nbsp; Page {auditPage} of {totalAuditPages}
                    </span>
                  )}
                </div>

                {assessments.length === 0 ? (
                  <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
                    No audits logged yet.
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0" style={{ color: 'var(--text-primary)' }}>
                        <thead>
                          <tr style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                            <th scope="col" style={{ width: '50px', paddingBottom: '12px' }}>#</th>
                            <th scope="col" style={{ paddingBottom: '12px' }}>User</th>
                            <th scope="col" style={{ paddingBottom: '12px' }}>Audit Date</th>
                            <th scope="col" style={{ width: '110px', paddingBottom: '12px', textAlign: 'center' }}>Score</th>
                            <th scope="col" style={{ width: '80px', paddingBottom: '12px', textAlign: 'right' }}>Link</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedAudits.map((a, idx) => {
                            const u = usersList.find(usr => usr.id === a.userId);
                            const displayName = u && u.name ? `${u.name} (${u.email})` : a.userEmail || a.userId;
                            return (
                              <tr key={a.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                {/* Row number */}
                                <td className="py-3" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                                  #{(auditPage - 1) * AUDIT_PER_PAGE + idx + 1}
                                </td>
                                <td className="py-3">
                                  <strong style={{ fontSize: '0.9rem' }}>{displayName}</strong>
                                </td>
                                <td className="py-3" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                  {new Date(a.createdAt).toLocaleString(undefined, {
                                    year: 'numeric', month: 'short', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                  })}
                                </td>
                                <td className="py-3" style={{ textAlign: 'center' }}>
                                  <span className={scoreBadgeClass(a.overallScore)}>
                                    {a.overallScore != null ? `${a.overallScore}%` : 'N/A'}
                                  </span>
                                </td>
                                <td className="py-3" style={{ textAlign: 'right' }}>
                                  <a
                                    href={`/report/${a.id}`}
                                    style={{
                                      fontSize: '0.78rem', fontWeight: 600, color: 'var(--green-bright)',
                                      textDecoration: 'none', padding: '4px 10px',
                                      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)',
                                      background: 'var(--bg-elevated)', display: 'inline-block',
                                      transition: 'all 0.15s'
                                    }}
                                  >
                                    View →
                                  </a>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination controls */}
                    {totalAuditPages > 1 && (
                      <div className="d-flex align-items-center justify-content-center gap-1 mt-4 pt-3" style={{ borderTop: '1px solid var(--border-glass)' }}>
                        {/* Prev */}
                        <button
                          onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                          disabled={auditPage === 1}
                          style={{
                            padding: '6px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600,
                            border: '1px solid var(--border-subtle)',
                            background: auditPage === 1 ? 'transparent' : 'var(--bg-elevated)',
                            color: auditPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                            cursor: auditPage === 1 ? 'not-allowed' : 'pointer',
                            opacity: auditPage === 1 ? 0.4 : 1, transition: 'all 0.15s'
                          }}
                        >
                          ← Prev
                        </button>

                        {/* Page number pills */}
                        {Array.from({ length: totalAuditPages }, (_, i) => i + 1).map(page => {
                          const show = page === 1 || page === totalAuditPages || Math.abs(page - auditPage) <= 1;
                          const showEllipsisBefore = page === auditPage - 2 && auditPage - 2 > 1;
                          const showEllipsisAfter  = page === auditPage + 2 && auditPage + 2 < totalAuditPages;
                          if (showEllipsisBefore || showEllipsisAfter) {
                            return <span key={page} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0 2px' }}>…</span>;
                          }
                          if (!show) return null;
                          const isActive = page === auditPage;
                          return (
                            <button
                              key={page}
                              onClick={() => setAuditPage(page)}
                              style={{
                                width: '34px', height: '34px', borderRadius: 'var(--radius-md)',
                                border: isActive ? '1.5px solid var(--green-primary)' : '1px solid var(--border-subtle)',
                                background: isActive ? 'var(--green-glow)' : 'var(--bg-elevated)',
                                color: isActive ? 'var(--green-bright)' : 'var(--text-secondary)',
                                fontWeight: isActive ? 700 : 500, fontSize: '0.85rem',
                                cursor: 'pointer', transition: 'all 0.15s'
                              }}
                            >
                              {page}
                            </button>
                          );
                        })}

                        {/* Next */}
                        <button
                          onClick={() => setAuditPage(p => Math.min(totalAuditPages, p + 1))}
                          disabled={auditPage === totalAuditPages}
                          style={{
                            padding: '6px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600,
                            border: '1px solid var(--border-subtle)',
                            background: auditPage === totalAuditPages ? 'transparent' : 'var(--bg-elevated)',
                            color: auditPage === totalAuditPages ? 'var(--text-muted)' : 'var(--text-primary)',
                            cursor: auditPage === totalAuditPages ? 'not-allowed' : 'pointer',
                            opacity: auditPage === totalAuditPages ? 0.4 : 1, transition: 'all 0.15s'
                          }}
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB CONTENT: QUESTION MANAGER */}
      {activeTab === 'questions' && (
        <div className="row g-4">
          {/* Question List — grouped by SDLC area */}
          <div className="col-lg-8 col-12">
            <h3 className="h5 mb-3">Maturity Question Database <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>({areas.length} sections)</span></h3>

            {areas.map(area => {
              const areaQs = questions.filter(q => q.area === area);
              const count = areaQs.length;
              return (
                <div key={area} className="glass-panel p-0 mb-3" style={{ overflow: 'hidden' }}>
                  {/* Section header */}
                  <div style={{
                    padding: '10px 16px',
                    background: 'var(--bg-elevated)',
                    borderBottom: '1px solid var(--border-glass)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: '1.1rem' }}>{AREA_ICONS[area]}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{area}</span>
                    </div>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 600,
                      padding: '3px 10px', borderRadius: '12px',
                      background: count === 0 ? 'rgba(200,50,50,0.12)' : 'var(--green-glow)',
                      color: count === 0 ? '#f85149' : 'var(--green-bright)',
                      border: `1px solid ${count === 0 ? 'rgba(200,50,50,0.25)' : 'var(--green-primary)'}`,
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {count} question{count !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Questions list */}
                  {count === 0 ? (
                    <div style={{ padding: '18px 16px', fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No questions in this section yet.
                    </div>
                  ) : (
                    <table className="table table-hover align-middle mb-0" style={{ color: 'var(--text-primary)', fontSize: '0.83rem' }}>
                      <tbody>
                        {areaQs.map((q, idx) => (
                          <tr key={q.id} style={{ borderBottom: idx < areaQs.length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
                            <td style={{ width: '38px', paddingLeft: '16px', color: 'var(--text-muted)' }}>
                              <code style={{ fontSize: '0.75rem' }}>#{q.id}</code>
                            </td>
                            <td style={{ paddingLeft: '8px' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{q.subArea}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.4' }}>{q.questionText}</div>
                            </td>
                            <td style={{ width: '72px' }} className="text-end pe-3">
                              <div className="d-flex justify-content-end gap-1">
                                <button onClick={() => handleQuestionEdit(q)} className="btn btn-sm btn-outline-primary py-1 px-2" style={{ fontSize: '0.75rem' }}>✎</button>
                                <button onClick={() => handleQuestionDelete(q.id)} className="btn btn-sm btn-outline-danger py-1 px-2" style={{ fontSize: '0.75rem' }}>×</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add/Edit Question Form */}
          <div className="col-lg-4 col-12" id="questionForm">
            <div className="glass-panel p-4 sticky-lg-top" style={{ top: '90px', zIndex: 10 }}>

              {/* Edit mode indicator banner */}
              {newQuestion.id ? (
                <div style={{
                  background: 'rgba(210,153,34,0.1)', border: '1px solid rgba(210,153,34,0.3)',
                  borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '16px',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <span style={{ fontSize: '1rem' }}>✏️</span>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#d29922' }}>EDITING QUESTION</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>#{newQuestion.id}</div>
                  </div>
                </div>
              ) : (
                <h3 className="h5 mb-4">Create New Question</h3>
              )}

              <form onSubmit={handleQuestionSave}>
                <div className="mb-3">
                  <label htmlFor="area" className="form-label text-muted small fw-bold">SDLC Area</label>
                  <select
                    id="area"
                    className="form-control form-control-premium"
                    value={newQuestion.area}
                    onChange={(e) => setNewQuestion({ ...newQuestion, area: e.target.value })}
                  >
                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="subArea" className="form-label text-muted small fw-bold">Process / Sub-Area Name</label>
                  <input
                    type="text"
                    id="subArea"
                    className="form-control form-control-premium py-2"
                    placeholder="e.g., Requirement Prioritization"
                    value={newQuestion.subArea}
                    onChange={(e) => setNewQuestion({ ...newQuestion, subArea: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="practice" className="form-label text-muted small fw-bold">Capability Practice Focus</label>
                  <input
                    type="text"
                    id="practice"
                    className="form-control form-control-premium py-2"
                    placeholder="e.g., Roadmap planning"
                    value={newQuestion.practice}
                    onChange={(e) => setNewQuestion({ ...newQuestion, practice: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="type" className="form-label text-muted small fw-bold">Question Type format</label>
                  <select
                    id="type"
                    className="form-control form-control-premium"
                    value={newQuestion.type}
                    onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                  >
                    <option value="extent">To what extent does... ("extent")</option>
                    <option value="practice">To what extent is the following true... ("practice")</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="questionText" className="form-label text-muted small fw-bold">Question Text Prompt</label>
                  <textarea
                    id="questionText"
                    rows="4"
                    className="form-control form-control-premium"
                    placeholder="Type the full questionnaire prompt text here..."
                    value={newQuestion.questionText}
                    onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                    required
                  ></textarea>
                </div>

                {/* Save / Update button — btn-premium only, no Bootstrap btn override */}
                <button
                  type="submit"
                  className={newQuestion.id ? 'btn-premium' : 'btn-premium'}
                  style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '0.92rem' }}
                  disabled={savingQuestion}
                >
                  {savingQuestion
                    ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Saving…</>
                    : newQuestion.id ? '💾 Save Changes' : '＋ Add Question'}
                </button>

                {/* Cancel edit button */}
                {newQuestion.id && (
                  <button
                    type="button"
                    onClick={() => setNewQuestion({ id: '', area: 'Requirements', subArea: '', practice: '', type: 'extent', questionText: '' })}
                    className="btn-premium-outline"
                    style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.88rem', marginTop: '8px' }}
                  >
                    ✕ Cancel Edit
                  </button>
                )}

                {/* Inline success message */}
                {saveSuccess && (
                  <div style={{
                    marginTop: '12px', padding: '10px 14px',
                    background: 'rgba(26,127,55,0.08)', border: '1px solid rgba(26,127,55,0.25)',
                    borderRadius: 'var(--radius-md)', color: 'var(--green-bright)',
                    fontSize: '0.85rem', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    ✓ {saveSuccess}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AI CONFIGURATION */}
      {activeTab === 'ai' && (
        <div className="row justify-content-center">
          <div className="col-lg-7 col-md-10 col-12">
            <div className="glass-panel p-5">
              <h3 className="h4 mb-4">AI Agent Engine Settings</h3>
              
              <form onSubmit={handleSettingsSave}>
                {/* Active Provider Toggles */}
                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold mb-3">Active Remarks Generator</label>
                  <div className="d-flex flex-column gap-2">
                    <label className="maturity-option d-flex align-items-center py-3 px-3">
                      <input
                        type="radio"
                        name="aiProvider"
                        value="expert"
                        checked={settings.activeAIProvider === 'expert'}
                        onChange={() => setSettings({ ...settings, activeAIProvider: 'expert' })}
                        className="me-3"
                      />
                      <div>
                        <strong>Local Rule-Based Expert Engine</strong>
                        <span className="text-muted d-block small">Offline, instant generator calculating detailed maturity insights locally. No API Key required.</span>
                      </div>
                    </label>

                    <label className="maturity-option d-flex align-items-center py-3 px-3">
                      <input
                        type="radio"
                        name="aiProvider"
                        value="ollama"
                        checked={settings.activeAIProvider === 'ollama'}
                        onChange={() => setSettings({ ...settings, activeAIProvider: 'ollama' })}
                        className="me-3"
                      />
                      <div>
                        <strong>Local Ollama Server</strong>
                        <span className="text-muted d-block small">Connect to local developer model endpoints (e.g. Llama 3) for absolute code privacy.</span>
                      </div>
                    </label>

                    <label className="maturity-option d-flex align-items-center py-3 px-3">
                      <input
                        type="radio"
                        name="aiProvider"
                        value="gemini"
                        checked={settings.activeAIProvider === 'gemini'}
                        onChange={() => setSettings({ ...settings, activeAIProvider: 'gemini' })}
                        className="me-3"
                      />
                      <div>
                        <strong>Google Gemini API</strong>
                        <span className="text-muted d-block small">Ultra high-speed reasoning API. Requires Gemini API Key.</span>
                      </div>
                    </label>

                    <label className="maturity-option d-flex align-items-center py-3 px-3">
                      <input
                        type="radio"
                        name="aiProvider"
                        value="openai"
                        checked={settings.activeAIProvider === 'openai'}
                        onChange={() => setSettings({ ...settings, activeAIProvider: 'openai' })}
                        className="me-3"
                      />
                      <div>
                        <strong>OpenAI ChatGPT API</strong>
                        <span className="text-muted d-block small">High quality audit reports. Requires OpenAI API Key.</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Ollama configurations */}
                {settings.activeAIProvider === 'ollama' && (
                  <div className="p-4 rounded-4 mb-4 border border-secondary border-opacity-10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                    <h4 className="h6 mb-3">Ollama Server Settings</h4>
                    <div className="mb-3">
                      <label htmlFor="ollamaUrl" className="form-label text-muted small fw-bold">Ollama API URL</label>
                      <input
                        type="text"
                        id="ollamaUrl"
                        className="form-control form-control-premium"
                        value={settings.ollamaUrl}
                        onChange={(e) => setSettings({ ...settings, ollamaUrl: e.target.value })}
                        placeholder="http://localhost:11434"
                      />
                    </div>
                    <div className="mb-0">
                      <label htmlFor="ollamaModel" className="form-label text-muted small fw-bold">Model Name Tag</label>
                      <input
                        type="text"
                        id="ollamaModel"
                        className="form-control form-control-premium"
                        value={settings.ollamaModel}
                        onChange={(e) => setSettings({ ...settings, ollamaModel: e.target.value })}
                        placeholder="llama3"
                      />
                    </div>
                  </div>
                )}

                {/* Cloud API Keys configuration */}
                {settings.activeAIProvider !== 'expert' && settings.activeAIProvider !== 'ollama' && (
                  <div className="p-4 rounded-4 mb-4 border border-secondary border-opacity-10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                    <h4 className="h6 mb-3">API Keys</h4>
                    
                    {settings.activeAIProvider === 'gemini' && (
                      <div className="mb-0">
                        <label htmlFor="geminiKey" className="form-label text-muted small fw-bold">Google Gemini API Key</label>
                        <input
                          type="password"
                          id="geminiKey"
                          className="form-control form-control-premium"
                          value={settings.apiKeys.gemini || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            apiKeys: { ...settings.apiKeys, gemini: e.target.value }
                          })}
                          placeholder="AIzaSy..."
                          autoComplete="new-password"
                        />
                      </div>
                    )}

                    {settings.activeAIProvider === 'openai' && (
                      <div className="mb-0">
                        <label htmlFor="openaiKey" className="form-label text-muted small fw-bold">OpenAI API Key</label>
                        <input
                          type="password"
                          id="openaiKey"
                          className="form-control form-control-premium"
                          value={settings.apiKeys.openai || ''}
                          onChange={(e) => setSettings({
                            ...settings,
                            apiKeys: { ...settings.apiKeys, openai: e.target.value }
                          })}
                          placeholder="sk-..."
                          autoComplete="new-password"
                        />
                      </div>
                    )}
                  </div>
                )}

                <button type="submit" className="btn-premium w-100 justify-content-center py-3 mt-2" disabled={savingSettings}>
                  {savingSettings ? 'Saving Settings...' : 'Save AI Configuration'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
