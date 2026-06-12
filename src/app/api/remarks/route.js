import { NextResponse } from 'next/server';
import { getSettings, getQuestions } from '@/lib/db';

// ──────────────────────────────────────────────────────────────────
// Local Expert Rule-based generator (fallback/offline)
// ──────────────────────────────────────────────────────────────────
function generateExpertRemarks(scores, answers, questions) {
  const areaMaturities = {};
  let totalScore = 0;
  let numAreas = 0;

  const levelNames = {
    0: "L0: Traditional",
    1: "L1: Assisted/Tool",
    2: "L2: Delegated/Assistant",
    3: "L3: Supervised Agent/Factory",
    4: "L4: Autonomous Agent/Workforce",
    5: "L5: Agentic Enterprise"
  };

  for (const area in scores) {
    const score = scores[area];
    totalScore += score;
    numAreas++;
    let classification = "L0: Traditional";
    if (score >= 4.5) classification = "L5: Agentic Enterprise";
    else if (score >= 3.5) classification = "L4: Autonomous Agent/Workforce";
    else if (score >= 2.5) classification = "L3: Supervised Agent/Factory";
    else if (score >= 1.5) classification = "L2: Delegated/Assistant";
    else if (score >= 0.5) classification = "L1: Assisted/Tool";
    areaMaturities[area] = { score: score.toFixed(1), classification };
  }

  const overallAvg = numAreas > 0 ? (totalScore / numAreas) : 0;
  let overallClass = "L0: Traditional";
  if (overallAvg >= 4.5) overallClass = "L5: Agentic Enterprise";
  else if (overallAvg >= 3.5) overallClass = "L4: Autonomous Agent/Workforce";
  else if (overallAvg >= 2.5) overallClass = "L3: Supervised Agent/Factory";
  else if (overallAvg >= 1.5) overallClass = "L2: Delegated/Assistant";
  else if (overallAvg >= 0.5) overallClass = "L1: Assisted/Tool";

  const strengths = [];
  const gaps = [];
  const toolsUsedList = new Set();
  const commentsList = [];

  for (const qId in answers) {
    const ans = answers[qId];
    const q = questions.find(question => question.id === parseInt(qId));
    if (q) {
      if (ans.toolsUsed && Array.isArray(ans.toolsUsed)) {
        ans.toolsUsed.forEach(t => { if (t) toolsUsedList.add(t); });
      } else if (ans.toolsUsed && typeof ans.toolsUsed === 'string' && ans.toolsUsed.trim()) {
        toolsUsedList.add(ans.toolsUsed.trim());
      }
      if (ans.practiceDescription && ans.practiceDescription.trim()) {
        commentsList.push(`- **[${q.area} / ${q.subArea || q.practice}]**: "${ans.practiceDescription.trim()}"`);
      }
      const level = parseInt(ans.level) || 0;
      if (level >= 3) {
        strengths.push({ area: q.area, subArea: q.subArea, practice: q.practice, level: levelNames[level] });
      } else if (level <= 1) {
        gaps.push({ area: q.area, subArea: q.subArea, practice: q.practice, level: levelNames[level] });
      }
    }
  }

  let md = `### 🤖 AI Agent Audit Report: SDLC Maturity Analysis\n\n**Overall Maturity Rating:** \`${overallClass}\` (Average Score: \`${overallAvg.toFixed(2)}/5.0\`)\n\n---\n\n#### 📊 Maturity Matrix by SDLC Lifecycle Stage:\n`;

  for (const area in areaMaturities) {
    const data = areaMaturities[area];
    md += `- **${area}**: Score \`${data.score}/5.0\` — *${data.classification}*\n`;
  }

  md += `\n---\n\n#### 🌟 Key Capabilities & Strengths (Rated L3 or Above):\n`;
  if (strengths.length > 0) {
    strengths.slice(0, 4).forEach(s => {
      md += `- **[${s.area} / ${s.subArea}]** Achieved **${s.level}** in *${s.practice}*.\n`;
    });
  } else {
    md += `- *No areas currently meet the Supervised Agent (L3) threshold.*\n`;
  }

  md += `\n---\n\n#### ⚠️ Significant Maturity Gaps (Rated L1 or Below):\n`;
  if (gaps.length > 0) {
    gaps.slice(0, 4).forEach(g => {
      md += `- **[${g.area} / ${g.subArea}]** Currently at **${g.level}** for *${g.practice}*. Needs structural orchestration.\n`;
    });
  } else {
    md += `- *No critical gaps identified! All capability streams show assisted/delegated operations or higher.*\n`;
  }

  md += `\n---\n\n#### 🛠️ AI Tools Inventory Audited:\n`;
  if (toolsUsedList.size > 0) {
    md += `Integrated Tools: ${Array.from(toolsUsedList).map(t => `\`${t}\``).join(', ')}\n`;
  } else {
    md += `*No AI tools declared during assessment.*\n`;
  }

  if (commentsList.length > 0) {
    md += `\n---\n\n#### 📝 User-Provided Practice Descriptions:\n`;
    commentsList.forEach(c => {
      md += `${c}\n`;
    });
  }

  md += `\n---\n\n#### 💡 Strategic Engineering Action Plan:\n`;
  for (const area in scores) {
    const score = scores[area];
    if (score < 2) {
      if (area === 'Requirements') {
        md += `1. **Requirements Modernization**: Transition from manual backlog drafting to **L2/L3 Agentic Decomposition**. Start utilizing AI for processing meeting transcripts directly into structured user stories with pre-written acceptance criteria.\n`;
      } else if (area === 'Architecture') {
        md += `2. **Architecture Governance**: Adopt automated **Drift Detection in PRs**. Configure agents to read your codebase structure and automatically cross-reference changes against design compliance maps.\n`;
      } else if (area === 'Development') {
        md += `3. **Development Acceleration**: Move beyond simple autocomplete (L1) toward **Agentic Code Review & Pull Request generation** (L2/L3). Integrate agents into your IDE using MCP (Model Context Protocol).\n`;
      } else if (area === 'Testing') {
        md += `4. **Testing Orchestration**: Introduce **Agent-generated Test Suites**. Integrate scripts that autonomously mock edge-cases and schema definitions.\n`;
      } else if (area === 'Deployment') {
        md += `5. **Deployment Autonomy**: Set up automated **RCA** and **Release Note Generation** from commit logs. Allow pipeline agents to classify build errors and suggest code fixes directly in CI.\n`;
      }
    }
  }

  if (overallAvg >= 3.0) {
    md += `\n**Direct Agent Remark:** Your organization shows high-tier AI maturity. The next step is scaling to L4 (Autonomous Workforces) by establishing multi-agent orchestrators (e.g. CrewAI, LangGraph) with automated rollbacks and safety guardrails.\n`;
  } else {
    md += `\n**Direct Agent Remark:** Your organization is transitioning from **Assisted (L1)** to **Delegated (L2)** operations. Focus on integrating agent steps directly into the CI/CD pipeline to automate code auditing and test script creation.\n`;
  }

  return md;
}

