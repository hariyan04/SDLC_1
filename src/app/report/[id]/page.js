'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../AuthContext';
import { useTheme } from '../../ThemeContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Radar, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler,
  Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ─── Markdown renderer ───────────────────────────────────────────
function renderInline(text) {
  const parts = [];
  let remaining = text;
  let key = 0;
  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`(.+?)`/);
    const first = boldMatch && codeMatch
      ? boldMatch.index <= codeMatch.index ? 'bold' : 'code'
      : boldMatch ? 'bold' : codeMatch ? 'code' : null;
    if (first === 'bold') {
      if (boldMatch.index > 0) parts.push(<span key={key++}>{remaining.slice(0, boldMatch.index)}</span>);
      parts.push(<strong key={key++} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
    } else if (first === 'code') {
      if (codeMatch.index > 0) parts.push(<span key={key++}>{remaining.slice(0, codeMatch.index)}</span>);
      parts.push(<code key={key++} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.85em', color: 'var(--green-bright)', fontFamily: 'var(--font-mono)' }}>{codeMatch[1]}</code>);
      remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
    } else {
      parts.push(<span key={key++}>{remaining}</span>);
      remaining = '';
    }
  }
  return parts;
}

function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## '))   return <h2 key={i} style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '22px', marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>{renderInline(line.slice(3))}</h2>;
    if (line.startsWith('### '))  return <h3 key={i} style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--green-bright)', marginTop: '16px', marginBottom: '4px' }}>{renderInline(line.slice(4))}</h3>;
    if (line.startsWith('#### ')) return <h4 key={i} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '12px', marginBottom: '4px' }}>{renderInline(line.slice(5))}</h4>;
    if (line.startsWith('- ') || line.startsWith('* ')) return (
      <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
        <span style={{ color: 'var(--green-primary)', flexShrink: 0 }}>›</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{renderInline(line.slice(2))}</span>
      </div>
    );
    if (line.startsWith('> ')) return <blockquote key={i} style={{ borderLeft: '3px solid var(--green-primary)', padding: '8px 14px', margin: '10px 0', background: 'var(--green-glow-sm)', borderRadius: '0 6px 6px 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{renderInline(line.slice(2))}</blockquote>;
    if (line.startsWith('---')) return <hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border-subtle)', margin: '14px 0' }} />;
    if (line.trim() === '') return <div key={i} style={{ height: '4px' }} />;
    return <p key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '4px', fontSize: '0.9rem' }}>{renderInline(line)}</p>;
  });
}

const AREA_LABELS = ['Requirements', 'Architecture', 'Development', 'Testing', 'Deployment'];
const AREA_COLORS = ['#2ea043', '#1f6feb', '#8957e5', '#d29922', '#da3633'];

function getLevelName(score) {
  if (score >= 4.5) return 'L5 · Agentic';
  if (score >= 3.5) return 'L4 · Autonomous';
  if (score >= 2.5) return 'L3 · Supervised';
  if (score >= 1.5) return 'L2 · Delegated';
  if (score >= 0.5) return 'L1 · Assisted';
  return 'L0 · Traditional';
}

