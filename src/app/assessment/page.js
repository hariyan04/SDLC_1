'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';

export default function Assessment() {
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentArea, setCurrentArea] = useState('Requirements');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [projectName, setProjectName] = useState('SDLC Assessment');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customToolInput, setCustomToolInput] = useState('');
  const [showPartialConfirm, setShowPartialConfirm] = useState(false);

  const router = useRouter();
  const areas = ['Requirements', 'Architecture', 'Development', 'Testing', 'Deployment'];
  const AREA_ICONS = { Requirements: '📋', Architecture: '🏗️', Development: '💻', Testing: '🧪', Deployment: '🚀' };

  const levelOptions = [
    { level: 0, title: 'L0: Traditional',           desc: 'No AI integration; entirely manual workflows.' },
    { level: 1, title: 'L1: Assisted/Tool',          desc: 'Ad-hoc autocomplete, chat assistants, and manual prompts.' },
    { level: 2, title: 'L2: Delegated/Assistant',    desc: 'Copilot integrations, draft outlines, delegated micro-tasks.' },
    { level: 3, title: 'L3: Supervised Agent',       desc: 'Multi-agent frameworks with human approval gates.' },
    { level: 4, title: 'L4: Autonomous Workforce',   desc: 'Long-running autonomous agents with rollback protections.' },
    { level: 5, title: 'L5: Agentic Enterprise',     desc: 'Self-healing deployments and self-optimizing pipelines.' },
  ];

  const defaultToolsPerLevel = {
    0: [],
    1: ['GitHub Copilot', 'ChatGPT', 'Claude', 'Gemini', 'Tabnine', 'Amazon Q'],
    2: ['Cursor', 'Cline', 'Continue.dev', 'Roo Code', 'Aider', 'Supermaven'],
    3: ['Devin', 'Antigravity IDE', 'SWE-agent', 'OpenDevin', 'MetaGPT', 'AutoGPT'],
    4: ['LangGraph Agents', 'CrewAI Workforce', 'Microsoft Autogen', 'Custom Multi-Agent Pipeline'],
    5: ['Cognitive Agent Networks', 'Autonomous Enterprise Engine', 'Dynamic Pipeline Agents'],
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'admin' || user.email === 'admin@sdlc.com') {
        router.push('/admin');
      } else {
        loadQuestions();
      }
    }
  }, [user, authLoading, router]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (err) {
      console.error('Error loading questionnaire:', err);
    } finally {
      setLoading(false);
    }
  };

  const areaQuestions = questions.filter(q => q.area === currentArea);
  
  // Safe bounded question index to avoid out-of-bounds indexing during area state transitions
  const safeQuestionIndex = currentQuestionIndex >= areaQuestions.length ? 0 : currentQuestionIndex;
  
  const currentQuestion = areaQuestions[safeQuestionIndex];
  const currentAnswer = currentQuestion
    ? (answers[currentQuestion.id] || { level: null, toolsUsed: [] })
    : { level: null, toolsUsed: [] };

  // Fix: NO auto-selection of tools — always start with empty toolsUsed
  const handleLevelSelect = (level) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        level,
        toolsUsed: prev[currentQuestion.id]?.toolsUsed || [], // preserve existing tool selections
      }
    }));
  };

  const handleToolToggle = (tool) => {
    if (!currentQuestion) return;
    const tools = [...currentAnswer.toolsUsed];
    const idx = tools.indexOf(tool);
    if (idx > -1) tools.splice(idx, 1);
    else tools.push(tool);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: { ...currentAnswer, toolsUsed: tools }
    }));
  };

  const handleAddCustomTool = (e) => {
    e.preventDefault();
    if (!currentQuestion) return;
    const tool = customToolInput.trim();
    if (!tool || currentAnswer.toolsUsed.includes(tool)) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: { ...currentAnswer, toolsUsed: [...currentAnswer.toolsUsed, tool] }
    }));
    setCustomToolInput('');
  };

  const handleNext = () => {
    if (currentQuestion) {
      const currentAns = answers[currentQuestion.id];
      const desc = currentAns?.practiceDescription || '';
      const wordCount = desc.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 100) {
        alert('Practice description must be below 100 words.');
        return;
      }
    }
    if (safeQuestionIndex < areaQuestions.length - 1) {
      setCurrentQuestionIndex(safeQuestionIndex + 1);
    } else {
      const nextIdx = areas.indexOf(currentArea) + 1;
      if (nextIdx < areas.length) {
        setCurrentArea(areas[nextIdx]);
        setCurrentQuestionIndex(0);
      }
    }
  };

  const handlePrev = () => {
    if (safeQuestionIndex > 0) {
      setCurrentQuestionIndex(safeQuestionIndex - 1);
    } else {
      const prevIdx = areas.indexOf(currentArea) - 1;
      if (prevIdx >= 0) {
        setCurrentArea(areas[prevIdx]);
        const prevAreaQs = questions.filter(q => q.area === areas[prevIdx]);
        setCurrentQuestionIndex(prevAreaQs.length - 1);
      }
    }
  };

  const totalQuestionsCount = questions.length;
  const answeredQuestionsCount = Object.keys(answers).filter(id => answers[id].level !== null).length;
  const overallProgressPercent = totalQuestionsCount > 0
    ? Math.round((answeredQuestionsCount / totalQuestionsCount) * 100) : 0;

  const getAreaProgress = (areaName) => {
    const areaQIds = questions.filter(q => q.area === areaName).map(q => q.id);
    const answered = Object.keys(answers).filter(
      id => areaQIds.includes(parseInt(id)) && answers[id].level !== null
    ).length;
    return { total: areaQIds.length, answered, percent: areaQIds.length > 0 ? Math.round((answered / areaQIds.length) * 100) : 0 };
  };

  // Save assessment FIRST → redirect immediately → remarks generated async on report page
  const doSubmitAssessment = async () => {
    setShowPartialConfirm(false);
    setSubmitting(true);
    try {
      console.log('[Assessment] Starting submission, answeredCount:', answeredQuestionsCount);

      // Calculate scores — divide by total questions in each area (unanswered default to L0)
      const scores = {};
      areas.forEach(area => {
        const areaQ = questions.filter(q => q.area === area);
        let areaSum = 0;
        areaQ.forEach(q => {
          const ans = answers[q.id];
          if (ans && ans.level !== null && ans.level !== undefined) {
            const levelVal = parseInt(ans.level);
            if (!isNaN(levelVal)) { areaSum += levelVal; }
          }
        });
        // Divide by the total number of questions in this area (unanswered default to L0)
        scores[area] = areaQ.length > 0 ? areaSum / areaQ.length : 0;
      });

      // Overall score — based on total questions (unanswered default to L0)
      let sumLevels = 0;
      questions.forEach(q => {
        const ans = answers[q.id];
        if (ans && ans.level !== null && ans.level !== undefined) {
          const levelVal = parseInt(ans.level);
          if (!isNaN(levelVal)) { sumLevels += levelVal; }
        }
      });
      const overallScore = questions.length > 0
        ? Math.round((sumLevels / (questions.length * 5)) * 100) : 0;

      console.log('[Assessment] Scores calculated:', scores, 'overall:', overallScore);

      // Save assessment WITHOUT waiting for AI remarks — redirect immediately
      const saveRes = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, answers, scores, overallScore, remarks: null })
      });
      const saveData = await saveRes.json();
      console.log('[Assessment] Save response:', saveRes.status, saveData);
      if (!saveRes.ok) throw new Error(saveData.message || 'Failed to save report');

      // Redirect immediately — report page will generate remarks
      console.log('[Assessment] Navigating to report:', saveData.assessment.id);
      router.push(`/report/${saveData.assessment.id}?generating=1`);
    } catch (err) {
      console.error('[Assessment] Error submitting assessment:', err);
      setSubmitting(false);
      // Show error inline
      alert(err.message || 'Error saving assessment. Please try again.');
    }
  };

  const handleSubmitAssessment = () => {
    console.log('[Assessment] Generate Report clicked');
    // Validate descriptions
    const invalidDescriptions = Object.keys(answers).filter(id => {
      if (!answers[id]) return false;
      const desc = answers[id].practiceDescription || '';
      const count = desc.trim().split(/\s+/).filter(Boolean).length;
      return count > 100;
    });
    if (invalidDescriptions.length > 0) {
      alert('One or more practice descriptions exceed the 100-word limit. Please shorten them before submitting.');
      return;
    }
    if (answeredQuestionsCount === 0) {
      alert('Please answer at least one question before generating a report.');
      return;
    }
    // If not all questions answered, show inline confirmation
    if (answeredQuestionsCount < totalQuestionsCount) {
      setShowPartialConfirm(true);
      return;
    }
    doSubmitAssessment();
  };

  if (authLoading || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border mb-3" role="status"><span className="visually-hidden">Loading…</span></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading questionnaire…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-4 fade-in">
      {/* ─── Sidebar ─── */}
      <div className="col-lg-3 col-12">
        <div className="glass-panel sticky-lg-top" style={{ top: '72px', padding: '20px', zIndex: 10 }}>
          <p className="section-title mb-3">Assessment</p>


          {/* Overall progress */}
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Overall Progress</span>
              <span style={{ color: 'var(--green-bright)', fontWeight: 700 }}>{overallProgressPercent}%</span>
            </div>
            <div className="progress mb-1"><div className="progress-bar" style={{ width: `${overallProgressPercent}%` }} /></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              {answeredQuestionsCount}/{totalQuestionsCount} answered
            </div>
          </div>

          {/* Area Navigation */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            {areas.map(area => {
              const prog = getAreaProgress(area);
              const isActive = area === currentArea;
              const isDone = prog.answered === prog.total && prog.total > 0;
              return (
                <button key={area}
                  onClick={() => { setCurrentArea(area); setCurrentQuestionIndex(0); }}
                  style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '9px 12px', marginBottom: '4px', borderRadius: 'var(--radius-md)',
                    border: isActive ? '1px solid var(--green-primary)' : '1px solid transparent',
                    background: isActive ? 'var(--green-glow)' : 'transparent',
                    color: isActive ? 'var(--green-bright)' : isDone ? 'var(--green-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500, fontSize: '0.88rem', cursor: 'pointer',
                    transition: 'all var(--transition)',
                  }}
                >
                  <span>{AREA_ICONS[area]} {area}</span>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    color: isDone ? 'var(--green-bright)' : isActive ? 'var(--green-primary)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {isDone ? '✓' : `${prog.answered}/${prog.total}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Generate Report Button + partial-answer confirmation */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '12px' }}>
            {showPartialConfirm ? (
              <div style={{ background: 'rgba(210, 153, 34, 0.08)', border: '1px solid rgba(210, 153, 34, 0.3)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '8px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 10px' }}>
                  You have answered <strong style={{ color: 'var(--text-primary)' }}>{answeredQuestionsCount}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalQuestionsCount}</strong> questions. Unanswered ones default to L0.
                </p>
                <div className="d-flex gap-2">
                  <button
                    onClick={doSubmitAssessment}
                    className="btn-premium"
                    style={{ flex: 1, padding: '7px', fontSize: '0.8rem' }}
                    disabled={submitting}
                  >
                    {submitting ? <span className="spinner-border spinner-border-sm" /> : 'Yes, continue'}
                  </button>
                  <button
                    onClick={() => setShowPartialConfirm(false)}
                    className="btn-premium-outline"
                    style={{ flex: 1, padding: '7px', fontSize: '0.8rem' }}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSubmitAssessment}
                className="btn-premium w-100 justify-content-center"
                style={{ padding: '11px', fontSize: '0.9rem' }}
                disabled={submitting}
              >
                {submitting
                  ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Saving…</>
                  : '📊 Generate Report'}
              </button>
            )}
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '8px', marginBottom: 0 }}>
              AI analysis runs on the report page
            </p>
          </div>
        </div>
      </div>

      {/* ─── Main Question Panel ─── */}
      <div className="col-lg-9 col-12">
        <div className="glass-panel" style={{ padding: '32px', minHeight: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

          {currentQuestion ? (
            <div>
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="tuf-badge tuf-badge-green">{currentArea}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {safeQuestionIndex + 1} / {areaQuestions.length}
                </span>
              </div>

              {/* Area progress bar */}
              <div className="mb-4">
                <div className="progress" style={{ height: '4px' }}>
                  <div className="progress-bar" style={{ width: `${((safeQuestionIndex + 1) / areaQuestions.length) * 100}%` }} />
                </div>
              </div>

              {/* Question Navigation Pagination */}
              <div className="d-flex flex-wrap gap-2 mb-4" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                {areaQuestions.map((q, idx) => {
                  const isAnswered = answers[q.id]?.level !== null && answers[q.id]?.level !== undefined;
                  const isActive = idx === safeQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        border: isActive 
                          ? '2px solid var(--green-primary)' 
                          : isAnswered 
                            ? '1px solid rgba(46, 213, 115, 0.4)' 
                            : '1px solid var(--border-subtle)',
                        background: isActive 
                          ? 'var(--green-glow)' 
                          : isAnswered 
                            ? 'rgba(46, 213, 115, 0.08)' 
                            : 'var(--bg-elevated)',
                        color: isActive 
                          ? 'var(--green-bright)' 
                          : isAnswered 
                            ? 'var(--green-primary)' 
                            : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all var(--transition)',
                        boxShadow: isActive ? '0 0 10px rgba(46, 213, 115, 0.2)' : 'none'
                      }}
                      title={`${q.subArea} - ${q.practice}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Sub-area context */}
              <div style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                borderLeft: '3px solid var(--green-primary)', borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                padding: '12px 16px', marginBottom: '24px',
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Sub-area · Practice
                </div>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{currentQuestion.subArea}</span>
                {currentQuestion.practice && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> · {currentQuestion.practice}</span>
                )}
              </div>

              {/* Question Text */}
              <h2 style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.65, color: 'var(--text-primary)', marginBottom: '24px' }}>
                {currentQuestion.questionText}
              </h2>

              {/* Maturity Level Options */}
              <div className="mb-4">
                <div className="section-title mb-3">Select AI Integration Level</div>
                <div className="row g-2">
                  {levelOptions.map(opt => (
                    <div className="col-md-6 col-12" key={opt.level}>
                      <button type="button"
                        onClick={() => handleLevelSelect(opt.level)}
                        className={`maturity-option w-100 ${currentAnswer.level === opt.level ? 'selected' : ''}`}
                      >
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                          border: `2px solid ${currentAnswer.level === opt.level ? 'var(--green-primary)' : 'var(--border-subtle)'}`,
                          background: currentAnswer.level === opt.level ? 'var(--green-primary)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {currentAnswer.level === opt.level && (
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff' }} />
                          )}
                        </div>
                        <div>
                          <strong style={{ display: 'block', marginBottom: '3px', fontSize: '0.88rem', color: currentAnswer.level === opt.level ? 'var(--green-bright)' : 'var(--text-primary)' }}>
                            {opt.title}
                          </strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{opt.desc}</span>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tool Selection — only shown when level > 0 is selected */}
              {currentAnswer.level !== null && currentAnswer.level > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                  <div className="section-title mb-3">AI Tools Used at this Level (optional)</div>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {(defaultToolsPerLevel[currentAnswer.level] || []).map(tool => {
                      const isChecked = currentAnswer.toolsUsed.includes(tool);
                      return (
                        <button key={tool} type="button" onClick={() => handleToolToggle(tool)}
                          style={{
                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                            border: `1px solid ${isChecked ? 'var(--green-primary)' : 'var(--border-subtle)'}`,
                            background: isChecked ? 'var(--green-glow)' : 'var(--bg-elevated)',
                            color: isChecked ? 'var(--green-bright)' : 'var(--text-secondary)',
                            cursor: 'pointer', transition: 'all var(--transition)',
                          }}
                        >
                          {isChecked ? '✓ ' : ''}{tool}
                        </button>
                      );
                    })}
                  </div>
                  <form onSubmit={handleAddCustomTool} className="d-flex gap-2" style={{ maxWidth: '360px' }}>
                    <input type="text" className="form-control" style={{ fontSize: '0.85rem', padding: '7px 12px' }}
                      placeholder="Add custom tool…" value={customToolInput}
                      onChange={e => setCustomToolInput(e.target.value)} />
                    <button type="submit" className="btn-premium-outline" style={{ padding: '7px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                      + Add
                    </button>
                  </form>
                  {currentAnswer.toolsUsed.filter(t => !(defaultToolsPerLevel[currentAnswer.level] || []).includes(t)).length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      {currentAnswer.toolsUsed
                        .filter(t => !(defaultToolsPerLevel[currentAnswer.level] || []).includes(t))
                        .map(t => (
                          <span key={t} className="tuf-badge tuf-badge-gray">
                            {t}
                            <span style={{ cursor: 'pointer', marginLeft: '6px', opacity: 0.7 }}
                              onClick={() => handleToolToggle(t)}>×</span>
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Practice Description — optional, shown when a level is selected */}
              {currentAnswer.level !== null && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '20px' }}>
                  <div className="section-title mb-2">Practice Description (optional)</div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Enter comments or information relating to the question or the AI agents used. Maximum 100 words.
                  </p>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Describe your current practice or specific usage details..."
                    value={currentAnswer.practiceDescription || ''}
                    onChange={(e) => {
                      const text = e.target.value;
                      setAnswers(prev => ({
                        ...prev,
                        [currentQuestion.id]: {
                          ...currentAnswer,
                          practiceDescription: text
                        }
                      }));
                    }}
                  />
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Do not exceed 100 words.
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: ((currentAnswer.practiceDescription || '').trim().split(/\s+/).filter(Boolean).length) > 100 ? 'var(--danger)' : 'var(--text-secondary)'
                    }}>
                      {((currentAnswer.practiceDescription || '').trim().split(/\s+/).filter(Boolean).length)} / 100 words
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
              <div className="spinner-border" role="status"><span className="visually-hidden">Loading…</span></div>
            </div>
          )}

          {/* Navigation */}
          <div className="d-flex justify-content-between align-items-center mt-5 pt-4"
            style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button onClick={handlePrev} className="btn-premium-outline"
              disabled={currentArea === 'Requirements' && safeQuestionIndex === 0}>
              ← Prev
            </button>
            {currentQuestion && currentAnswer.level === null && (
              <span style={{ fontSize: '0.8rem', color: 'var(--warning-color)' }}>
                ⚠️ Select a level to continue
              </span>
            )}
            <button onClick={handleNext} className="btn-premium"
              disabled={currentArea === 'Deployment' && safeQuestionIndex === areaQuestions.length - 1}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