// ──────────────────────────────────────────────────────────────────
// POST /api/remarks
// ──────────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { scores, answers } = await request.json();
    if (!scores || !answers) {
      return NextResponse.json({ message: 'Missing scores or answers data' }, { status: 400 });
    }

    // Load questions and settings from MySQL
    const [questions, settings] = await Promise.all([getQuestions(), getSettings()]);
    const expertRemarks = generateExpertRemarks(scores, answers, questions);

    // Build a SHORT, per-area prompt for Llama incorporating comments and tool details
    let areaContext = '';
    for (const area of ['Requirements', 'Architecture', 'Development', 'Testing', 'Deployment']) {
      areaContext += `### ${area} (Score: ${(scores[area] || 0).toFixed(1)}/5)\n`;
      const areaQs = questions.filter(q => q.area === area);
      let detailsCount = 0;
      areaQs.forEach(q => {
        const ans = answers[q.id] || answers[String(q.id)];
        if (ans && ans.level !== null) {
          const tools = ans.toolsUsed && ans.toolsUsed.length > 0 ? `, Tools: ${ans.toolsUsed.join(', ')}` : '';
          const desc = ans.practiceDescription ? `\n   - User comment: "${ans.practiceDescription}"` : '';
          if (ans.practiceDescription || (ans.toolsUsed && ans.toolsUsed.length > 0) || ans.level > 0) {
            areaContext += `- Practice: "${q.practice}" (Level L${ans.level}${tools})${desc}\n`;
            detailsCount++;
          }
        }
      });
      if (detailsCount === 0) {
        areaContext += `No specific AI practices reported.\n`;
      }
      areaContext += `\n`;
    }

    const systemPrompt = `You are an SDLC AI maturity auditor.
Given the detailed scores, tools, and user practice descriptions below, write ONE short paragraph per area (2-3 sentences max).
For each area: state the current level, and make sure to explicitly consider and address the user's specific practice descriptions/comments and tools used in that area, suggesting one specific next step. Be direct, contextual, and actionable. No fluff.

Detailed Area Context:
${areaContext}

Format exactly like this for each area:
## [Area Name]
[2-3 sentence paragraph]

Only output the 5 area sections. Nothing else.`;


    // ── Determine active provider from settings ──
    const ollamaUrl   = settings.ollamaUrl   || process.env.OLLAMA_URL   || 'http://localhost:11434';
    const ollamaModel = settings.ollamaModel  || process.env.OLLAMA_MODEL || 'llama3';
    const activeProvider = settings.activeAIProvider || 'expert';

    // ── 1. EXPERT mode: return immediately — no external AI call ──
    if (activeProvider === 'expert') {
      console.log('[Remarks] Expert (rule-based) mode selected — skipping AI providers');
      return NextResponse.json({ remarks: expertRemarks, provider: 'expert' });
    }

    // ── 2. Validate API key is present for cloud providers ──
    if (activeProvider === 'openai' && !settings.apiKeys?.openai?.trim()) {
      console.warn('[Remarks] OpenAI selected but API key is not configured');
      return NextResponse.json({
        message: 'OpenAI API key is not configured. Please add it in Admin → AI Configuration → API Keys, then save settings.',
        provider: null
      }, { status: 400 });
    }
    if (activeProvider === 'gemini' && !settings.apiKeys?.gemini?.trim()) {
      console.warn('[Remarks] Gemini selected but API key is not configured');
      return NextResponse.json({
        message: 'Google Gemini API key is not configured. Please add it in Admin → AI Configuration → API Keys, then save settings.',
        provider: null
      }, { status: 400 });
    }

    let generatedRemarksText = null;
    let finalProviderName = null;

    // ── 3a. OLLAMA (Local LLM) ─────────────────────────────────────────────
    if (activeProvider === 'ollama') {
      try {
        console.log(`[Remarks] Calling Ollama at ${ollamaUrl} (model: ${ollamaModel})…`);
        const ollamaRes = await fetch(`${ollamaUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ollamaModel,
            prompt: systemPrompt,
            stream: false,
            options: { temperature: 0.2, num_predict: 400 }
          }),
          signal: AbortSignal.timeout(120000)
        });
        if (ollamaRes.ok) {
          const data = await ollamaRes.json();
          if (data.response && data.response.trim()) {
            console.log(`[Remarks] Ollama responded (${data.response.length} chars)`);
            generatedRemarksText = data.response;
            finalProviderName = `ollama-${ollamaModel}`;
          }
        } else {
          console.warn(`[Remarks] Ollama HTTP ${ollamaRes.status}`);
        }
      } catch (e) {
        console.warn('[Remarks] Ollama unreachable —', e.message);
      }
    }

    // ── 3b. OPENAI ─────────────────────────────────────────────────────────
    if (activeProvider === 'openai') {
      try {
        console.log('[Remarks] Calling OpenAI (gpt-4-turbo)…');
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${settings.apiKeys.openai}`
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo',
            messages: [{ role: 'user', content: systemPrompt }],
            temperature: 0.2,
            max_tokens: 600
          }),
          signal: AbortSignal.timeout(30000)
        });
        if (openaiRes.ok) {
          const data = await openaiRes.json();
          const text = data.choices?.[0]?.message?.content;
          if (text && text.trim()) {
            console.log('[Remarks] OpenAI responded');
            generatedRemarksText = text;
            finalProviderName = 'openai-gpt4';
          }
        } else {
          const err = await openaiRes.text();
          console.warn(`[Remarks] OpenAI error ${openaiRes.status}: ${err}`);
        }
      } catch (e) {
        console.warn('[Remarks] OpenAI call failed —', e.message);
      }
    }

    // ── 3c. GEMINI ─────────────────────────────────────────────────────────
    if (activeProvider === 'gemini') {
      const geminiModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.5-flash'];
      for (const model of geminiModels) {
        try {
          console.log(`[Remarks] Calling Gemini (${model})…`);
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${settings.apiKeys.gemini}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] }),
              signal: AbortSignal.timeout(30000)
            }
          );
          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim()) {
              console.log(`[Remarks] Gemini (${model}) responded successfully`);
              generatedRemarksText = text;
              finalProviderName = model;
              break;
            }
          } else {
            const err = await geminiRes.text();
            console.warn(`[Remarks] Gemini (${model}) failed with status ${geminiRes.status}: ${err}`);
          }
        } catch (e) {
          console.warn(`[Remarks] Gemini (${model}) call failed —`, e.message);
        }
      }
    }

    // ── 4. Return AI result if provider succeeded ──────────────────────────
    if (generatedRemarksText) {
      return NextResponse.json({ remarks: generatedRemarksText, provider: finalProviderName });
    }

    // ── 5. Provider was selected but call failed — expert fallback with warning ──
    console.log(`[Remarks] ${activeProvider} failed — using expert engine as graceful fallback`);
    const fallbackNote = `> ⚠️ **Notice:** The selected AI provider (\`${activeProvider}\`) could not generate remarks. Please verify your API key / server connection in Admin → AI Configuration. Showing rule-based analysis below.\n\n`;
    return NextResponse.json({
      remarks: fallbackNote + expertRemarks,
      provider: 'expert-fallback'
    });


  } catch (error) {
    console.error('Remarks API Error:', error);
    return NextResponse.json({ message: 'Server error generating remarks' }, { status: 500 });
  }
}