export default function Report({ params }) {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingRemarks, setGeneratingRemarks] = useState(false);
  const [remarksError, setRemarksError] = useState(null);
  const [rating, setRating] = useState(0);       // 0 = no selection
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comments, setComments] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const remarksTriggered = useRef(false);
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    else if (user && id) fetchReport();
  }, [user, id, authLoading, router]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      // Fetch assessment + questions in parallel
      const [res, qRes] = await Promise.all([
        fetch(`/api/assessments/${id}`),
        fetch('/api/questions')
      ]);
      if (!res.ok) throw new Error('Report not found');
      const [data, qData] = await Promise.all([res.json(), qRes.json()]);
      setAssessment(data.assessment);
      setQuestions(qData.questions || []);
      if (data.assessment.feedback) {
        setFeedbackSubmitted(true);
        setRating(data.assessment.feedback.rating || 0);
        setComments(data.assessment.feedback.comments || '');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!assessment || remarksTriggered.current) return;
    const needsRemarks = !assessment.remarks || assessment.remarks === 'null' || assessment.remarks.trim() === '';
    if (needsRemarks) {
      remarksTriggered.current = true;
      generateRemarks();
    }
  }, [assessment]);

  const generateRemarks = async () => {
    setGeneratingRemarks(true);
    setRemarksError(null);
    try {
      const res = await fetch('/api/remarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores: assessment.scores, answers: assessment.answers }),
      });
      if (!res.ok) throw new Error('Remarks generation failed');
      const data = await res.json();
      await fetch(`/api/assessments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: data.remarks, provider: data.provider }),
      });
      setAssessment(prev => ({ ...prev, remarks: data.remarks, remarksProvider: data.provider || 'AI' }));
    } catch (err) {
      console.error('Remarks error:', err);
      setRemarksError('AI analysis failed. Click Retry to try again.');
    } finally {
      setGeneratingRemarks(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { alert('Please select a star rating before submitting.'); return; }
    setSubmittingFeedback(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId: id, rating, comments })
      });
      if (res.ok) setFeedbackSubmitted(true);
      else { const d = await res.json(); throw new Error(d.message); }
    } catch (err) {
      console.error('Feedback error:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border mb-3" role="status"><span className="visually-hidden">Loading…</span></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading report…</p>
        </div>
      </div>
    );
  }
  if (!assessment) return null;

  // ── Re-compute area scores live from stored answers + current question metadata ──
  // This ensures the correct divisor (total questions per area) is always used,
  // regardless of when the assessment was originally saved.
  const areaScores = AREA_LABELS.map(area => {
    if (questions.length > 0) {
      const areaQIds = questions
        .filter(q => q.area === area)
        .map(q => String(q.id));
      const answered = areaQIds
        .map(id => assessment.answers?.[id])
        .filter(ans => ans != null && ans.level !== null && ans.level !== undefined)
        .map(ans => parseInt(ans.level))
        .filter(v => !isNaN(v));
      return areaQIds.length > 0
        ? answered.reduce((a, b) => a + b, 0) / areaQIds.length
        : 0;
    }
    // Fallback: use stored area score if questions not yet loaded
    return assessment.scores[area] || 0;
  });

  // Area question counts (for display in cards)
  const areaQCounts = AREA_LABELS.map(area =>
    questions.filter(q => q.area === area).length
  );

  // Re-compute overall score as level score from live area scores
  const allAnsweredLevels = questions.length > 0
    ? Object.entries(assessment.answers || {})
        .map(([, ans]) => ans?.level !== null && ans?.level !== undefined ? parseInt(ans.level) : null)
        .filter(v => v !== null && !isNaN(v))
    : [];

  const avgLevel = questions.length > 0
    ? (allAnsweredLevels.reduce((a, b) => a + b, 0) / questions.length)
    : (assessment.overallScore != null ? (assessment.overallScore / 100) * 5 : 0);

  // Custom rounding rules:
  // - If decimal part is < 0.25 -> floor
  // - If decimal part is > 0.75 -> ceil
  // - If decimal part is between 0.25 and 0.75 -> round to 0.5
  const integerPart = Math.floor(avgLevel);
  const decimalPart = avgLevel - integerPart;
  let maturityLevelScore;
  if (decimalPart < 0.25) {
    maturityLevelScore = integerPart;
  } else if (decimalPart > 0.75) {
    maturityLevelScore = integerPart + 1;
  } else {
    maturityLevelScore = integerPart + 0.5;
  }

  const scoreClass = maturityLevelScore >= 3.5 ? 'green' : maturityLevelScore >= 2.0 ? 'yellow' : 'red';
  const scoreLabel = maturityLevelScore >= 3.5 ? 'High Maturity' : maturityLevelScore >= 2.0 ? 'Medium Maturity' : 'Low Maturity';

  // ─── Radar Chart ────────────────────────────────────────────────
  const radarData = {
    labels: AREA_LABELS,
    datasets: [
      {
        label: assessment.projectName,
        data: areaScores,
        backgroundColor: 'rgba(46, 160, 67, 0.15)',
        borderColor: '#2ea043',
        borderWidth: 2,
        pointBackgroundColor: '#3fb950',
        pointBorderColor: '#161b22',
        pointRadius: 5,
      },
      {
        label: 'L3 Benchmark',
        data: [3, 3, 3, 3, 3],
        backgroundColor: 'rgba(31,111,235,0.04)',
        borderColor: 'rgba(88,166,255,0.35)',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0,
      }
    ]
  };

  const chartTextColor = theme === 'light' ? '#1f2328' : '#e6edf3';
  const gridColor = theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)';
  const gridColorBar = theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
  const ticksColor = theme === 'light' ? '#57606a' : '#8b949e';

  const radarOptions = {
    scales: {
      r: {
        angleLines: { color: gridColor },
        grid: { color: gridColor },
        pointLabels: { color: chartTextColor, font: { size: 12, weight: '600' } },
        ticks: { color: ticksColor, backdropColor: 'transparent', stepSize: 1, font: { size: 10 } },
        min: 0, max: 5,
      }
    },
    plugins: { legend: { labels: { color: ticksColor, font: { size: 11 }, boxWidth: 12 } } },
    maintainAspectRatio: false,
  };

  // ─── Bar Chart: Area Scores (0-5) ───────────────────────────────
  const barData = {
    labels: AREA_LABELS.map(l => l.slice(0, 4)),  // shortened labels
    datasets: [{
      label: 'Maturity Score (0–5)',
      data: areaScores,
      backgroundColor: AREA_COLORS.map(c => c + '30'),
      borderColor: AREA_COLORS,
      borderWidth: 2,
      borderRadius: 6,
    }]
  };

  const barOptions = {
    indexAxis: 'y',   // horizontal bars — easier to read labels
    scales: {
      x: {
        min: 0, max: 5,
        grid: { color: gridColorBar },
        ticks: { color: ticksColor, stepSize: 1, font: { size: 11 } },
        title: { display: true, text: 'Maturity Score (0–5)', color: ticksColor, font: { size: 11 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: chartTextColor, font: { size: 12, weight: '600' } },
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.raw.toFixed(1)}/5 — ${getLevelName(ctx.raw)}`,
        }
      }
    },
    maintainAspectRatio: false,
  };

  // ─── Stars (dark-mode friendly) ──────────────────────────────────
  const displayRating = hoveredStar || rating;

  return (
    <div className="fade-in" style={{ paddingTop: '8px' }}>

      {/* ─── Header ─── */}
      <div className="d-flex align-items-start justify-content-between mb-5 flex-wrap gap-3">
        <div>
          <Link href={user?.role === 'admin' || user?.email === 'admin@sdlc.com' ? '/admin' : '/dashboard'} style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            ← Back to {user?.role === 'admin' || user?.email === 'admin@sdlc.com' ? 'Admin Console' : 'Dashboard'}
          </Link>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: 'var(--text-primary)' }}>
            {assessment.projectName}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '4px 0 0', fontFamily: 'var(--font-mono)' }}>
            Audited {new Date(assessment.createdAt).toLocaleDateString(undefined, {
              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', padding: '20px 28px', textAlign: 'center', minWidth: '150px',
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Maturity Score
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--green-bright)', letterSpacing: '-0.05em', lineHeight: 1 }}>
            {maturityLevelScore.toFixed(1)}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '2px' }}>/5</span>
          </div>
          <span className={`tuf-badge tuf-badge-${scoreClass}`} style={{ marginTop: '8px', display: 'inline-flex' }}>{scoreLabel}</span>
        </div>
      </div>

      {/* ─── Area Score Cards ─── */}
      <div className="row g-3 mb-4">
      {AREA_LABELS.map((area, i) => {
          const score = areaScores[i];
          const pct = Math.round((score / 5) * 100);
          const qCount = areaQCounts[i];
          return (
            <div className="col" key={area}>
              <div className="glass-panel" style={{ padding: '16px 18px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '4px' }}>{area}</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: AREA_COLORS[i], letterSpacing: '-0.03em' }}>
                  {score.toFixed(1)}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>/5</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {getLevelName(score)}{qCount > 0 ? <span style={{ marginLeft: '6px', opacity: 0.7 }}>· {qCount} Q</span> : null}
                </div>
                <div className="progress" style={{ height: '3px', background: 'var(--bg-elevated)' }}>
                  <div style={{ width: `${pct}%`, height: '3px', background: AREA_COLORS[i], borderRadius: '2px' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Charts ─── */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '2px' }}>SDLC Pentagon Matrix</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '16px' }}>Your scores across 5 SDLC pillars vs L3 benchmark</p>
            <div style={{ height: '290px' }}><Radar data={radarData} options={radarOptions} /></div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '2px' }}>Area Maturity Breakdown</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '16px' }}>Score per domain (0 = Traditional → 5 = Agentic Enterprise)</p>
            <div style={{ height: '290px' }}><Bar data={barData} options={barOptions} /></div>
          </div>
        </div>
      </div>

      {/* ─── AI Remarks ─── */}
      <div className="glass-panel mb-4" style={{ padding: '28px', borderLeft: '3px solid var(--green-primary)' }}>
        <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <span style={{ fontSize: '1.1rem' }}>🤖</span>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>AI Agent Analysis</span>
          {!generatingRemarks && assessment.remarksProvider && (
            <span className="tuf-badge tuf-badge-green">{assessment.remarksProvider}</span>
          )}
          {generatingRemarks && (
            <span className="tuf-badge tuf-badge-blue">
              <span className="spinner-border spinner-border-sm me-1" style={{ width: '10px', height: '10px', borderWidth: '1.5px' }} />
              Generating…
            </span>
          )}
        </div>

        {generatingRemarks ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div className="spinner-border mb-3" role="status" style={{ color: 'var(--green-primary)', width: '2rem', height: '2rem' }} />
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, margin: '0 0 4px' }}>
              AI Agent is analysing your SDLC maturity…
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
              Generating a brief report for each domain. This takes around 20–40 seconds.
            </p>
          </div>
        ) : remarksError ? (
          <div className="alert alert-warning d-flex align-items-center gap-3">
            <span>⚠️ {remarksError}</span>
            <button onClick={() => { remarksTriggered.current = false; generateRemarks(); }}
              className="btn-premium-outline ms-auto" style={{ padding: '4px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              ↺ Retry
            </button>
          </div>
        ) : assessment.remarks ? (
          <div style={{ fontFamily: 'var(--font-sans)', lineHeight: 1.7 }}>
            {renderMarkdown(assessment.remarks)}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No AI analysis available for this assessment.</p>
        )}
      </div>

      {/* ─── Feedback ─── */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Report Feedback</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
          Rate the quality of the AI analysis and recommendations.
        </p>

        {feedbackSubmitted ? (
          <div style={{ background: 'var(--green-glow-sm)', border: '1px solid rgba(46,160,67,0.2)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
            <div style={{ fontWeight: 700, color: 'var(--green-bright)', marginBottom: '10px' }}>✓ Feedback submitted</div>
            <div className="d-flex gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ fontSize: '1.4rem', color: i < rating ? '#f5a623' : 'var(--border-subtle)', transition: 'color 0.1s' }}>★</span>
              ))}
            </div>
            {comments && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', borderLeft: '2px solid var(--border-subtle)', paddingLeft: '12px', margin: 0 }}>
                "{comments}"
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit}>
            <div className="mb-4">
              <label className="form-label" style={{ display: 'block', marginBottom: '10px' }}>
                Rating <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>(click a star)</span>
              </label>
              <div className="d-flex gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoveredStar(s)}
                    onMouseLeave={() => setHoveredStar(0)}
                    style={{
                      fontSize: '1.8rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0 3px',
                      lineHeight: 1,
                      color: s <= displayRating ? '#f5a623' : 'var(--border-subtle)',
                      transition: 'color 0.1s, transform 0.1s',
                      transform: s <= displayRating ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    ★
                  </button>
                ))}
                {rating > 0 && (
                  <span style={{ alignSelf: 'center', marginLeft: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
                  </span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="comments" className="form-label">Comments (optional)</label>
              <textarea
                id="comments" rows={3} className="form-control"
                placeholder="What could be improved in the analysis?"
                value={comments} onChange={e => setComments(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-premium" disabled={submittingFeedback || rating === 0}
              style={{ opacity: rating === 0 ? 0.5 : 1 }}>
              {submittingFeedback
                ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
                : 'Submit Feedback'}
            </button>
            {rating === 0 && <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select a rating to enable submit</span>}
          </form>
        )}
      </div>
    </div>
  );
}
